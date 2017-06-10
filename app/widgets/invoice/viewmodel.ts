import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import * as router from 'plugins/router';

/**
 * Invoice VM
 */

interface InvoiceItems {
  type: string,
  description: string,
  qty: number,
  unitCost: number,
  net: number,
  VAT: number,
  gross: number
}

interface Group {
  name: string,
  acc: string,
  address: string,
  phone: string,
  email: string
}

interface Totals {
  unit: number,
  net:number,
  VAT: number,
  gross: number
}

interface Invoice {
  to: Group,
  ref: string,
  issueDate: string,
  dueDate: string,
  regarding: string,
  items: KnockoutOservableArray<InvoiceItems>,
  totals: Totals
}

class Invoice {
  
    public totalUnitCost: KnockoutObservable<number> = ko.observable(0);
    public totalNetCost: KnockoutObservable<number> = ko.observable(0);
    public totalVATCost: KnockoutObservable<number> = ko.observable(0);
    public totalGrossCost: KnockoutObservable<number> = ko.observable(0);

    public invoice:KnockoutObservable<Invoice> = ko.observable({
      to: {
        name: 'Stacy Garcia',
        acc: 'ACCXXXXXX',
        address: '10 St. James Gardens, Swansea, SA1 8AS',
        phone: 'Mobile - 8975934<br/>Home - 874985345</dd>',
        email: 'email@email.com'
      },
      ref: '85039845-34',
      issueDate: '12/05/2017',
      dueDate: '14/05/2017',
      regarding: 'Tenancy of 10 St. james Gardens',
      items: ko.observableArray([
        {
          type: 'Rent demand',
          description: 'Rent due 23rd Oct - 22 Nov',
          qty: 1,
          unitCost: 800,
          net: 800,
          VAT: 0,
          gross: 800
        },
        {
          type: 'Fee',
          description: 'Administration fee',
          qty: 1,
          unitCost: 100,
          net: 100,
          VAT: 20,
          gross: 120
        }
      ]));


    activate() {
      let self:Invoice = this,
      unitTotal:number = 0,
      netTotal:number = 0,
      VATTotal:number = 0,
      grossTotal:number = 0;

      self.invoice().items().forEach((item:InvoiceItems) => {
        console.log(item);
        unitTotal += item.unitCost;
        netTotal += item.net;
        VATTotal += item.VAT;
        grossTotal += item.gross;
      });

      this.totalUnitCost(unitTotal);
      this.totalNetCost(netTotal);
      this.totalVATCost(VATTotal);
      this.totalGrossCost(grossTotal);
        
    }
    
}

export = Invoice;