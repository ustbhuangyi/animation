var gulp = require('gulp');
var amdOptimize = require('amd-optimize');
var concat = require('gulp-concat');

gulp.task('scripts', function () {

  return gulp.src('src/**/*.js')
    // Traces all modules and outputs them in the correct order.
    .pipe(amdOptimize('animation'))
    .pipe(concat('animation.js'))
    .pipe(gulp.dest('dist'));

});

gulp.task('default', ['scripts']);
