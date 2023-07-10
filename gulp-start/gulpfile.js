const {src, dest, watch, parallel, series} = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const svgSprite = require('gulp-svg-sprite');
const include = require('gulp-include');

function pages() {
	return src('src/pages/*.html')
		.pipe(include({
			includePaths: 'src/parts'
		}))
		.pipe(dest('src'))
		.pipe(browserSync.stream())
}

function fonts() {
	return src('src/fonts/source/*.*')
		.pipe(fonter({
			formats: ['woff', 'ttf']
		}))
		.pipe(src('src/fonts/*.ttf'))
		.pipe(ttf2woff2())
		.pipe(dest('src/fonts'))
}

function images() {
	return src(['src/img/imgs/*.*', '!src/img/imgs/*.svg'])
		.pipe(newer('src/img/dist'))
		.pipe(avif({ quality : 50 }))

		.pipe(src('src/img/imgs/*.*'))
		.pipe(newer('src/img/dist'))
		.pipe(webp())

		.pipe(src('src/img/imgs/*.*'))
		.pipe(newer('src/img/dist'))
		.pipe(imagemin())

		.pipe(dest('src/img/dist'))
}

function sprite() {
	return src('src/img/dist/*.svg')
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../sprite.svg',
					example: true
				}
			}
		}))
		.pipe(dest('src/img/dist'))
}

function scripts() {
  return src('src/js/main.js')
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('src/js'))
		.pipe(browserSync.stream())
}

function styles() {
  return src('src/scss/style.scss')
    .pipe(autoprefixer({overrideBrowserlist: ['last 10 version']}))
    .pipe(concat('style.min.scss'))
    .pipe(scss({outputStyle: 'compressed'}))
    .pipe(dest('src/scss'))
		.pipe(browserSync.stream())
}

function watching() {
	browserSync.init({
		server: {
			baseDir: "src/"
		}
	});
	watch(['src/scss/style.scss'], styles)
	watch(['src/img/imgs'], images)
	watch(['src/js/main.js'], scripts)
	watch(['src/parts/*', 'src/pages/*'], pages)
	watch(['src/*.html']).on('change', browserSync.reload);

}

function building() {
  return src([
    'src/scss/style.min.css',
		'src/scss/reset.css',
		'src/img/dist/*.*',
		'!src/img/dist/*.svg',
		'src/img/dist/sprite.svg',
		'src/fonts/*.*',
    'src/js/main.min.js',
    'src/**/*.html',
  ], {base : 'src'})
    .pipe(dest('dist'))
}

function Distcleaner() {
  return src('dist')
    .pipe(clean())
}

exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.pages = pages;
exports.sprite = sprite;
exports.scripts = scripts;
exports.watching = watching;

exports.build = series(Distcleaner, building);
exports.default = parallel(styles, images, scripts, pages, watching);