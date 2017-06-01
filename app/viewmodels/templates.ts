import * as ko from 'knockout';
import * as system from 'durandal/system';
import * as app from 'durandal/app';
import {IFeature} from 'interfaces';

/**
 * Templates VM
 */



class Templates {
    public features = ko.observableArray();
    public isLoading = ko.observable();

    private messageTitle = "Application Message";
    private message = "Hello from your application";

    activate() {
        this.isLoading(true);

        return this.loadFeatures().then((data) => {
            this.features(data);
            this.isLoading(false);
        });

    }
    
    compositionComplete() {
      
    }

    viewDetail(featureData:IFeature) {
        return app.showMessage(featureData.details,featureData.title);
    }

    loadFeatures(): JQueryDeferred<IFeature[]> {
        return system.defer(function(dfd) {
            setTimeout(function() {
                dfd.resolve([
                    {
                        title: "Buttons",
                        component: "<button class=\"btn btn-default\"></button>",
                        arguments:['{name}','{typescript|es5}'],
                        options:['--transient'],
                        notes:"Button notes"
                    },
                    {
                        title: "Run A Task",
                        content: "Run a preconfigured gulp task like <strong>gulp watch.</strong>",
                        arguments:['{taskName}'],
                        details:"Tasks are found in the tasks directory under the project root."
                    }
                ]);
            }, 500);
        });
    }
}



export = Templates;