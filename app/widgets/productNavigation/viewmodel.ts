import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import * as router from 'plugins/router';
import * as UIController from 'UIController';

/**
 * ProductNavigation VM
 */

class ProductNavigation {
    public uiController = UIController.instance;
    activate() {
        
    }
    
    public handleMenuOpenClick() {
      this.uiController.appMenuOpen(!this.uiController.appMenuOpen());
    }
}

export = ProductNavigation;