let gulp = require('gulp');
let ts = require('gulp-typescript');
let webpackO = require('webpack');
let webpack = require('webpack-stream');
let less = require('gulp-less');
let sourcemaps = require('gulp-sourcemaps');
let del = require('del');
const electronPackager = require('electron-packager');

let tsProject = ts.createProject('tsconfig.json');

const webpackConfig = {
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },

    node: {
        __dirname: false
    },

    module: {
        loaders: [
            { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
        ],
    },

    output: {
        filename: 'bundle.js'
    },

    plugins: [
        new webpackO.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],

    externals: {
    }
};

gulp.task('copy', function() {
    return gulp.src(['./package.json', './src/index.html', './src/style.less'])
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

gulp.task('publish', ['build-prod'], () => {
    let options = {
        dir: './out',
        name: 'LogVisualizer',
        executableName: 'logviz',
        platform: 'win32',
        overwrite: true
    };

    return electronPackager(Object.assign({
        arch: 'x64'
    }, options))
    .then(() => {
        return electronPackager(Object.assign({
            arch: 'ia32'
        }, options));
    });
});

gulp.task('ts-webpack-main', () => {
    let _webpackConfig = Object.assign({}, webpackConfig);
    _webpackConfig.output.filename = 'main.js';
    _webpackConfig.target = 'electron-main';

    return gulp.src('./src/main.ts')
        .pipe(webpack(_webpackConfig))
        .pipe(gulp.dest('./out/'));
});

gulp.task('ts-webpack-renderer', ['ts-webpack-main'], () => {

    let _webpackConfig = Object.assign({}, webpackConfig);
    _webpackConfig.output.filename = 'renderer.js';
    _webpackConfig.target = 'electron-renderer';

    return gulp.src('./src/renderer.tsx')
        .pipe(webpack(_webpackConfig))
        .pipe(gulp.dest('./out/'));
});

gulp.task('ts-webpack', ['ts-webpack-renderer']);

gulp.task('clean', () => {
    return del.sync('./out/**/*.*');
});

gulp.task('build', ['clean', 'ts', 'less', 'copy']);
gulp.task('build-prod', ['clean', 'ts-webpack', 'less', 'copy']);
gulp.task('default', ['build']);