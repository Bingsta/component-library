import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import {IFeature} from 'interfaces';

/**
 * Buttons VM
 */

class Buttons {
    public settings = ko.observable();

    public componentHTML = ko.observable("");

    compositionComplete(view) {
      this.componentHTML(view.getElementsByClassName('cl-preview')[0].innerHTML);

    }
}

export = Buttons;
