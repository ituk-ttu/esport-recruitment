/*global require*/
'use strict'

var gulp = require('gulp'),
  path = require('path'),
  pug = require('gulp-pug'),
  prefix = require('gulp-autoprefixer'),
  sass = require('gulp-sass'),
  ftp = require('vinyl-ftp'),
  minimist = require('minimist'),
  args = minimist(process.argv.slice(2)),
  browserSync = require('browser-sync')

/*
 * Directories here
 */
var paths = {
  source: './src/',
  build: './build/',
  sass: 'sass/',
  css: 'css/',
  images: 'images/'
}

gulp.task('pug', function () {
  return gulp.src(paths.source + '*.pug')
    .pipe(pug())
    .on('error', function (err) {
      process.stderr.write(err.message + '\n')
      this.emit('end')
    })
    .pipe(gulp.dest(paths.build))
})

gulp.task('positions-pug', function () {
  return gulp.src(paths.source + 'positions/*.pug')
    .pipe(pug())
    .on('error', function (err) {
      process.stderr.write(err.message + '\n')
      this.emit('end')
    })
    .pipe(gulp.dest(paths.build + 'positions/'))
})

gulp.task('images', function () {
  return gulp.src(paths.source + paths.images + '**/*.*')
    .pipe(gulp.dest(paths.build + paths.images))
    .pipe(browserSync.reload({
      stream: true
    }))
})

gulp.task('rebuild', ['pug', 'positions-pug', 'sass', 'images'], function () {
  browserSync.reload()
})

gulp.task('browser-sync', ['sass', 'pug', 'positions-pug', 'images'], function () {
  browserSync({
    server: {
      baseDir: paths.build
    },
    notify: true
  })
})

gulp.task('sass', function () {
  return gulp.src(paths.source + paths.sass + 'style.scss')
    .pipe(sass({
      includePaths: [paths.source + paths.sass],
      outputStyle: 'compressed'
    }))
    .on('error', sass.logError)
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {
      cascade: true
    }))
    .pipe(gulp.dest(paths.build + paths.css))
    .pipe(browserSync.reload({
      stream: true
    }))
})

gulp.task('deploy', () => {
  const remotePath = '/web/volunteer/'
  const conn = ftp.create({
    host: 'volunteer.e-sport.ee',
    user: args.user,
    password: args.password
  })
  console.log('Connected to ' + conn.host + " as " + conn.user)
  return gulp.src(paths.build + '**/*.*', {base: './build'})
    .pipe(conn.dest(remotePath))
})

gulp.task('watch', function () {
  gulp.watch(paths.source + paths.sass + '**/*.scss', ['sass'])
  gulp.watch(paths.source + '**/*.pug', ['rebuild'])
  gulp.watch(paths.source + paths.images + '**/*.*', ['images'])
})

gulp.task('build', ['sass', 'pug', 'positions-pug', 'images'])

gulp.task('default', ['browser-sync', 'watch'])
