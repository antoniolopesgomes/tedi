var gulp = require('gulp');
var gSeq = require('gulp-sequence');
var merge = require('merge2');
var del = require('del');
var fs = require('fs');

//REQUIRE TASKS DEPENDENCIES
require('./typescript');

//CONFIGURATION
var config = require('./_config');

//CLEAN
gulp.task('clean', function () {
    return del([
        config.BUILD_PATH + '/**',
    ]);
})

//COPY FILES
gulp.task('copy-files', function () {
    return merge(
        gulp.src(['package.json', 'README.md', 'LICENSE'])
            .pipe(gulp.dest(config.BUILD_PATH))
    )
});

gulp.task('build', gSeq(
    'clean',
    'typescript',
    'copy-files')
);

gulp.task('build:watch', ['build'], function () {
    gulp.watch(
        ['src/**/*.ts', '!src/examples/**'],
        ['typescript']
    );
});