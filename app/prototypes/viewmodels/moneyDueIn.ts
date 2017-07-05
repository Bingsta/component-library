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
    public el_table;
    public el_tableContainer;
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

          this.el_tableContainer = document.getElementById("app-main-table__container"),
          this.el_table = document.getElementById("example");

          console.log($(this.el_tableContainer).height());
          this.table = $(this.el_table).DataTable( {
              scrollY:        ($(this.el_tableContainer).height()-41),
              scrollX:        true,
              scrollCollapse: true,
              paging:         false,
              searching:      false,
              info:           false,
              data:           this.data(),
              drawCallback: () => {
              },
              fixedHeader:    true,
              createdRow: ( row, data, index ) => {
                if(parseFloat(data.arrearsTotal) > 0) {
                  $(row).addClass('danger');
                }
              },
              columns: [
                { name: 'reference',  data: 'reference' },
                { name: 'total',      data: "total" },
                { name: 'regarding',  data: 'regarding'},
                { name: 'owed_by',    data: 'owed_by',
                  render: (data) => {
                    return `<a class="contact__item" href="javascript: void(0)">${data}</a>`
                  }
                },
                { name: 'due_on',     data: 'due_on',         type:"date" },
                { name: 'bal',        data: 'balance',
                  render: (data) => {
                    return `<a class="account__balance" href="javascript: void(0)">${data}</a>`
                  } 
                },
                {
                  name: 'arrears',    data: 'arrearsTotal',
                  render: (data, type, full, meta) => {
                    if(parseFloat(data) > 0) {
                      return `
                      <div class="grid grid--padded-xs">
                        <div class="grid__item">
                          <a  class="account__balance" href="javascript: void(0)">${data}</a>
                        </div>
                        <div class="grid__item">
                          <span class="badge">${full.arrearsCount}</span>
                        </div>
                      </div>`
                    }
                    else {
                      return `0.00`;
                    }
                  }
                },
                { name: 'use_bal',    data: 'balance',        orderable: false,       className: 'table__fixed-col',
                  render: (data, type, full, meta) => {
                    return `
                          <input type="text" style="width:6rem" class="form-control input-xs" placeholder="Amount" id="use-bal-input-${meta.row}" value="${full.balance}">
                        `
                  }
                },
                { name: 'amounts',    data: 'paid',           orderable: false,       className: 'table__fixed-col',
                  render: (data, type, full, meta) => {
                      return `<form class="grid  grid--padded-xs">
                                <div class="grid__item">
                                  <input type="text" style="width:6rem" class="form-control input-xs" placeholder="Amount" id="receipt-input-${meta.row}" value="${(Math.round((full.total - full.paid)*100)/100)}">
                                </div>
                                <div class="grid__item grid__item--fill">

                                  <div class="btn-group">
                                    <button type="button" data-rowIndex="${meta.row}" class="btn btn-success btn-xs  receipt__button">Receipt&nbsp;&nbsp;<i class="icon-arrow-right2"></i></button>
                                    <button type="button" class="btn btn-success btn-xs dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                      <span class="caret"></span>
                                      <span class="sr-only">Toggle Dropdown</span>
                                    </button>
                                    <ul class="dropdown-menu dropdown-menu-right">
                                      <li><a class="receipt_and_pay" href="javascript:void(0)">Receipt and pay landlord</a></li>
                                      <li role="separator" class="divider"></li>
                                      <li><a class="receipt_and_pay" href="javascript:void(0)">Receipt by cash</a></li>
                                      <li><a class="receipt_and_pay" href="javascript:void(0)">Receipt by check</a></li>
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
                      return `<div class="iconCount iconCount-accent  account__notes">
                                <i class="iconCount__icon icon icon-bubble3"></i>
                                <span class="iconCount__count">${data}</span>
                              </div>`;
                    case false:
                      return `<div class="iconCount  account__notes">
                                <i class="iconCount__icon icon icon-bubble3"></i>
                                <span class="iconCount__count"></span>
                              </div>`
                  }
                  
                }
               },
                { name: 'options',    data: null,             orderable: false,       className: 'table__fixed-col', 
                  render: () => {
                    return `
                    <div class="dropdown">
                      <button class="btn btn-circle btn-sm btn-default" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><i class="icon icon-menu"></i></button>
                      <ul class="dropdown-menu dropdown-menu-right">
                        <li><a href="javascript:void(0)">Print invoice</a></li>
                        <li><a href="javascript:void(0)">Email tenant</a></li>
                        <li><a href="javascript:void(0)">Email landlord</a></li>
                      </ul>
                    </div>`;
                  } 
                }
              ],
              fixedColumns: {
                rightColumns:   4,
                leftColumns:    0
              }
          });
    
          this.bindClickHandlers();
          //bind jquery click handler

        });

      
    }
    
    public bindClickHandlers() {
      $('.receipt__button').click(this.addReceipt.bind(this));
      $('.contact__item').click(this.showContact.bind(this));
      $('.account__balance').click(this.showAccountStatement.bind(this));
      $('.account__notes').click(this.showAccountNotes.bind(this));
      $('.receipt_and_pay').click(this.receiptAndPay.bind(this));
    }

    public showContact() {
      alert("show contact details");
    }

    public showAccountStatement() {
      alert("show account statement");
    }

    public showAccountNotes() {
      alert("show account notes stream");
    }

    public receiptAndPay() {
      alert("Show receipt and pay interface");
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

    public addReceipt(event: JQueryEventObject) {
      console.log(event);

      var index = event.currentTarget.getAttribute('data-rowIndex');
      console.log(this);
      let amountReceipted:number = parseFloat($(document.getElementById(`receipt-input-${index}`)).val() as string);
      let useBalAmount:number = parseFloat($(document.getElementById(`use-bal-input-${index}`)).val() as string);
      let invoice = this.data()[index];

      invoice.paid = (Math.round((parseFloat(invoice.paid) + amountReceipted + useBalAmount)*100)/100);
      
      this.basket.push({
        id: invoice.owed_by,
        payee: invoice.owed_by,
        amount: amountReceipted,
        invoice: invoice
      });
      this.updateTable();
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
      self.data(self.table.rows().data().filter(function(item){
        return (Math.round((item.total - item.paid)*100)/100) > 0;
      }))
      
      console.log(self.data().length)
      // self.searchText("");

      //update table and data model
      self.table.clear();

      self.table.rows.add(self.data());
      self.table.draw();
      // self.table.fixedColumns().update();
      
      // self.table.fixedColumns().relayout();
      
      console.log(self.el_tableContainer);
      
      this.bindClickHandlers();
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