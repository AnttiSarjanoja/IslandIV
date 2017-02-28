var gulp = require('gulp');
var ts = require('gulp-typescript');

var BUILD_DIR = 'build';
var PUBLIC_DIR = 'build/public';

gulp.task('app-typescript', function() {
	return gulp.src('app/ts/**/*.ts')
    .on('change', function(file) { console.log(file + " changed."); })
    .pipe(ts({
        outFile: "main.js",
        strictNullChecks: true
    }))
    .on('error', function(error) { console.log(error); })
	.pipe(gulp.dest(PUBLIC_DIR));

});
gulp.task('watch-app-ts', function() {
    gulp.watch('app/ts/**/*.ts', ['app-typescript']);
});
gulp.task('server-typescript', function() {
    return gulp.src('server/**/*.ts')
    .on('change', function(file) { console.log(file + " changed."); })
    .pipe(ts({
        strictNullChecks: true
    }))
    .on('error', function(error) { console.log(error); })
    .pipe(gulp.dest(BUILD_DIR));
});
gulp.task('watch-server-ts', function() {
    gulp.watch('server/**/*.ts', ['server-typescript']);
});
gulp.task('html', function() {
    return gulp.src('app/html/**')
    .pipe(gulp.dest(PUBLIC_DIR));
});
gulp.task('css', function() {
    return gulp.src('app/css/**')
    .pipe(gulp.dest(PUBLIC_DIR));
});
gulp.task('watch-html', function() {
    gulp.watch('app/html/**', ['html']);
});
gulp.task('img', function() {
    return gulp.src('app/img/**')
    .pipe(gulp.dest(PUBLIC_DIR + '/img'));
});
gulp.task('watch-img', function() {
    gulp.watch('app/img/**', ['img']);
});
gulp.task('lib', function() {
    return gulp.src(['app/pixi.js/pixi.js', 'app/pixi-extra-filters/bin/pixi-extra-filters.js'])
    .pipe(gulp.dest(PUBLIC_DIR + '/lib'));
});
gulp.task('default', ['app-typescript', 'server-typescript', 'html', 'css', 'img', 'lib', 'watch-app-ts', 'watch-server-ts', 'watch-html', 'watch-img']);