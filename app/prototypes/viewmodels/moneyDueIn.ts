import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import * as router from 'plugins/router';
import * as UIController from 'UIController';
import * as $ from 'jquery';
import dataTables from 'dataTables.net';
import dataTables_buttons from 'dataTables.net-buttons';
import * as moment from 'moment';


/**
 * MoneyDueIn VM
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

class MoneyDueIn {
    public isLoading:KnockoutObservable<boolean> = ko.observable(false);
    public table;
    public searchText:KnockoutObservable<string> = ko.observable("");
    public data: KnockoutObservableArray<any> = ko.observableArray([]);
    public basket: KnockoutObservableArray<Receipts> = ko.observableArray([]);
    public processEnum = ProcessingState;
    public modeEnum = SelectedMode;
    public receiptsProcessingState: KnockoutObservable<any> = ko.observable(ProcessingState.notStarted);
    public uploadFileProcessingState: KnockoutObservable<any> = ko.observable(ProcessingState.notStarted);
    public selectedModeState: KnockoutObservable<any> = ko.observable(SelectedMode.manual);
    public uiController = UIController.instance;

    activate() {
      let self:MoneyDueIn = this;
        this.isLoading(true);
        this.uiController.hideMenu(true);
        this.searchText.subscribe((value)=> {
          console.log(value);
          self.table.search(value).draw();

          //reapply ko bindings
          ko.cleanNode(document.getElementById("main-table"));
          ko.applyBindings(self, document.getElementById("main-table"));
        });
    }

    compositionComplete() {

        this.getData('/dist/data/moneyDueIn.json').then((data) => {
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
                { data: 'total' },
                { data: 'paid' },
                { render: function(data, type, full, meta){
                  return `
                      <form class="grid  grid--padded-sm">
                        <div class="grid__item">
                          <input type="text" style="width:100px" class="form-control input-xs" id="pay-input-${meta.row}" value="${(Math.round((full.total - full.paid)*100)/100)}" placeholder="Amount">
                        </div>
                        <div class="grid__item">
                          <button type="submit" class="btn btn-success btn-xs" data-bind="click: addReceipt.bind(this, ${meta.row})">Add</button>
                        </div>
                      </form>`;
                    }
                },
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
                { data: 'notes', render: function(data){
                  return data? `<span class="badge badge-accent">${data}</span>` : '';
                } }
            ]
          });
          this.refreshTable()
          ko.applyBindings(this, document.getElementById("main-table"));
        });

      
    }

    
    public refreshTable() {
      let self: MoneyDueIn = this;
      console.log("refresh table");
      let table = $("#main-table");
      let tHeadTHs = table.find(">thead>tr>th");
      let tHead = table.find(">")
      table.find(">tbody").scroll((event) => {
        table.find(">thead").scrollLeft(event.currentTarget.scrollLeft);
      });
      table.find(">tbody>tr:first-child>td").each((index, value) => {
        console.log($(tHeadTHs[index]).outerWidth())
        $(value).css({minWidth : $(tHeadTHs[index]).outerWidth()});
      });
    }

    
    public handleTableScroll(model:ReceiptBankStatement, event: JQueryEventObject) {
      //scroll the thead horizontaly so it appears to stick to the columns
      model.appListThead.scrollLeft(event.currentTarget.scrollLeft);

    }
  
    public selectFile() {
      let self: MoneyDueIn = this;

      this.uploadFileProcessingState(ProcessingState.started);

      //simulate server
      setTimeout(() => {
          self.uploadFileProcessingState(ProcessingState.completed);
      }, 1000);
    }

    public openUploadBankStatementDialog() {
      this.uiController.showModal({
        kind:'uploadBankStatement_form'
      });
    }

    public confirmProcessing() {
      let self: MoneyDueIn = this;

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

    public addReceipt(index:number, model:MoneyDueIn, event:JQueryEventObject) {
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

    public showReceiptDetails(model, event) {
      alert(`Show details for receipt ${model.id}`)
    }

    public removeReceipt(item: Receipts,event: JQueryEventObject){
      let self: MoneyDueIn = this;
      item.invoice.paid = (Math.round((item.invoice.paid - item.amount)*100)/100);
      self.data.push(item.invoice);
      self.basket.splice(self.basket().indexOf(item), 1);
      self.updateTable();
    }

    public updateTable(){
      let self: MoneyDueIn = this;
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
      self.refreshTable()
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

    
    public goToPage(page){
      router.navigate(page);
    }

}

export = MoneyDueIn;