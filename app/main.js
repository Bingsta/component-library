requirejs.config({
    paths: {
        'text': '/node_modules/requirejs-text/text',
        'durandal': '/node_modules/durandal/js',
        'plugins': '/node_modules/durandal/js/plugins',
        'transitions': '/node_modules/durandal/js/transitions',
        'knockout': '/node_modules/knockout/build/output/knockout-latest',
        'jquery': '/node_modules/jquery/dist/jquery',
        'bootstrap': '/node_modules/bootstrap/dist/js/bootstrap',
        'moment': '/node_modules/moment/moment',
        'dataTables': '/node_modules/datatables.net/js/jquery.dataTables',
        'dataTablesBs': '/node_modules/datatables.net-bs/js/dataTables.bootstrap',
        'dataTablesFixedColumns': '/node_modules/datatables.net-fixedcolumns/js/dataTables.fixedColumns',
        'dataTablesFixedHeader': '/node_modules/datatables.net-fixedheader/js/dataTables.fixedHeader'
    },
  shim: {
    bootstrap: {
            deps: ['jquery'],
            exports: 'jQuery'
        },
    dataTables: {
            deps: ['jquery']
    },
    dataTablesFixedColumns: {
            deps: ['dataTables']
    },
    dataTablesFixedHeader: {
            deps: ['dataTables']
        }
    },
    map: {
          '*': {
            'datatables.net': 'dataTables'
        }
    }
});

define(['durandal/system', 'durandal/app', 'durandal/viewLocator', 'bootstrap'],  function (system, app, viewLocator, bootstrap, moment) {
    
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