import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import * as router from 'plugins/router';

/**
 * Confirm VM
 */

class Confirm {
    public message:KnockoutObservable<string> = ko.observable("");

    activate(settings) {
        
    }
    
}

export = Confirm;