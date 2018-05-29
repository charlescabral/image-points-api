const gulp = require('gulp');
const eslint = require('gulp-eslint');
const minify = require('gulp-minify');

gulp.task('lint', function() {
    return gulp.src('src/*.js').pipe(eslint({
        'rules':{
            'quotes': [1, 'single'],
            'semi': [1, 'always']
        }
    }))
    .pipe(eslint.format())
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'.js'
        }
    }))
    .pipe(gulp.dest('dist'))
    .pipe(eslint.failOnError());
});


gulp.task('watch', function () {
    gulp.watch([
        'src/*.js'
    ], ['lint']);
});