import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import {IFeature} from 'interfaces';

/**
 * Item VM
 */



class Item {
    public settings = ko.observable();

    private messageTitle = "Application Message";
    private message = "Hello from your application";

    activate(settings) {
        this.settings = settings;
    }
}


// define(['durandal/composition','jquery'], function(composition, $) {
//     var ctor = function() { };
 
//     ctor.prototype.activate = function(settings) {
//         this.settings = settings;
//     };
 
//     return ctor;
// });


export = Item;
