"use strict";


// ____________________________________________________
// _______________________ VARS _______________________
// ____________________________________________________

// for gulp-autoprefixer 
var autoprefixerList = [
  'Chrome >= 45',
	'Firefox ESR',
	'Edge >= 12',
	'Explorer >= 10',
	'iOS >= 9',
	'Safari >= 9',
	'Android >= 4.4',
	'Opera >= 30'
];
// path to src/build, files who need whaching and folder who need clean.
var path = {
        build: {
            js:    'assets/resultFiles/js/',
            css:   'assets/resultFiles/css/',
            img:   'assets/resultFiles/img/'
        },
        src: {
            js:    'assets/yourFiles/js/*.*',
            style: 'assets/yourFiles/css_sass/*.*',
            img:   'assets/yourFiles/imgs/*.*'
        },
        clean:     './assets/resultFiles/*'
};



// _______________________________________________________
// _______________________ PLUGINS _______________________
// _______________________________________________________

// Add plugins
const { src, dest, series, watch } = require('gulp');
const plumber = require('gulp-plumber'), // for errors
      rigger = require('gulp-rigger'), // import info from files to other files
      sass = require('gulp-sass'), // SCSS to CSS
      autoprefixer = require('gulp-autoprefixer'),
      cleanCSS = require('gulp-clean-css'), // minimize CSS
      uglify = require('gulp-uglify'), // minimize JS
      cache = require('gulp-cache'), // for cache imgs
      imagemin = require('gulp-imagemin'), // for minimaze PNG, JPEG, GIF and SVG
      jpegrecompress = require('imagemin-jpeg-recompress'), // for minimaze jpeg	
      pngquant = require('imagemin-pngquant'), // for minimaze png
      del = require('del'), // remove files and folders
      concat = require('gulp-concat');


// _______________________________________________________
// _______________________ TASKS _________________________
// _______________________________________________________

function cssBuild(cb){
	return src(path.src.style)
		     .pipe(plumber())
         .pipe(sass())
         .pipe(autoprefixer({
            browsers: autoprefixerList
         }))
         .pipe(rigger())
         .pipe(cleanCSS())
         .pipe(concat('style.css'))
         .pipe(dest(path.build.css))
         
}

function jsBuild(cb){
	return src(path.src.js)
		     .pipe(plumber())
         .pipe(rigger())
         .pipe(uglify())
         .pipe(concat('code.js'))
         .pipe(dest(path.build.js))
}

function imageBuild(cb){
	return src(path.src.img)
		      .pipe(cache(imagemin([ // compressing img
		        imagemin.gifsicle({interlaced: true}),
            jpegrecompress({
                progressive: true,
                max: 90,
                min: 80
            }),
            pngquant(),
            imagemin.svgo({plugins: [{removeViewBox: false}]})
		      ])))
        .pipe(dest(path.build.img));
}

function cleanBuild(cb){
	del.sync(path.clean);
	cb();
}

function cacheClear(cb){
	cache.clearAll();
	cb();
}

function removeGitkeep(cb){
  del.sync('./assets/resultFiles/.gitkeep');
  del.sync('./assets/yourFiles/css_sass/.gitkeep');
  del.sync('./assets/yourFiles/js/.gitkeep');
  del.sync('./assets/yourFiles/imgs/.gitkeep');
  cb();
}

function build(cb){
	cssBuild();
	jsBuild();
	imageBuild();
	cb();
}

// autostart tasks on "gulp" command in console
exports.default = series(
  removeGitkeep,
	cleanBuild,
	build
)