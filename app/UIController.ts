import * as ko from 'knockout';
import * as $ from 'jquery';


class UIController{

  private static _instance:UIController = new UIController();

  public hideMenu:KnockoutObservable<boolean> = ko.observable(false);
  public $modal = null;
  public appMenuOpen:KnockoutObservable<boolean> = ko.observable(false);

  public modalContentWidget:KnockoutObservable<any> = ko.observable({
      kind:'uploadBankStatement_form'
    });

  Constructor(){
    if(UIController._instance){
      throw new Error("Error: Instantiation failed: Use Global.getInstance() instead of new.")
    }
    UIController._instance = this;
  }
  public static getInstance():UIController {
    return this._instance;
  }

  public clearWidget() {
    this.modalContentWidget();
  }

  public toogleMenu() {
    this.hideMenu(!this.hideMenu());
  }

  public showModal(widget){
    this.modalContentWidget(widget);
    this.$modal.modal("show");
  }

  public hideModal() {
    this.$modal.modal("hide");
  }
};

export let instance = UIController.getInstance();