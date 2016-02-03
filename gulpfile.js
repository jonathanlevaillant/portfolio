
/* gulpfile
   ========================================================================== */

/* requires */

var gulp = require('gulp');

/* include plugins */

var plugins = require('gulp-load-plugins')();
var critical = require('critical').stream;
var gulpsync = require('gulp-sync')(gulp);
var merged = require('merge-stream');
var del = require('del');

/* paths */

var dev = './dev';
var prod = './prod';
var css = '/css';
var js = '/js';
var img = '/img';
var fonts = '/fonts';

/* task init = replace + rename + merged */

gulp.task('init', function() {
	var files = gulp.src(dev + '/*.{php,html}')
		.pipe(plugins.replace('<?php', '<!--<?php'))
		.pipe(plugins.replace('?>', '?>-->'))
		.pipe(plugins.replace('<script', '<!--<script'))
		.pipe(plugins.replace('</script>', '</script>-->'))
		.pipe(gulp.dest(prod))
		.pipe(plugins.rename(function(path) {
			path.extname = ".gulp.html"
		}))
		.pipe(gulp.dest(dev));
	var config = gulp.src(dev + '/*.{xml,json,ico}')
		.pipe(gulp.dest(prod));
	return merged(files, config);
});

/* task css = uncss + autoprefixer + concat + cssnano + csso */

gulp.task('css', function() {
	return gulp.src([dev + css + '/*.css', '!' + dev + css + '/main.css'])
		.pipe(plugins.uncss({
			html: [dev + '/*.gulp.html'],
			ignore: ['::-webkit-input-placeholder', '.alert', '.alert--success', '.alert--warning']
		}))
		.pipe(plugins.autoprefixer({
			browsers: ['last 2 versions', '> 2%'],
			remove: false
		}))
		.pipe(plugins.concat('main.css'))
		.pipe(plugins.cssnano({
			autoprefixer: false,
			discardUnused: false,
			reduceTransforms: false
		}))
		.pipe(plugins.csso())
		.pipe(gulp.dest(prod + css));
});

/* task critical = critical */

gulp.task('critical', function() {
	return gulp.src(prod + '/*.{php,html}')
		.pipe(critical({
			base: prod,
			inline: true,
			height: 640,
			minify: true,
			ignore: [
				'@font-face',
				'::-moz-selection',
				'::selection',
				'input',
				'input::-moz-focus-inner',
				'::-webkit-input-placeholder',
				'input:-moz-placeholder',
				'.icon:before',
				'.icon--twitter:before',
				'.icon--linkedin:before',
				'.icon--codepen:before',
				'.icon--google:before',
				'.social',
				'.social__link',
				'.social__link:before',
				'.social__item+.social__item',
				'.slider__btn-nav',
				'.slider__btn-nav:before',
				'.slider__btn:first-of-type:not(:nth-last-of-type(2)):checked~.slider__btn-nav:nth-last-of-type(2)',
				'.slider__btn:first-of-type:checked~.slider__btn-nav:last-of-type'
			]
		}))
		.pipe(gulp.dest(prod));
});

/* task js = uglify + concat */

gulp.task('js', function() {
	return gulp.src(dev + js + '/*.js')
		.pipe(plugins.uglify({
			output: {max_line_len: 400000}
		}))
		.pipe(plugins.concat('main.js'))
		.pipe(gulp.dest(prod + js));
});

/* task html = replace + htmlmin */

gulp.task('html', function() {
	return gulp.src(prod + '/*.{php,html}')
		.pipe(plugins.replace('<!--<?php', '<?php'))
		.pipe(plugins.replace('?>-->', '?>'))
		.pipe(plugins.replace('<!--<script', '<script'))
		.pipe(plugins.replace('</script>-->', '</script>'))
		.pipe(plugins.htmlmin({
			removeComments: true,
			removeCommentsFromCDATA: true,
			removeCDATASectionsFromCDATA: true,
			collapseWhitespace: true,
			collapseBooleanAttributes: true,
			removeAttributeQuotes: true,
			removeRedundantAttributes: true,
			preventAttributesEscaping: true,
			useShortDoctype: true,
			removeEmptyAttributes: true,
			removeScriptTypeAttributes: true,
			removeStyleLinkTypeAttributes: true,
			removeOptionalTags: true,
			removeIgnored: false,
			removeEmptyElements: false,
			keepClosingSlash: false,
			caseSensitive: false,
			minifyJS: false,
			minifyCSS: false,
			minifyURLs: true
		}))
		.pipe(gulp.dest(prod));
});

/* task img = imagemin */

gulp.task('img', function() {
	return gulp.src(dev + '/**/*.{png,jpg,jpeg,gif,svg}')
		.pipe(plugins.imagemin({
			optimizationLevel: 4, progressive: true, multipass: true
		}))
		.pipe(gulp.dest(prod));
});

/* task fonts = copy paste */

gulp.task('fonts', function() {
	return gulp.src(dev + fonts + '/**')
		.pipe(gulp.dest(prod + fonts));
});

/* task clean = del */

gulp.task('clean', function() {
	return del(dev + '/*.gulp.html');
});

/* task prod = init + css + critical + js + html + img + fonts + clean */

gulp.task('prod', gulpsync.sync(['init', 'css', 'critical', 'js', 'html', 'img', 'fonts', 'clean']));

// default task

gulp.task('default', ['prod']);
