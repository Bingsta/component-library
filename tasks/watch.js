var gulp = require('gulp');
var paths = require('./paths');
var browserSync = require('browser-sync');
//Call this after build completes
gulp.task('watch', ['serve'], function() {

    // outputs changes to files to the console
    function reportChange(event) {
        console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
    }

    gulp.watch(paths.source_js, ['build-js', browserSync.reload]).on('change', reportChange);   
    
    gulp.watch(paths.source_ts, ['build-ts', browserSync.reload]).on('change', reportChange);
    
    gulp.watch(paths.source_json, ['build-json', browserSync.reload]).on('change', reportChange);
    
    gulp.watch(paths.html, ['build-html', browserSync.reload]).on('change', reportChange);

    gulp.watch(paths.watch_toolkit, ['build-less-toolkit', browserSync.reload]).on('change', reportChange);

    gulp.watch(paths.watch_framework, ['build-less-framework', browserSync.reload]).on('change', reportChange);
});