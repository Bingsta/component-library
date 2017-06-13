import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import * as UIController from 'UIController';
import * as $ from 'jquery';
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
    public processEnum = ProcessingState;
    public modeEnum = SelectedMode;
    public receiptsProcessingState: KnockoutObservable<any> = ko.observable(ProcessingState.notStarted);
    public processReceiptsDisabled: KnockoutComputed<boolean>;
    public uiController = UIController.instance;

    public appListThead = null;

    public tenants: KnockoutObservableArray<any> = ko.observableArray([]);
    public invoices: KnockoutObservableArray<any> = ko.observableArray([]);
    public statement: KnockoutObservableArray<any> = ko.observableArray([]);
    public autoMatched: KnockoutObservableArray<any> = ko.observableArray([]);
    public notMatched: KnockoutObservableArray<any> = ko.observableArray([]);
    public confirmed: KnockoutObservableArray<any> = ko.observableArray([]);

    public selectedItem: KnockoutObservable<any> = ko.observable(null);

    public tenantDataSet: any;

    public keyPressTimer: null;

    public searchText: KnockoutObservable<string> = ko.observable("");

    public showAutoMatched: KnockoutObservable<boolean> = ko.observable(true);
    public showUnmatched: KnockoutObservable<boolean> = ko.observable(true);
    public showConfirmed: KnockoutObservable<boolean> = ko.observable(false);

    activate() {
      let self:ReceiptBankStatement = this;
      this.isLoading(true);
      this.uiController.hideMenu(true);

      this.selectedItem.subscribe((newItem) => {
        if(newItem.matchingAccount) {
          self.searchText(newItem.reference);
          self.tenants([newItem.matchingAccount]);
        }
        else {
          self.searchText(newItem.reference);
          self.searchAccounts(newItem.reference);
        }
      });

      this.tenants.subscribe((newSet) => {

        if(newSet.length == 1) {
          this.tenants()[0].expanded(true);
        }
        setTimeout(() => {self.refreshTable();}, 0);
      });
      
    }

    compositionComplete() {
        let self: ReceiptBankStatement = this;

        //get bankstatement items
        this.getData('/dist/data/bankstatement.json').then((statementData) => {

          //get tenants list
          this.getData('/dist/data/tenants.json')
          .then((tenantData) => {
            
            tenantData.forEach((tenant) => {
              tenant["expanded"] = ko.observable(false);
            } );

            //get invoice list
            this.getData('/dist/data/invoices.json')
            .then((invoiceData) => {
              
              //find matching account references
              statementData.forEach((item, index) => {

                //add an index
                item["index"] = index;

                let matchingAccounts = tenantData.filter((tenant) => {
                  return tenant.reference == item.reference;
                });
                
                if(matchingAccounts.length == 1) {
                  item.matchingAccount = matchingAccounts[0];
                  matchingAccounts[0].matchingPayments.push(matchingAccounts[0]);
                  item.status = "auto-matched";
                  self.autoMatched.push(item);
                }
                else {
                  item.status = "not matched";
                  self.notMatched.push(item);
                }
              });
              
              //add matching invoices to tenant list
              invoiceData.forEach((invoice) => {
                let payer = tenantData.find((tenant) => {
                  return invoice.payer_id == tenant.id;
                });
                payer.invoices.push(invoice);
                payer.balance -= invoice.total;
                payer.balance = (Math.round(payer.balance * 100) / 100)
              });

              let filtered = tenantData.filter((tenant) => {
                return tenant.balance > 0;
              });
              
              //create accounts list
              self.tenantDataSet = tenantData.filter((tenant) => {return tenant.balance != 0;});

              //create statement list
              self.statement(statementData);

              self.table = $("#app-page-main-list");

              self.appListThead = this.table.find(">thead");

              self.selectedItem(self.statement()[0]);
            });
          });

        });
    }

    public openAccordianSection(model, event) {
      let $target = $(event.currentTarget);
      let $parent = $target.parent();

    }

    public expandRow(item, event) {
      let self: ReceiptBankStatement = this;
      item.expanded(!item.expanded());
      
    }

    public refreshTable() {
      let self: ReceiptBankStatement = this;
      console.log("refresh table");
      let tHeadTHs = self.table.find(">thead>tr>th");
      self.table.find(">tbody>tr:first-child>td").each((index, value) => {
          $(value).width($(tHeadTHs[index]).width());
        });
    }

    public handleAllocateToAccountClick(item, event) {
      console.log(item);
      console.log(this.autoMatched().length);
      item.status = "confirmed";
      this.autoMatched.remove(this.selectedItem());
      this.confirmed.push(this.selectedItem());
      console.log(this.autoMatched().length);
      console.log(this.confirmed().length);
    }

    public handleStatementItemClick(item, event) {
      this.selectedItem(item);
    }

    public handleSearchKeyUp(model, event) {
      let value = event.currentTarget.value;
      clearTimeout(this.keyPressTimer);
      this.keyPressTimer = setTimeout(() => {
        if(value.length >= 3) {
          console.log(value);
          this.searchAccounts(value);
        }
        else {
          this.tenants(this.tenantDataSet);
          this.refreshTable();
        }
      }, 500);
    }

    public handleSearchChange(model, event) {
    }

    public searchAccounts(value) {
      let re = new RegExp(value, 'i');
      let filtered = this.tenantDataSet.filter((tenant) => {
        return re.test(tenant.reference) || re.test(tenant.name) || re.test(tenant.balance) || this.searchInvoices(tenant.invoices, re);
      });


      this.tenants(filtered);
      this.refreshTable();
    }

    public searchInvoices(invoices, re):boolen {
      return (invoices.find((invoice) => {
        return re.test(invoice.description) || re.test(invoice.amount);
      })) != undefined;
    }

    public handleTableScroll(model:ReceiptBankStatement, event: JQueryEventObject) {
      //scroll the thead horizontaly so it appears to stick to the columns
      model.appListThead.scrollLeft(event.currentTarget.scrollLeft);

    }

    public getContactPopover(data){
      return `<div class=''>
          <ul class='list-unstyled'>
            <li class='media'><div class='media-left'><i class='icon-location'></i></div><div class='media-right'>${data.regarding}</div></li>
            <li><div class='media-left'><i class='icon-phone2'></i></div><div class='media-right'><strong>Mobile</strong> - <a href='tel:094309843'>094309843</a> <br/><strong>Home</strong> - <a href='tel:98734233'>98734233</a></div></li>
            <li><div class='media-left'><i class='icon-envelop'></i></div><div class='media-right'><a href='email:email@email.com'>email@email.com</a></div></li>
          </ul>
        </div>`
    }

    public getMiniStatement() {
      return `<div class=''>
                <table class='table table-condensed'>
                  <tr>
                    <td>Balance carried forward</td>
                    <td>6th May</td>
                    <td>0.00</td>
                  </tr>
                  <tr>
                    <td>Rent payment</td>
                    <td>11th May</td>
                    <td>£800.00</td>
                  </tr>
                  <tr>
                    <td>Landlord payment</td>
                    <td>8th May</td>
                    <td>(£720.00)</td>
                  </tr>
                  <tr>
                    <td>Agency fees (10%)</td>
                    <td>8th May</td>
                    <td>(£80.00)</td>
                  </tr>
                  <tr>
                    <td>Current balance</td>
                    <td>6th June</td>
                    <td>0.00</td>
                  </tr>
                </table>
              </div>`;
    }

    public showInvoice() {
      this.uiController.showModal({
        kind:'invoice'
      });
    }

    public setPopover(selector){
      $(selector).popover({
        container: "body",
        html: true,
        content: function(){
          return `<div class="popover-content">${$(this).data("content")}</div>`;
        }
      });
    }

    public confirmAllAutoAllocated() {
      this.bankStatementData().forEach((item) => {
        if(item.status() == 'auto-allocated'){
          item.status('confirmed');
        }
      })
    }

    public completeReceiptProcessing(){
      let temp:array = [];
      this.bankStatementData().forEach((item) => {
        //remove all confirmed items
        if(item.status() == "confirmed"){
          this.data.remove(item.matchingInvoice);
          temp.push(item);
        }
      });
      this.bankStatementData.removeAll(temp);
      this.table.updateTable();
      this.selectedItem(this.bankStatementData()[0]);
    }

    public removeItemFromList(item, list){
      let index = list().findIndex((record) => {
        return record == item;
      });
      if(index != -1) {
        list.splice(index, 1);
      }
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

    public handleSuspenseAction() {
      this.uiController.showModal({
        kind: 'confirm'
      })
    }

}

export = ReceiptBankStatement;