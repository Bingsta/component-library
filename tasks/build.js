var gulp = require('gulp');
var runSequence = require('run-sequence');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var paths = require('./paths.js');
var less = require('gulp-less');
var path = require('path');


var typescript = require('gulp-tsb');
var typescriptCompiler = typescriptCompiler || null;
gulp.task('build-ts', function () {
    if (!typescriptCompiler) {
        typescriptCompiler = typescript.create(require('../tsconfig.json').compilerOptions);
    }
    
    return gulp.src(paths.source_dts.concat(paths.source_ts))
        .pipe(plumber())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(typescriptCompiler())
        .pipe(sourcemaps.write({ includeContent: false,sourceRoot: '/app' }))
        .pipe(gulp.dest(paths.output));
});

//compile toolkit css
gulp.task('build-less-toolkit', function () {
  return gulp.src('./assets/toolkit/styles/toolkit.less')

		.pipe(plumber())
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./dist/assets/toolkit/styles/'));

});

//compile framework css
gulp.task('build-less-framework', function () {
  return gulp.src('./assets/framework/styles/*.less')

		.pipe(plumber())
    .pipe(less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .pipe(gulp.dest('./dist/assets/framework/styles/'));
});

//minifies javascript files and includes sourcemaps
gulp.task('build-js', function() {
    return gulp.src(paths.source_js)
        .pipe(plumber())
        .pipe(changed(paths.output, { extension: '.js' }))
        .pipe(gulp.dest(paths.output));
});

//copy json files to output
gulp.task('build-json', function() {
  console.log("build-json...");
  console.log(paths.source_json);
    return gulp.src(paths.source_json)
        .pipe(changed(paths.output, { extension: '.json' }))
        .pipe(gulp.dest('./dist/data/'));
});

// copies changed html files to the output directory
gulp.task('build-html', function() {
  console.log(paths.html);
    return gulp.src(paths.html)
        .pipe(changed(paths.output, { extension: '.html' }))
        .pipe(gulp.dest(paths.output));
});

// copies changed css files to the output directory
gulp.task('build-css', function() {
    return gulp.src(paths.css)
        .pipe(changed(paths.output, { extension: '.css' }))
        .pipe(gulp.dest(paths.output));
});

gulp.task('fonts', function() {
  return gulp.src(paths.fonts).pipe(gulp.dest(paths.output + 'assets/toolkit/styles/fonts'));
});



// this task calls the clean task (located
// in ./clean.js), then runs the build-system
// and build-html tasks in parallel
// https://www.npmjs.com/package/gulp-run-sequence
gulp.task('build', function(callback) {
    return runSequence(
        'clean',
        'build-js',
        'build-ts',
        'build-json',
        ['build-html', 'build-css'],
        ['build-less-toolkit', 'build-less-framework'],
        'fonts',
        callback
    );
});
