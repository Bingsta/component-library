import * as ko from 'knockout';

class Global{

  private static _instance:Global = new Global();

  public hideMenu = ko.observable(false);

  Constructor(){
    if(Global._instance){
      throw new Error("Error: Instantiation failed: Use Global.getInstance() instead of new.")
    }
    Global._instance = this;
  }
  public static getInstance():Global {
    return this._instance;
  }

  public toogleMenu() {
    console.log(this);
    this.hideMenu(!this.hideMenu());
  }
};

export let instance = Global.getInstance();