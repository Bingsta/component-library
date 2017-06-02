import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import * as router from 'plugins/router';

/**
 * UploadBankStatement_form VM
 */

enum ProcessingState {
  notStarted,
  started,
  completed
}

class UploadBankStatement_form {
    public processEnum = ProcessingState;
    public uploadFileProcessingState: KnockoutObservable<any> = ko.observable(ProcessingState.notStarted);
    
    activate() {
        
    }

    public selectFile() {
      let self: MoneyDueIn = this;

      this.uploadFileProcessingState(ProcessingState.started);

      //simulate server
      setTimeout(() => {
          self.uploadFileProcessingState(ProcessingState.completed);
      }, 1000);
    }

    public setSelectedBankStatementMode() {
      let self: MoneyDueIn = this;
      $('#upload-bank-statement-modal').modal('hide');
      router.navigate('receiptBankStatement');
    }
}

export = UploadBankStatement_form;