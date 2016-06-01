var gulp = require('gulp')
var sourcemaps = require('gulp-sourcemaps')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var browserify = require('browserify')
var watchify = require('watchify')
var babel = require('babelify')
var connect = require('gulp-connect')
var postcss = require('gulp-postcss')
var autoprefixer = require('autoprefixer')
var atImport = require("postcss-import")


function compile(watch) {
  var bundler = watchify(browserify('./src/main.js', { debug: true }).transform(babel))

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) {
        console.error(err)
        this.emit('end')
      })
      .pipe(source('build.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./build'))
      .pipe(connect.reload())
  }

  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...')
      rebundle()
    })
  }

  rebundle()
}

function watch() {
  gulp.watch('./src/**/*.css', ['css'])
  gulp.watch(['./app/*.html'], ['html']);
  return compile(true)
}

gulp.task('compile', function() { return compile() })
gulp.task('watch', function() { return watch() })
gulp.task('connect', function() {
  connect.server({ livereload: true })
})
gulp.task('css', function () {
  var processors = [
    autoprefixer({browsers: ['last 1 version']}),
    atImport({from: './src/style.css'})
  ]

  return gulp.src('./src/*.css')
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./build'))
    .pipe(connect.reload())
})

gulp.task('html', function () {
  gulp.src('./src/**/*.html')
    .pipe(connect.reload())
})


gulp.task('default', ['watch', 'connect'])
gulp.task('build', ['compile, css'])
