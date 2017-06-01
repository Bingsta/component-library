var appRoot = 'app/';
var contentRoot = 'css/';
var outputRoot = 'dist/';
var assets = 'assets/';


module.exports = {
    root: appRoot,
    output:outputRoot,
    source_js: appRoot + '**/*.js',
    source_ts: appRoot + '**/*.ts',
    source_json: appRoot + 'data/*.json',
    source_dts:['typings/browser/**/*.d.ts','typings_local/**/*.d.ts','jspm_packages/**/*.d.ts'],
    html: appRoot + '**/*.html',
    css: contentRoot + '**/*.css',
    fonts: assets + 'toolkit/styles/fonts/**/*',
    toolkit: assets + 'toolkit/styles/*.less',
    framework: assets + 'framework/styles/*.less',
    watch_toolkit: assets + 'toolkit/styles/**/*.less',
    watch_framework: assets + 'framework/styles/**/*.less'
}