requirejs.config({
    paths: {
        'text': '/node_modules/requirejs-text/text',
        'durandal': '/node_modules/durandal/js',
        'plugins': '/node_modules/durandal/js/plugins',
        'transitions': '/node_modules/durandal/js/transitions',
        'knockout': '/node_modules/knockout/build/output/knockout-latest.debug',
        'jquery': '/node_modules/jquery/dist/jquery',
        'bootstrap': '/node_modules/bootstrap/dist/js/bootstrap',
        'moment': '/node_modules/moment/moment',
        'dataTables': '/node_modules/datatables.net/js/jquery.dataTables',
        'dataTables_buttons': '/node_modules/datatables.net-buttons/js/dataTables.buttons'
    },
  shim: {
    bootstrap: {
            deps: ['jquery'],
            exports: 'jQuery'
        },
    dataTables: {
            deps: ['jquery']
    },
    dataTables_buttons: {
            deps: ['dataTables']
        }
    },
    map: {
          '*': {
            'datatables.net': 'dataTables',
            'datatables.net-buttons': 'dataTables_buttons'
        }
    }
});

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'bootstrap', 'moment', 'dataTables'],  function (system, app, viewLocator, bootstrap, moment, dataTables) {
    
    system.debug(true);
    app.title = "component-library";
    app.configurePlugins({
        router:true,
        dialog: true,
        widget: true
    });

    app.start().then(function() {
        // Replace 'viewmodels' in the moduleId with 'views' to locate the view.
        // Look for partial views in a 'views' folder in the root.
        viewLocator.useConvention();

        // Show the app by setting the root view model for our application with a transition.
        app.setRoot('viewmodels/shell');
    });
});