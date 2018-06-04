const gulp    = require('gulp'),
      eslint  = require('gulp-eslint'),
      babel   = require('gulp-babel'),
      minify  = require('gulp-minify'),
      sass    = require('gulp-sass'),
      bourbon = require('node-bourbon').includePaths,
      neat    = require('node-neat').includePaths;

gulp.task('scripts', () =>
    gulp.src('./src/js/app.js')
    .pipe(babel({
        presets: ['env']
    }))
    .pipe(eslint({
        'rules':{
            'quotes': [0, 'single'],
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
    .pipe(eslint.failOnError())
);


gulp.task('styles', function () {
    return gulp.src('./src/scss/**/*.scss')
    .pipe(sass({
        includePaths: [neat, bourbon],
        outputStyle: 'compressed'
    }).on('error', sass.logError))
    .pipe(gulp.dest('./dist'));
})


gulp.task('watch', function () {
    gulp.watch([
        './src/scss/*.scss',
        './src/js/*.js'
    ], ['scripts','styles']);
});