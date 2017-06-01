import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import * as globalui from 'global';
import * as $ from 'jquery';
import {dataTables} from 'dataTables';
import {dataTables_buttons} from 'dataTables_buttons';
import * as moment from 'moment';


/**
 * ReceiptBankStatement VM
 */

function Employee ( name, position, salary, office ) {
    this.name = name;
    this.position = position;
    this.salary = salary;
    this._office = office;
    this.office = function () {
        return this._office;
    }
};

interface Receipts {
  id: string,
  payee: string,
  amount: number,
  invoice: any;
}

enum ProcessingState {
  notStarted,
  started,
  completed
}

enum SelectedMode {
  manual,
  bankStatement
}

class ReceiptBankStatement {
    public isLoading:KnockoutObservable<boolean> = ko.observable(false);
    public table;
    public searchText:KnockoutObservable<string> = ko.observable("");
    public data: KnockoutObservableArray<any> = ko.observableArray([]);
    public bankStatementData: KnockoutObservableArray<any> = ko.observableArray([]);
    public basket: KnockoutObservableArray<Receipts> = ko.observableArray([]);
    public processEnum = ProcessingState;
    public modeEnum = SelectedMode;
    public receiptsProcessingState: KnockoutObservable<any> = ko.observable(ProcessingState.notStarted);
    public uploadFileProcessingState: KnockoutObservable<any> = ko.observable(ProcessingState.notStarted);
    public selectedModeState: KnockoutObservable<any> = ko.observable(SelectedMode.manual);
    public selectedItem: KnockoutObservable<any> = ko.observable(null);
    public processReceiptsDisabled: KnockoutComputed<boolean>;

    activate() {
      let self:ReceiptBankStatement = this;
        this.isLoading(true);
        globalui.instance.hideMenu(true);
        this.searchText.subscribe((value)=> {
          console.log(value);
          self.searchTable(value);
        });

        this.selectedItem.subscribe((value) => {
            self.updateTable();
            self.searchForItem(value);
        });

        this.processReceiptsDisabled = ko.computed(() => {
            return this.confirmedItemCount() == 0;
        }, this);
    }

    compositionComplete() {
        let self: ReceiptBankStatement = this;
        this.getData('/dist/data/MoneyDueIn.json').then((data) => {
          this.data(data);
          console.log(this.data());
          //create table
          this.table = $("#main-table").DataTable({
            searching :true,
            paging :false,
            data: this.data().filter(function(item){
              return (Math.round((item.total - item.paid)*100)/100) > 0;
            }),
            dom: "t",
            columns: [
                { data: 'reference' },
                { data: 'owed_by', render: function(data) {
                  if(data.length > 15){
                    return `<span data-toggle="tooltip" data-placement="top" title="${data}">${data.substr(0, 10) + "..."}</span>`;
                  }
                  return data;
                } },
                { data: 'type', render: function(data) {
                    switch(data){
                      case "Rent demand":
                      return `<span class="label label-warning" data-toggle="tooltip" data-placement="top" title="${data}">RD</span>`;
                      case "Work order":
                      return `<span class="label label-info" data-toggle="tooltip" data-placement="top" title="${data}">WO</span>`;
                      default:
                        return data;
                    }
                } },
                { data: 'regarding', render: function(data) {
                  if(data.length > 20){
                    return `<span data-toggle="tooltip" data-placement="top" title="${data}">${data.substr(0, 10) + "..."}</span>`;
                  }
                  return data;
                } },
                { data: 'due_on' },
                { data: 'pay_to', render: function(data) {
                  if(data.length > 15){
                    return `<span data-toggle="tooltip" data-placement="top" title="${data}">${data.substr(0, 10) + "..."}</span>`;
                  }
                  return data;
                } },
                { data: 'total' },
                { data: 'paid' },
                { render: function(data, type, full, meta){
                        let selectedReference = '';
                        
                        if(self.selectedItem()){
                            if(self.selectedItem().matchingInvoice){
                                selectedReference = self.selectedItem().matchingInvoice.reference;
                            }
                        }
                        console.log(selectedReference);
                        let previouslyAllocated = false;

                        self.bankStatementData().forEach(item => {
                            if(item.matchingInvoice && item.matchingInvoice.reference == full.reference){
                                previouslyAllocated = true;
                            }
                        });

                        if(!previouslyAllocated || selectedReference == full.reference){
                            switch(full.status) {
                                case 'auto-allocated':
                                return `<button type="submit" class="btn btn-success btn-sm" data-bind="click: setStatus.bind(this, ${meta.row}, 'confirmed')">Confirm</button> <button type="submit" class="btn btn-default btn-sm" data-bind="click: setStatus.bind(this, ${meta.row}, 'unallocated')">Reallocate</button>`;

                                case 'confirmed':
                                return `<span>Confirmed</span> <a data-bind="click: setStatus.bind(this, ${meta.row}, 'unallocated')">undo</a>`

                                default:
                                return `<button type="submit" class="btn btn-default btn-sm" data-bind="click: setStatus.bind(this, ${meta.row}, 'confirmed')">Allocate</button>`;
                            }
                        }
                        else{
                            return 'Previously allocated';
                        }
                    
                    }
                },
                { data: 'notes', render: function(data){
                  return data? `<span class="badge badge-accent">${data}</span>` : '';
                } }
            ]
          });
          
          ko.applyBindings(this, document.getElementById("main-table"));

          
            this.getData('/dist/data/bankStatement.json').then((data) => {
                data.forEach(statementItem => {
                    let matched = false;
                    this.data().forEach(dueItem => {
                        if(dueItem.status != 'auto-allocated'){
                            if(dueItem.reference == statementItem.reference){
                                matched = true;
                                dueItem.status = 'auto-allocated';
                                statementItem.matchingInvoice = dueItem;
                            }
                            else{
                                dueItem.status = 'unallocated';
                            }
                        }
                    });
                    statementItem.status = ko.observable(matched ? "auto-allocated" : "unallocated");
                });
                this.bankStatementData(data);
                this.selectedItem(this.bankStatementData()[0]);
            });
        });

      
    }
    
    public confirmedItemCount():number {
        let count:number = 0;

        this.bankStatementData().forEach((item) => {
            console.log("processReceiptsDisabled>>>>>>>>>>>>>>");
            console.log(item.status());
            if(item.status() == 'confirmed'){
                count++;
            }
        });

        return count;
    }

    public setStatus(index:number, status:string, model:ReceiptBankStatement, event:JQueryEventObject) {
        let index:number;
        model.data()[index].status = status;
        model.selectedItem().status(status);
        model.selectedItem().matchingInvoice = model.data()[index];
        console.log(model.selectedItem());
        console.log(model.bankStatementData());
        if(status == "confirmed"){
            index = model.bankStatementData().findIndex((element) => {
                return element == model.selectedItem();
            });
            model.selectedItem(model.bankStatementData()[index + 1]);
        }
        model.updateTable();
        model.searchForItem(model.selectedItem());
    }

    public searchTable(value:string) {
        let self: ReceiptBankStatement = this;
        self.table.search(value).draw();

        //reapply ko bindings
        ko.cleanNode(document.getElementById("main-table"));
        ko.applyBindings(self, document.getElementById("main-table"));
    }

    public searchForItem(item) {
        let self: ReceiptBankStatement = this;
        console.log("search for item");
        self.searchText(item.matchingInvoice ? item.matchingInvoice.reference : item.reference);
    }

    public selectItem(item, event){
        let self: ReceiptBankStatement = this;
        self.selectedItem(item);
    }

    public setSelectedBankStatementMode() {
      let self: ReceiptBankStatement = this;
      self.selectedModeState(SelectedMode.bankStatement);
      
      $('#upload-bank-statement-modal').modal('hide');
    }

    public selectFile() {
      let self: ReceiptBankStatement = this;

      this.uploadFileProcessingState(ProcessingState.started);

      //simulate server
      setTimeout(() => {
          self.uploadFileProcessingState(ProcessingState.completed);
      }, 1000);
    }

    public openUploadBankStatementDialog() {
      this.uploadFileProcessingState(ProcessingState.notStarted);
      $('#upload-bank-statement-modal').modal('show');
    }

    public confirmProcessing() {
      let self: ReceiptBankStatement = this;

      this.receiptsProcessingState(ProcessingState.started);

      //simulate server
      setTimeout(() => {
          self.receiptsProcessingState(ProcessingState.completed);
          self.basket([]);
      }, 2000);

    }

    public processReceipts() {
      this.receiptsProcessingState(ProcessingState.notStarted);
      $('#process-receipts-modal').modal('show');
    }

    
    public saveReceipts() {
      console.log("save receipts");
    }

    public addReceipt(index:number, model:ReceiptBankStatement, event:JQueryEventObject) {
      let amount:number = parseFloat($(document.getElementById(`pay-input-${index}`)).val());
      let invoice = model.data()[index];
      console.log(model.data());


      invoice.paid = (Math.round((parseFloat(invoice.paid) + amount)*100)/100);
      model.basket.push({
        id: invoice.reference,
        payee: invoice.owed_by,
        amount: amount,
        invoice: invoice
      });
      
      model.updateTable();
    }

    public removeReceipt(item: Receipts,event: JQueryEventObject){
      let self: ReceiptBankStatement = this;
      item.invoice.paid = (Math.round((item.invoice.paid - item.amount)*100)/100);
      self.data.push(item.invoice);
      self.basket.splice(self.basket().indexOf(item), 1);
      self.updateTable();
    }

    public updateTable(){
      let self: ReceiptBankStatement = this;
      //update data model - filter out row if balance paid
      self.data(self.data().filter(function(item){
        return (Math.round((item.total - item.paid)*100)/100) > 0;
      }))
      
      self.searchText("");

      //update table and data model
      self.table.clear();
      self.table.rows.add(self.data());
      self.table.draw();

      //reapply ko bindings
      ko.cleanNode(document.getElementById("main-table"));
      ko.applyBindings(self, document.getElementById("main-table"));
    }

    public searchData(model, event: JQueryEventObject) {
      console.log(model);
      console.log(event);
      console.log(this);
    }

    public dateFormat(date: string, format: string):string{
      return moment(date, 'DD/MM/YYYY').format(format);
    }

    private getData(src: string):JQueryDeferred<any>{
      return system.defer(function(dfd) {
        $.getJSON(src, function(data) {
          dfd.resolve(data);
        });
      });
    }


}

export = ReceiptBankStatement;