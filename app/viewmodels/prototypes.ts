import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import * as router from 'plugins/router';

/**
 * Prototypes VM
 */



class Prototypes {
    public features = ko.observableArray();
    public isLoading = ko.observable();
    public childRouter;
    
    activate() {
        this.isLoading(true);
        
        this.childRouter = router.createChildRouter()
        .makeRelative({
          moduleId:'viewmodels/prototype'
        }).map([
          { route: 'accountingDashboard',  moduleId: 'prototypes/viewmodels/accountingDashboard',   title: "Accounting dashboard",  nav: true }
        ]).buildNavigationModel();
        
    }
    
}



export = Prototypes;