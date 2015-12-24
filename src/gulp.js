'use strict';

var autoprefixer     = require('gulp-autoprefixer');
var clearRequire     = require('clear-require');
var concat           = require('gulp-concat');
var del              = require('del');
//var awspublish       = require('gulp-awspublish');
//var awspublishRouter = require("gulp-awspublish-router");
var browserSync      = require('browser-sync');
var imagemin         = require('gulp-imagemin');
var imageResize      = require('gulp-image-resize');
var merge            = require('merge-stream');
var uglify           = require('gulp-uglify');
var rename           = require('gulp-rename');
var rev              = require('gulp-rev');
var revReplace       = require('gulp-rev-replace');
var sass             = require('gulp-sass');

process.on('uncaughtException', console.log);

module.exports = function (gulp, config) {
    gulp.task('clean:pre-build', () => {
        return del(['.pre-build']);
    });

    gulp.task('clean:build', () => {
        return del(['build']);
    });

    gulp.task('metalsmith', (done) => {
        clearRequire('./metalsmith');
        require('./metalsmith')(config, done);
    });

    gulp.task('assets:js', () => {
        var streams = [];

        for (var target in config.assets.js) {
            streams.push(
                gulp.src(config.assets.js[target])
                    .pipe(concat(target))
                    .pipe(uglify())
                    .pipe(gulp.dest('.pre-build/js'))
            );
        }

        return merge.apply(null, streams);
    });

    gulp.task('assets:css', () => {
        return gulp.src('source/scss/**/*.scss')
            .pipe(sass({
                outputStyle: 'compressed',
                includePaths: config.assets.sass_include_paths,
            }).on('error', sass.logError))
            .pipe(autoprefixer())
            .pipe(gulp.dest('.pre-build/css'));
    });

    // Copy non image assets
    gulp.task('assets:copy', () => {
        var streams = [];

        streams.push(
            gulp.src(['source/assets/**/*', '../assets/**/*', '!**/*.{svg,jpg,jpeg,png,gif}'])
                .pipe(gulp.dest('.pre-build/assets'))
        );

        for (var glob in config.assets.copy) {
            streams.push(
                gulp.src(glob)
                    .pipe(gulp.dest(`.pre-build/assets/${config.assets.copy[glob]}`))
            );
        }

        return merge.apply(null, streams);
    });

    gulp.task('assets:images:pics', () => {
        var streams = [];
        var source  = gulp.src('../assets/images/pics/**/*.{svg,jpg,jpeg,png,gif}');
        var cfg;

        for (var key in config.assets.pic_sizes) {
            var cfg = config.assets.pic_sizes[key];

            // Crop if both sizes given
            if (cfg.width && cfg.height) {
                cfg.crop = true;
            }

            // Other defaults
            cfg.upscale = true;
            cfg.quality = cfg.quality || 0.75;
            cfg.format  = 'jpg';

            (function (key, cfg) {
                streams.push(
                    source
                        .pipe(imageResize(cfg))
                        .pipe(rename(function (path) { path.basename += '_'+ key; }))
                        .pipe(imagemin())
                        .pipe(gulp.dest('.pre-build/assets/images/pics'))
                );
            })(key, cfg);
        }

        return merge.apply(null, streams);
    });

    gulp.task('assets:images:social', () => {
        var streams = [];
        var source  = gulp.src('../assets/images/social/**/*.{svg,jpg,jpeg,png,gif}');

        function addSize(key, width, height) {
            streams.push(
                source
                    .pipe(imageResize({ upscale: true, crop: true, width: width, height: height, format: 'jpg', quality: 0.75 }))
                    .pipe(rename(function (path) { path.basename += '_'+ key; }))
                    .pipe(imagemin())
                    .pipe(gulp.dest('.pre-build/assets/images/social'))
            )
        }

        addSize('slarge', 1200, 630);
        addSize('smedium', 560, 300);

        return merge.apply(null, streams);
    });

    gulp.task('assets:images:other', (done) => {
        var glob = [
            'source/assets/**/*.{svg,jpg,jpeg,png,gif}',
            '../assets/**/*.{svg,jpg,jpeg,png,gif}',
            '!../assets/images/pics/**/*',
            '!../assets/images/social/**/*',
        ];

        return gulp.src(glob)
            .pipe(imagemin())
            .pipe(gulp.dest('.pre-build/assets'));
    });

    gulp.task('assets:images', gulp.parallel('assets:images:pics', 'assets:images:social', 'assets:images:other'));

    gulp.task('revision', () => {
        return gulp.src(['.pre-build/js/*.js', '.pre-build/css/*.css'])
            .pipe(rev())
            .pipe(gulp.dest('build/assets'))
            .pipe(rev.manifest({ base: 'assets' }))
            .pipe(gulp.dest('build/assets'));
    });

    gulp.task('revision:replace', () => {
        var manifest = gulp.src('build/rev-manifest.json');

        return gulp.src('.pre-build/metalsmith/**/*.html')
            .pipe(revReplace({ manifest: manifest }))
            .pipe(gulp.dest('build'));
    });

    // Copy .pre-build/assets to build/assets
    gulp.task('build:copy', () => {
        return gulp.src('.pre-build/assets/**/*')
            .pipe(gulp.dest('build/assets'));
    });

    gulp.task('build:post', gulp.series('revision', 'revision:replace', 'build:copy'));

    gulp.task('build:project', gulp.series(
        'clean:build',
        'metalsmith',
        gulp.parallel('assets:js', 'assets:css', 'assets:copy', 'assets:images'),
        'build:post'
    ));

    gulp.task('serve:reload', () => {
        browserSync.reload();
    });

    gulp.task('serve:server', (done) => {
        browserSync({
            notify: true,
            server: {
                baseDir: './build'
            }
        }, done);
    });

    gulp.task('serve:watch', () => {
        gulp.watch(['../content/**/*.md', 'source/metalsmith.js', 'source/i18n/**/*', 'source/templates/**/*'], gulp.series('metalsmith', 'build:post', 'serve:reload'));
        gulp.watch('source/js/**/*', gulp.series('assets:js', 'build:post', 'serve:reload'));
        gulp.watch('source/scss/**/*', gulp.series('assets:css', 'build:post', 'serve:reload'));
    });

    gulp.task('serve', gulp.series('clean:pre-build', 'build:project', 'serve:server', 'serve:watch'));
    gulp.task('build', gulp.series('clean:pre-build', 'build:project'));

    gulp.task('default', gulp.series('serve'));
};

/*
if (!isDebug) {
    // Post processing
    MS.use(unorphan({
        select: 'a, p, blockquote, span, li, h1, h2, h3, h4, h5, h6',
        not:    '[data-dont-unorphan]',
        br:     true,
    }))
    .use(hyphenate({
        select:  'p, span, strong, em, ul > li, li > a, p > a',
        not:     '[data-dont-hyphenate], [data-dont-hyphenate] li, blockquote p',
        locales: locales,
    }))
    .use(imgFragments())
    .use(htmlMinifier())
}
*/

// gulp.task('upload', () => {
//     // create a new publisher
//     var publisher = awspublish.create(config.s3);
//
//     return gulp.src('**/*', { cwd: './build/' })
//         .pipe(awspublishRouter({
//             cache:  { cacheTime: 1800 }, // cache for 30 minutes by default
//             routes: {
//                 // don't modify original key. this is the default
//                 // use gzip for assets that benefit from it
//                 // cache static assets for 2 years
//                 "^assets/(?:.+)\\.(?:js|css|svg|ttf)$": {
//                     key: "$&",
//                     gzip: true,
//                     cacheTime: 630720000
//                 },
//                 // cache static assets for 2 years
//                 "^assets/.+$": { cacheTime: 630720000 },
//                 "^.+\\.html": { gzip: true },
//                 // pass-through for anything that wasn't matched by routes above,
//                 // to be uploaded with default options
//                 "^.+$": "$&"
//             }
//         }))
//         .pipe(publisher.publish())
//         .pipe(publisher.sync())
//         .pipe(publisher.cache())
//         .pipe(awspublish.reporter());
// });

// gulp.task('deploy', gulp.series('build', 'upload'));
