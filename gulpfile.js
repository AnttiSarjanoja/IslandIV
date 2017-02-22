var gulp = require('gulp');
var ts = require('gulp-typescript');

var BUILD_DIR = 'build';

gulp.task('typescript', function() {
	return gulp.src('app/ts/**/*.ts')
    .on('change', function(file) { console.log(file + " changed."); })
    .pipe(ts({ outFile: "main.js" }))
    .on('error', function(error) { console.log(error); })
	.pipe(gulp.dest(BUILD_DIR));

});
gulp.task('watch-ts', function() {
    gulp.watch('app/ts/**/*.ts', ['typescript']);
});
gulp.task('html', function() {
    return gulp.src('app/html/**')
    .pipe(gulp.dest(BUILD_DIR));
});
gulp.task('watch-html', function() {
    gulp.watch('app/html/**', ['html']);
});
gulp.task('img', function() {
    return gulp.src('app/img/**')
    .pipe(gulp.dest(BUILD_DIR + '/img'));
});
gulp.task('watch-img', function() {
    gulp.watch('app/img/**', ['img']);
});
gulp.task('lib', function() {
    return gulp.src('app/pixi.js/pixi.js')
    .pipe(gulp.dest(BUILD_DIR + '/lib'));
});
gulp.task('default', ['typescript', 'html', 'img', 'lib', 'watch-ts', 'watch-html', 'watch-img']);