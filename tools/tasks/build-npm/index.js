var gulp = require('gulp');
var gTs = require('gulp-typescript');
var gSeq = require('gulp-sequence');
var merge = require('merge2');
var del = require('del');
var fs = require('fs');
var gSym = require('gulp-sym');

const TSCONFIG = '../../../tsconfig.json'
const PACKAGE_JSON = '../../../package.json'
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
            '!src/examples/**',
            'typings/**/*.ts',
            'node_modules/inversify-dts/inversify/**/*.ts'
        ])
        .pipe(gTs(tsconfig));

    return merge([
        tsResult.dts.pipe(gulp.dest(BUILD_PATH)),
        tsResult.js.pipe(gulp.dest(BUILD_PATH))
    ]);
});

gulp.task('npm:copy-files', function () {
    return merge(
        gulp.src(['package.json', 'README.md', 'LICENSE'])
            .pipe(gulp.dest(BUILD_PATH)),
        gulp.src(['tools/tasks/build-npm/files/spec/**/*'])
            .pipe(gulp.dest(BUILD_PATH + '/spec'))
    )
});

gulp.task('npm:symlink', function (done) {
    return fs.symlink('d:/projects/tedi/dist/npm', 'node_modules/tedi', function (error) {
        console.log(error);
        return error ? done(error) : done();
    });
});

gulp.task('npm:build', gSeq(
    'npm:clean', 
    'npm:typescript', 
    'npm:copy-files')
);