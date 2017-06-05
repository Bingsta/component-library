import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import * as router from 'plugins/router';
import * as UIController from 'UIController';
import * as moment from 'moment';

/**
 * AccountingDashboard VM
 */



class AccountingDashboard {
    public features = ko.observableArray();
    public isLoading = ko.observable();

    private messageTitle = "Application Message";
    private message = "Hello from your application";
    public moneyDueInData = {
      items: ko.observableArray(),
      total: {
        count: ko.observable(0),
        amount: ko.observable(0)
      }
    };

    public moneyDueOut = ko.observableArray();
    public accounts = ko.observableArray();
    public subAccounts = ko.observableArray();
    public systemAccounts = ko.observableArray();

    public uiController = UIController.instance;

    activate() {
        this.isLoading(true);
        this.uiController.hideMenu(true);
        this.getData('/dist/data/moneyDueInSummary.json').then((data) => {
          let totalAmount=0, totalCount=0;
          this.moneyDueInData.items(data);
          data.forEach(item => {
            totalAmount += item.amount;
            totalCount += item.count;
          });
          this.moneyDueInData.total.amount(totalAmount);
          this.moneyDueInData.total.count(totalCount);
        });

        this.getData('/dist/data/moneyDueOutSummary.json').then((data) => {
          this.moneyDueOut(data);
        });

        this.getData('/dist/data/accountsSummary.json').then((data) => {
          this.accounts(data);
        });

        this.getData('/dist/data/subAccountsSummary.json').then((data) => {
          this.subAccounts(data);
        });

        this.getData('/dist/data/systemAccountsSummary.json').then((data) => {
          this.systemAccounts(data);
        });
    }
    
    public goToPage(page){
      router.navigate(page);
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

    public showImportModal() {
      this.uiController.showModal();
    }

}



export = AccountingDashboard;