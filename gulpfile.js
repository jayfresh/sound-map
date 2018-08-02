var gulp = require('gulp'),
  sass = require('gulp-sass'),
  clean = require('gulp-clean'),
  concat = require('gulp-concat'),
  livereload = require('gulp-livereload'),
  embedlr = require('gulp-embedlr'),
  connect = require('connect'),
  serveStatic = require('serve-static');

gulp.task('clean', function(){
  return gulp.src(['build/*'], {read:false})
    .pipe(clean());
});

gulp.task('styles', function() {
  gulp.src('./src/scss/style.scss')
    .pipe(sass({
      //outputStyle: 'compressed'
    }))
    .pipe(gulp.dest('./build/css'))
    .pipe(livereload());
});

gulp.task('images', function() {
  gulp.src('./src/images/**/*.*')
    .pipe(gulp.dest('./build/images'))
    .pipe(livereload());

  gulp.src('./src/favicon.ico')
    .pipe(gulp.dest('./build'));
});

gulp.task('fonts', function() {
  gulp.src('./src/fonts/**/*.*')
    .pipe(gulp.dest('./build/fonts'))
    .pipe(livereload());
});

gulp.task('javascripts', function() {
  gulp.src(['./src/javascripts/jquery-1.11.0.min.js', './src/javascripts/bootstrap.min.js','./src/javascripts/buffer-loader.js', './src/javascripts/app.js'])
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./build/javascripts'))
    .pipe(livereload());
});

gulp.task('templates', function() {
  gulp.src('./src/*.html')
    // Embed livereload snippet
    .pipe(embedlr())
    .pipe(gulp.dest('./build'))
    .pipe(livereload());
});

gulp.task('templatesBuild', function() {
  gulp.src('./src/*.html')
    .pipe(gulp.dest('./build'));
});

gulp.task('default', ['clean'], function() {
  gulp.start('styles', 'javascripts', 'images', 'fonts', 'templates');
});

gulp.task('build', ['clean'], function() {
  gulp.start('styles', 'javascripts', 'images', 'fonts', 'templatesBuild');
});

gulp.task('watch', ['default', 'server'], function() {
  livereload.listen({ basePath: 'build' });
  gulp.watch('./src/scss/**/*.scss', ['styles']);
  gulp.watch('./src/javascripts/**/*.*', ['javascripts']);
  gulp.watch('./src/images/**/*.*', ['images']);
  gulp.watch('./src/fonts/**/*.*', ['fonts']);
  gulp.watch('./src/*.html', ['templates']);
});

gulp.task('server', function(next) {
  var server = connect();
  server.use(serveStatic('build')).listen(process.env.PORT || 8000, next);
});
