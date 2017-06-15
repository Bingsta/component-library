import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import * as router from 'plugins/router';

/**
 * Confirm VM
 */

class Confirm {
    public title:KnockoutObservable<string> = ko.observable("Confirm action");
    public message:KnockoutObservable<string> = ko.observable("");
    public confirm: KnockoutObservable<boolean> = ko.observable(false);

    activate(settings) {
      if(settings.message) {
        this.message(settings.message)
      }
      else {
        throw "Please supply a message";
      }
      if(settings.title){
        this.title(settings.title);
      }
      this.confirm = settings.confirm;
    }
    
    public handleProceedClick() {
      this.confirm(true)
    }

    public handleDismissClick() {
      this.confirm(false);
    }
}

export = Confirm;