const gulp = require("gulp");
const sourcemaps = require("gulp-sourcemaps");
const rename = require("gulp-rename");
const babel = require("gulp-babel");

gulp.task("default", function () {
    return gulp.src("public/js/main.js")
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(rename({
            // dirname: "dist",
            // prefix: "somePrefix-",
            basename: "main",
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest("public/js"));
});