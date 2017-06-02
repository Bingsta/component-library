import * as ko from 'knockout';
import * as $ from 'jquery';

class Controller{

  private static _instance:Controller = new Controller();

  public hideMenu = ko.observable(false);

  public modalContentWidget:KnockoutObservable<any> = ko.observable({
    kind:'uploadBankStatement_form'
  });

  Constructor(){
    if(Controller._instance){
      throw new Error("Error: Instantiation failed: Use Global.getInstance() instead of new.")
    }
    Controller._instance = this;
  }
  public static getInstance():Controller {
    return this._instance;
  }

  public toogleMenu() {
    console.log(this);
    this.hideMenu(!this.hideMenu());
  }

  public showModal(){
    $('app_modal').modal("show");
  }
};

export let instance = Controller.getInstance();