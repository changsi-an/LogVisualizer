let gulp = require('gulp');
let ts = require('gulp-typescript');
let less = require('gulp-less');
let sourcemaps = require('gulp-sourcemaps');

let tsProject = ts.createProject('tsconfig.json');

gulp.task('package.json', function () {
    return gulp.src('./package.json')
        .pipe(gulp.dest('./out/'));
});

gulp.task('ts', function () {
    return gulp.src([
        'src/**/*.ts',
        'src/**/*.tsx'
        ])
        .pipe(sourcemaps.init())
        .pipe(tsProject())
        .pipe(sourcemaps.write('.', { includeContent: false, sourceRoot: './' }))
        .pipe(gulp.dest('./out/'));
});

gulp.task('less', function () {
    return gulp.src([
        'src/**/*.less'
    ])
    .pipe(less({
        paths: []
    }))
    .pipe(gulp.dest('./out/'));
});


gulp.task('build', ['ts', 'less']);
gulp.task('default', ['build', 'package.json']);