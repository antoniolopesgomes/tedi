var gulp = require('gulp');
var gTs = require('gulp-typescript');
var gSeq = require('gulp-sequence');
var gCopy = require('gulp-copy');
var merge = require('merge2');
var del = require('del');
var fs = require('fs');
var utils = require('./utils');
var mkdirp = require('mkdirp');

const TSCONFIG = '../../tsconfig.json'
const PACKAGE_JSON = '../../package.json'
const BUILD_PATH = 'dist/npm';

gulp.task('npm:clean', function () {
    return del([
        BUILD_PATH + '/**',
    ]);
})

gulp.task('npm:typescript', function () {
    var tsconfig = require(TSCONFIG).compilerOptions;
    //emit declaration files (.d.ts)
    tsconfig.declaration = true;
    tsconfig.module = 'commonjs';
    //TODO Don't forget to change to typescript 2.0 when it is released
    tsconfig.typescript = require('typescript');
    //compile
    var tsResult = gulp
        .src([
            'src/**/*.ts',
            'typings/**/*.ts',
            'node_modules/inversify-dts/inversify/**/*.ts'
        ])
        .pipe(gTs(tsconfig));

    return merge([
        tsResult.dts.pipe(gulp.dest(BUILD_PATH)),
        tsResult.js.pipe(gulp.dest(BUILD_PATH))
    ]);
});

gulp.task('npm:jasmine.json', function () {
    var jasmineJson = {
        "spec_dir": "test",
        "spec_files": [
            "**/*[sS]pec.js"
        ],
        "stopSpecOnExpectationFailure": true,
        "random": false
    }
    //
    mkdirp.sync(BUILD_PATH + '/spec/support');
    //save
    fs.writeFileSync(BUILD_PATH + '/spec/support/jasmine.json', JSON.stringify(jasmineJson, null, 2));
});

gulp.task('npm:copy-files', function () {
    return gulp.
        src([
            'package.json',
            'README.md',
            'LICENSE'
        ])
        .pipe(gCopy(BUILD_PATH));
});

gulp.task('npm:copy', function () {
    return gSeq(
        //del(['node_modules/tedi/**']), 
        gulp.src('dist/**').pipe(gCopy('node_modules/tedi'))
    );
})

gulp.task('npm:build', gSeq(
    'npm:clean', 
    'npm:typescript', 
    ['npm:copy-files', 'npm:jasmine.json'])
);