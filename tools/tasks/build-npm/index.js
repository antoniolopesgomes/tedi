var gulp = require('gulp');
var gSeq = require('gulp-sequence');
var merge = require('merge2');
var del = require('del');
var fs = require('fs');
var gSym = require('gulp-sym');

//REUIRE TASKS DEPENDENCIES
require('../typescript');

//CONFIGURATION
var config = require('../config');

//CLEAN
gulp.task('npm:clean', function () {
    return del([
        config.BUILD_PATH + '/**',
    ]);
})

//COPY FILES
gulp.task('npm:copy-files', function () {
    return merge(
        gulp.src(['package.json', 'README.md', 'LICENSE'])
            .pipe(gulp.dest(config.BUILD_PATH)),
        gulp.src(['tools/tasks/build-npm/files/spec/**/*'])
            .pipe(gulp.dest(config.BUILD_PATH + '/spec'))
    )
});

//CREATE SYMLINK IN NODE_MODULES
gulp.task('npm:symlink', function (done) {
    return fs.symlink('d:/projects/tedi/dist/npm', 'node_modules/tedi', function (error) {
        console.log(error);
        return error ? done(error) : done();
    });
});

gulp.task('build', gSeq(
    'npm:clean',
    'typescript',
    'npm:copy-files')
);

gulp.task('build:watch', ['build'], function () {
    gulp.watch(
        ['src/**/*.ts', '!src/examples/**'],
        ['typescript']
    );
});