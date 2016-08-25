//TYPESCRIPT COMPILATION
var gulp = require('gulp');
var gTs = require('gulp-typescript');
var merge = require('merge2');

//CONFIG
var config = require('./_config');

const TSCONFIG = '../../tsconfig.json'

var tsconfig = require(TSCONFIG).compilerOptions;
//emit declaration files (.d.ts)
tsconfig.declaration = true;
tsconfig.module = 'commonjs';
//TODO Don't forget to change to typescript 2.0 when it is released
tsconfig.typescript = require('typescript');

var tsProject = gTs.createProject(tsconfig);

gulp.task('typescript', function () {
    //compile
    var tsResult = gulp
        .src([
            'src/**/*.ts',
            '!src/examples/**',
            'typings/**/*.ts',
            'node_modules/inversify-dts/inversify/**/*.ts'
        ])
        .pipe(gTs(tsProject));

    return merge([
        tsResult.dts.pipe(gulp.dest(config.BUILD_PATH)),
        tsResult.js.pipe(gulp.dest(config.BUILD_PATH))
    ]);
});