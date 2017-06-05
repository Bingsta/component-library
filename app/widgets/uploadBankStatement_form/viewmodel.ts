import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import * as router from 'plugins/router';
import * as UIController from 'UIController';

/**
 * UploadBankStatement_form VM
 */


class UploadBankStatement_form {
    public files: KnockoutObservableArray<any> = ko.observableArray([]);
    public settings: any;
    public uiController = UIController.instance;

    activate(settings) {
        this.settings = settings
        this.files([]);
    }

    public handleFileSelect (model,event){
      let self:UploadBankStatement_form = this;
      console.log(event.target.files);
      self.files(event.target.files);
    }

    public selectFile() {
      let self: MoneyDueIn = this;

      //simulate server
      setTimeout(() => {
      }, 1000);
    }

    public setSelectedBankStatementMode() {
      let self: MoneyDueIn = this;
      this.uiController.hideModal();
      router.navigate('receiptBankStatement');
    }
}

export = UploadBankStatement_form;