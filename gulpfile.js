var gulp = require('gulp');
var ts = require('gulp-typescript');

var BUILD_DIR = 'build';
var PUBLIC_DIR = 'build/public';

gulp.task('app-typescript', function() {
	return gulp.src(['app/ts/**/*.ts', 'common/**/*.ts'])
    .on('change', function(file) { console.log(file + " changed."); })
    .pipe(ts({
        outFile: "main.js",
        target: "ES6",
        strictNullChecks: true
    }))
    .on('error', function(error) { console.log(error); })
	.pipe(gulp.dest(PUBLIC_DIR));
});
gulp.task('watch-app-ts', function() {
    gulp.watch(['app/ts/**/*.ts', 'common/**/*.ts'], ['app-typescript']);
});
gulp.task('server-typescript', function() {
    return gulp.src(['server/**/*.ts', 'common/**/*.ts'])
    .on('change', function(file) { console.log(file + " changed."); })
    .pipe(ts({
        strictNullChecks: true
    }))
    .on('error', function(error) { console.log(error); })
    .pipe(gulp.dest(BUILD_DIR));
});
gulp.task('watch-server-ts', function() {
    gulp.watch(['server/**/*.ts', 'common/**/*.ts'], ['server-typescript']);
});
gulp.task('html', function() {
    return gulp.src('app/html/**')
    .pipe(gulp.dest(PUBLIC_DIR));
});
gulp.task('watch-html', function() {
    gulp.watch('app/html/**', ['html']);
});
gulp.task('json', function() {
    return gulp.src('app/settings/**/*.json')
    .pipe(gulp.dest(PUBLIC_DIR + '/settings'));
});
gulp.task('watch-json', function() {
    gulp.watch('app/settings/**/*.json', ['json']);
});
gulp.task('shaders', function() {
		return gulp.src('app/shaders/**')
		.pipe(gulp.dest(PUBLIC_DIR + '/shaders'));
});
gulp.task('watch-shaders', function() {
    gulp.watch('app/shaders/**', ['shaders']);
});
gulp.task('css', function() {
    return gulp.src('app/css/**')
    .pipe(gulp.dest(PUBLIC_DIR));
});
gulp.task('watch-css', function() {
    gulp.watch('app/css/**/*.css', ['css']);
});
gulp.task('img', function() {
    return gulp.src('app/img/**')
    .pipe(gulp.dest(PUBLIC_DIR + '/img'));
});
gulp.task('watch-img', function() {
    gulp.watch('app/img/**', ['img']);
});
gulp.task('lib', function() {
    return gulp.src(['node_modules/pixi.js/dist/pixi.js', 'node_modules/jquery/dist/jquery.min.js', 'app/pixi-extra-filters/bin/pixi-extra-filters.js'])
    .pipe(gulp.dest(PUBLIC_DIR + '/lib'));
});
gulp.task('default', ['app-typescript', 'server-typescript', 'html', 'json', 'css', 'img', 'lib', 'shaders', 'watch-app-ts', 'watch-server-ts', 'watch-html', 'watch-img', 'watch-json', 'watch-css', 'watch-shaders']);