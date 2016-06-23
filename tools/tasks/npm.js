var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var del = require('del');
var tsconfig = require('../../tsconfig.json').compilerOptions;

tsconfig.declaration = true;
tsconfig.module = 'commonjs';
tsconfig.typescript = require('typescript');

function compileTypescript() {
    var tsResult = gulp
        .src([
            'src/**/*.ts', 
            'typings/**/*.ts',
            'node_modules/inversify-dts/inversify/**/*.ts'
        ])
        .pipe(ts(tsconfig));
    
    return merge([
        tsResult.dts.pipe(gulp.dest('dist/definitions')),
        tsResult.js.pipe(gulp.dest('dist/js'))
    ]);    
}

gulp.task('clean', function () {
    return del([
        'dist/**'
    ]);
})

gulp.task('typescript', ['clean'], function () {
    return compileTypescript();
});