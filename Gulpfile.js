// Require our dependencies
var autoprefixer = require('autoprefixer');
var browserSync = require('browser-sync');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var del = require('del');
var gulp = require('gulp');
var gutil = require('gulp-util');
var mqpacker = require('css-mqpacker');
var notify = require('gulp-notify');
var plumber = require('gulp-plumber');
var postcss = require('gulp-postcss');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sort = require('gulp-sort');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var wpPot = require('gulp-wp-pot');

// Set assets paths.
var paths = {
	css: ['./*.css', '!*.min.css'],
	php: ['./*.php', './**/*.php'],
	sass: 'assets/sass/**/*.scss',
	concat_scripts: 'assets/scripts/concat/*.js',
	scripts: ['assets/scripts/*.js', '!assets/scripts/*.min.js', '!assets/scripts/customizer.js'],
};

/**
 * Handle errors and alert the user.
 */
function handleErrors () {
	var args = Array.prototype.slice.call(arguments);

	notify.onError({
		title: 'Task Failed [<%= error.message %>',
		message: 'See console.',
		sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
	}).apply(this, args);

	gutil.beep(); // Beep 'sosumi' again

	// Prevent the 'watch' task from stopping
	this.emit('end');
}

/**
 * Delete style.css and style.min.css before we minify and optimize
 */
gulp.task('clean:styles', function() {
	return del(['style.css', 'style.min.css'])
});

/**
 * Compile Sass and run stylesheet through PostCSS.
 *
 * https://www.npmjs.com/package/gulp-sass
 * https://www.npmjs.com/package/gulp-postcss
 * https://www.npmjs.com/package/gulp-autoprefixer
 * https://www.npmjs.com/package/css-mqpacker
 */
gulp.task('postcss', ['clean:styles'], function() {
	return gulp.src('assets/sass/*.scss', paths.css)

	// Deal with errors.
		.pipe(plumber({ errorHandler: handleErrors }))

		// Wrap tasks in a sourcemap.
		.pipe(sourcemaps.init())

		// Compile Sass using LibSass.
		.pipe(sass({
			includePaths: [].concat(),
			errLogToConsole: true,
			outputStyle: 'expanded' // Options: nested, expanded, compact, compressed
		}))

		// Parse with PostCSS plugins.
		.pipe(postcss([
			autoprefixer({
				browsers: ['last 2 version']
			}),
			mqpacker({
				sort: true
			}),
		]))

		// Create sourcemap.
		.pipe(sourcemaps.write())

		// Create style.css.
		.pipe(gulp.dest('./'))
		.pipe(browserSync.stream());
});

/**
 * Minify and optimize style.css.
 *
 * https://www.npmjs.com/package/gulp-cssnano
 */
gulp.task('cssnano', ['postcss'], function() {
	return gulp.src('style.css')
		.pipe(plumber({ errorHandler: handleErrors }))
		.pipe(cssnano({
			safe: true // Use safe optimizations
		}))
		.pipe(rename('style.min.css'))
		.pipe(gulp.dest('./'))
		.pipe(browserSync.stream());
});

/**
 * Concatenate javascript files into one.
 * https://www.npmjs.com/package/gulp-concat
 */
gulp.task('concat', function() {
	return gulp.src(paths.concat_scripts)
		.pipe(plumber({ errorHandler: handleErrors }))
		.pipe(sourcemaps.init())
		.pipe(concat('project.js'))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('assets/scripts'))
		.pipe(browserSync.stream());
});

/**
 * Minify compiled javascript after concatenated.
 * https://www.npmjs.com/package/gulp-uglify
 */
gulp.task('uglify', ['concat'], function() {
	return gulp.src(paths.scripts)
		.pipe(rename({suffix: '.min'}))
		.pipe(uglify({
			mangle: false
		}))
		.pipe(gulp.dest('assets/scripts'));
});

/**
 * Delete the theme's .pot before we create a new one.
 */
gulp.task('clean:pot', function() {
	return del(['languages/shoreditch.pot']);
});

/**
 * Scan the theme and create a POT file.
 *
 * https://www.npmjs.com/package/gulp-wp-pot
 */
gulp.task('wp-pot', ['clean:pot'], function() {
	return gulp.src(paths.php)
		.pipe(plumber({ errorHandler: handleErrors }))
		.pipe(sort())
		.pipe(wpPot({
			domain: 'shoreditch',
			destFile:'shoreditch.pot',
			package: 'shoreditch',
		}))
		.pipe(gulp.dest('languages/'));
});

/**
 * Process tasks and reload browsers on file changes.
 *
 * https://www.npmjs.com/package/browser-sync
 */
gulp.task('watch', function() {

	// Kick off BrowserSync.
	browserSync({
		open: false,             // Open project in a new tab?
		injectChanges: true,     // Auto inject changes instead of full reload
		proxy: "shoreditch.dev", // Use http://_s.com:3000 to use BrowserSync
		watchOptions: {
			debounceDelay: 1000  // Wait 1 second before injecting
		}
	});

	// Run tasks when files change.
	gulp.watch(paths.sass, ['styles']);
	gulp.watch(paths.scripts, ['scripts']);
	gulp.watch(paths.concat_scripts, ['scripts']);
	gulp.watch(paths.php, ['markup']);
});

/**
 * Create individual tasks.
 */
gulp.task('markup', browserSync.reload);
gulp.task('i18n', ['wp-pot']);
gulp.task('scripts', ['uglify']);
gulp.task('styles', ['cssnano']);
gulp.task('default', ['i18n', 'styles', 'scripts']);