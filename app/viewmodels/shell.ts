import * as router from 'plugins/router';
import * as app from 'durandal/app';
import * as ko from 'knockout';
import * as UIController from 'UIController';

class Shell {
public router = router;
public uiController = UIController.instance;

  activate() {
    router.map([
      { route: '',                                moduleId: 'viewmodels/home',                                        title: "Home",                  nav: true },
      { route: 'components',                      moduleId: 'viewmodels/components',                                  title: "Components",            nav: true },
      { route: 'structures',                      moduleId: 'viewmodels/structures',                                  title: "Structures",            nav: true },
      { route: 'templates',                       moduleId: 'viewmodels/templates',                                   title: "Templates",             nav: true },
      { route: 'prototypes',                      moduleId: 'viewmodels/prototypes',                                  title: "Prototypes",            nav: true },
      { route: 'accountingDashboard',             moduleId: '../prototypes/viewmodels/accountingDashboard',           title: "Test",                  nav: false },
      { route: 'moneyDueIn',                      moduleId: '../prototypes/viewmodels/moneyDueIn',                    title: "Test",                  nav: false },
      { route: 'receiptBankStatement',            moduleId: '../prototypes/viewmodels/receiptBankStatement',          title: "Test",                  nav: false }
    ]).buildNavigationModel();
    return router.activate();
  }

  compositionComplete(){
    let self:shell = this;
    this.uiController.$modal = $('#app-modal');
    this.uiController.$modal.on('hidden.bs.modal', (event) => {
      self.uiController.$modal.clearWidget();
    });

  }

}

export = Shell;