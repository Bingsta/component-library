import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import * as router from 'plugins/router';
import * as UIController from 'UIController';
import * as $ from 'jquery';
import 'dataTablesFixedColumns';
import 'dataTablesFixedHeader';
import * as moment from '../../../node_modules/moment/moment';


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
      // this.searchText.subscribe((value)=> {
      //   console.log(value);
      //   self.table.search(value).draw();

      //   //reapply ko bindings
      //   ko.cleanNode(document.getElementById("main-table"));
      //   ko.applyBindings(self, document.getElementById("main-table"));
      //   self.refreshTable();
      // });
    
    }

    compositionComplete() {

        this.getData('/dist/data/moneyDueIn.json').then((data) => {
          this.data(data);

          let tableContainer = document.getElementById("app-main-table__container"),
          table = document.getElementById("example");

          console.log($(tableContainer).height());
          this.table = $(table).DataTable( {
              scrollY:        ($(tableContainer).height()-41),
              scrollX:        true,
              scrollCollapse: true,
              paging:         false,
              searching:      false,
              info:           false,
              data:           this.data(),
              columns: [
                { name: 'reference',  data: 'reference' },
                { name: 'owed_by',    data: 'owed_by'},
                { name: 'total',      data: "total" },
                { name: 'bal',        data: 'balance'},
                { name: 'type',       data: 'type',
                  render: function(data) {
                      switch(data){
                        case "Rent demand":
                        return `<span class="label label-warning" data-toggle="tooltip" data-placement="top" title="${data}">RD</span>`;
                        case "Work order":
                        return `<span class="label label-info" data-toggle="tooltip" data-placement="top" title="Invoice">INV</span>`;
                        default:
                          return data;
                      }
                  }
                },
                { name: 'regarding',  data: 'regarding'},
                { name: 'due_on',     data: 'due_on',         type:"date" },
                { name: 'amounts',    data: 'paid',           orderable: false,       className: 'table__fixed-col',
                  render: () => {
                      return `<form class="grid  grid--padded-xs">
                                <div class="grid__item">
                                  <input type="text" style="width:8rem" class="form-control input-xs" placeholder="Amount" data-bind="attr: {id: 'use-bal-input-' + $index() }, value: balance">
                                </div>
                                <div class="grid__item">
                                  <input type="text" style="width:8rem" class="form-control input-xs" placeholder="Amount" data-bind="attr: {id: 'receipt-input-' + $index() }, value: (Math.round((total - paid)*100)/100)">
                                </div>
                                <div class="grid__item grid__item--fill">

                                  <div class="btn-group">
                                    <button type="button" class="btn btn-success btn-xs" data-bind="click:$parent.addReceipt.bind($parent, $index)">Receipt&nbsp;&nbsp;<i class="icon-arrow-right2"></i></button>
                                    <button type="button" class="btn btn-success btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                      <span class="caret"></span>
                                      <span class="sr-only">Toggle Dropdown</span>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-right">
                                      <li><a href="#">Receipt and pay landlord</a></li>
                                      <li role="separator" class="divider"></li>
                                      <li><a href="#">Receipt by cash</a></li>
                                      <li><a href="#">Receipt by check</a></li>
                                    </ul>
                                  </div>
                                  
                                </div>
                              </form>`;
                  } 
                },
                { name: 'notes',      data: 'notes',          orderable: false,     className: 'table__fixed-col',
                render: (data) => {
                  console.log(data);
                  switch(data > 0) {
                    case true:
                      return `<div class="iconCount iconCount-accent">
                                <i class="iconCount__icon icon icon-bubble3"></i>
                                <span class="iconCount__count">${data}</span>
                              </div>`;
                    case false:
                      return `<div class="iconCount">
                                <i class="iconCount__icon icon icon-bubble3"></i>
                                <span class="iconCount__count"></span>
                              </div>`
                  }
                  
                }
               },
                { name: 'options',    data: null,             orderable: false,       className: 'table__fixed-col', 
                  render: () => {
                    return `<button class="btn btn-circle btn-sm btn-default"><i class="icon icon-menu"></i></button>`;
                  } 
                }
              ]
              fixedColumns: {
                rightColumns:   3,
                leftColumns:    0
              }
          } );

          //create table
          // this.table = $("#main-table").DataTable({
          //   fixedColumns:   true,
          //   searching:      true,
          //   paging:         false,
          //   data: this.data().filter(function(item){
          //     return (Math.round((item.total - item.paid)*100)/100) > 0;
          //   }),
          //   order: [[9, "desc"]],
          //   dom: "t",
          //   columns: [
          //       { data: 'reference' },
          //       { data: 'owed_by', render: function(data) {
          //         if(data.length > 15){
          //           return `<span data-toggle="tooltip" data-placement="top" title="${data}">${data.substr(0, 10) + "..."}</span>`;
          //         }
          //         return data;
          //       } },
          //       { data: 'total' },
          //       { data: 'paid' },
          //       { data: 'balance' },
          //       { render: function(data, type, full, meta){
          //         return `<input type="text" class="form-control input-xs" id="use-bal-input-${meta.row}" value="${full.balance}" placeholder="Amount">
          //                 `;
          //           }
          //       },
          //       { render: function(data, type, full, meta){
          //         return `
          //             <form class="grid  grid--padded-sm">
          //               <div class="grid__item">
          //                 <input type="text" class="form-control input-xs" id="receipt-input-${meta.row}" value="${(Math.round((full.total - full.paid)*100)/100)}" placeholder="Amount">
          //               </div>
          //               <div class="grid__item">
          //                 <button type="submit" class="btn btn-success btn-xs" data-bind="click: addReceipt.bind(this, ${meta.row})">Receipt</button>
          //               </div>
          //             </form>`;
          //           }
          //       },
          //       { data: 'type', render: function(data) {
          //           switch(data){
          //             case "Rent demand":
          //             return `<span class="label label-warning" data-toggle="tooltip" data-placement="top" title="${data}">RD</span>`;
          //             case "Work order":
          //             return `<span class="label label-info" data-toggle="tooltip" data-placement="top" title="Invoice">INV</span>`;
          //             default:
          //               return data;
          //           }
          //       } },
          //       { data: 'regarding', render: function(data) {
          //         if(data.length > 20){
          //           return `<span data-toggle="tooltip" data-placement="top" title="${data}">${data.substr(0, 10) + "..."}</span>`;
          //         }
          //         return data;
          //       } },
          //       { type: "date", data: 'due_on' },
          //       { data: 'pay_to', render: function(data) {
          //         if(data.length > 15){
          //           return `<span data-toggle="tooltip" data-placement="top" title="${data}">${data.substr(0, 10) + "..."}</span>`;
          //         }
          //         return data;
          //       } },
          //       { data: 'notes', render: function(data){
          //         return data? `<span class="badge badge-accent">${data}</span>` : '';
          //       } }
          //   ]
          // });

          // this.refreshTable()
          // 
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
        $(value).css({minWidth : $(tHeadTHs[index]).outerWidth()});
      });
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

    public addReceipt(index, invoice, event) {

      let amountReceipted:number = parseFloat($(document.getElementById(`receipt-input-${index()}`)).val() as string);
      let useBalAmount:number = parseFloat($(document.getElementById(`use-bal-input-${index()}`)).val() as string);

      invoice.paid = (Math.round((parseFloat(invoice.paid) + amountReceipted + useBalAmount)*100)/100);
      this.basket.push({
        id: invoice.reference,
        payee: invoice.owed_by,
        amount: amountReceipted,
        invoice: invoice
      });
      console.log(this.data().length);
      this.data.remove(invoice);
      ko.cleanNode(document.getElementById("example"));
      ko.applyBindings({}, document.getElementById("example"));
         
      console.log(this.data().length);
      //this.updateTable();
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
      console.log(self.data().length)
      self.data(self.data().filter(function(item){
        return (Math.round((item.total - item.paid)*100)/100) > 0;
      }))
      
      console.log(self.data().length)
      // self.searchText("");

      // //update table and data model
      // self.table.clear();
      // self.table.rows.add(self.data());
      // self.table.draw();

      // //reapply ko bindings
      // ko.cleanNode(document.getElementById("main-table"));
      // ko.applyBindings(self, document.getElementById("main-table"));
      // self.refreshTable()
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