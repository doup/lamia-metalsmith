'use strict';

var autoprefixer     = require('gulp-autoprefixer');
var clearRequire     = require('clear-require');
var concat           = require('gulp-concat');
var del              = require('del');
var awspublish       = require('gulp-awspublish');
var awspublishRouter = require('gulp-awspublish-router');
var browserSync      = require('browser-sync');
var ghPages          = require('gulp-gh-pages');
var imagemin         = require('gulp-imagemin');
var imageResize      = require('gulp-image-resize');
var merge            = require('merge-stream');
var uglify           = require('gulp-uglify');
var path             = require('path');
var rename           = require('gulp-rename');
var rev              = require('gulp-rev');
var revReplace       = require('gulp-rev-replace');
var sass             = require('gulp-sass');

process.on('uncaughtException', console.log);

module.exports = function (gulp, config) {
    function buildPath(paths) { return path.join.apply(path, [config.paths.build].concat(paths)); }
    function prebuildPath(paths) { return path.join.apply(path, [config.paths.pre_build].concat(paths)); }

    gulp.task('clean:pre-build', () => {
        return del(config.paths.pre_build, { force: true });
    });

    gulp.task('clean:build', () => {
        return del(config.paths.build, { force: true });
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
                    .pipe(gulp.dest(prebuildPath(['js'])))
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
            .pipe(gulp.dest(prebuildPath(['css'])));
    });

    // Copy non image assets
    gulp.task('assets:copy', () => {
        var streams = [];

        streams.push(
            gulp.src(['../assets/**/*', '!**/*.{svg,jpg,jpeg,png,gif}'])
                .pipe(gulp.dest(prebuildPath(['public/assets'])))
        );

        for (var glob in config.assets.copy) {
            streams.push(
                gulp.src(glob)
                    .pipe(gulp.dest(prebuildPath(['public/assets', config.assets.copy[glob]])))
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
                        .pipe(gulp.dest(prebuildPath(['public/assets/images/pics'])))
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
                    .pipe(gulp.dest(prebuildPath(['public/assets/images/social'])))
            )
        }

        addSize('large', 1200, 630);
        addSize('medium', 560, 300);

        return merge.apply(null, streams);
    });

    gulp.task('assets:images:other', (done) => {
        var glob = [
            '../assets/**/*.{svg,jpg,jpeg,png,gif}',
            '!../assets/images/pics/**/*',
            '!../assets/images/social/**/*',
        ];

        return gulp.src(glob)
            .pipe(imagemin())
            .pipe(gulp.dest(prebuildPath(['public/assets'])));
    });

    gulp.task('assets:images', gulp.parallel('assets:images:pics', 'assets:images:social', 'assets:images:other'));

    gulp.task('public:images', (done) => {
        return gulp.src('source/public/**/*.{svg,jpg,jpeg,png,gif}')
            .pipe(imagemin())
            .pipe(gulp.dest(prebuildPath(['public'])));
    });

    gulp.task('public:files', () => {
        return gulp.src(['source/public/**/*', '!**/*.{svg,jpg,jpeg,png,gif}'])
            .pipe(gulp.dest(prebuildPath(['public'])));
    });

    gulp.task('public', gulp.parallel('assets:js', 'assets:css', 'assets:copy', 'assets:images', 'public:images', 'public:files'));

    gulp.task('revision', () => {
        return gulp.src([prebuildPath(['js/*.js']), prebuildPath(['css/*.css'])])
            .pipe(rev())
            .pipe(gulp.dest(buildPath(['assets'])))
            .pipe(rev.manifest({ base: 'assets' }))
            .pipe(gulp.dest(buildPath(['assets'])));
    });

    gulp.task('revision:replace', () => {
        var manifest = gulp.src(buildPath(['rev-manifest.json']));

        return gulp.src(prebuildPath(['metalsmith/**/*.html']))
            .pipe(revReplace({ manifest: manifest }))
            .pipe(gulp.dest(config.paths.build));
    });

    // Copy .pre-build/assets to build/assets
    gulp.task('build:copy', () => {
        return gulp.src(prebuildPath(['public/**/*']))
            .pipe(gulp.dest(config.paths.build));
    });

    gulp.task('build:post', gulp.series('revision', 'revision:replace', 'build:copy'));

    gulp.task('build:project', gulp.series(
        'clean:build',
        'metalsmith',
        'public',
        'build:post'
    ));

    gulp.task('serve:reload', () => {
        browserSync.reload();
    });

    gulp.task('serve:server', (done) => {
        browserSync({
            notify: true,
            server: {
                baseDir: config.paths.build
            }
        }, done);
    });

    gulp.task('serve:watch', () => {
        gulp.watch(['../content/**/*.md', 'source/metalsmith.js', 'source/i18n/**/*', 'source/templates/**/*'], gulp.series('metalsmith', 'build:post', 'serve:reload'));
        gulp.watch('source/js/**/*', gulp.series('assets:js', 'build:post', 'serve:reload'));
        gulp.watch('source/scss/**/*', gulp.series('assets:css', 'build:post', 'serve:reload'));
    });

    if (config.deploy.type == 's3') {
        gulp.task('upload', function () {
            // create a new publisher
            var publisher = awspublish.create({
                "params": {
                    "Bucket": config.deploy.config.bucket
                },
                "accessKeyId":     config.deploy.config.access_key_id,
                "secretAccessKey": config.deploy.config.secret_access_key,
                "region":          config.deploy.config.region
            });

            return gulp.src('**/*', { cwd: config.paths.build })
                .pipe(awspublishRouter({
                    cache:  { cacheTime: 1800 }, // cache for 30 minutes by default
                    routes: {
                        // don't modify original key. this is the default
                        // use gzip for assets that benefit from it
                        // cache static assets for 2 years
                        "^assets/(?:.+)\\.(?:js|css|svg|ttf)$": {
                            key: "$&",
                            gzip: true,
                            cacheTime: 630720000
                        },
                        // cache static assets for 2 years
                        "^assets/.+$": { cacheTime: 630720000 },
                        "^.+\\.html": { gzip: true },
                        // pass-through for anything that wasn't matched by routes above,
                        // to be uploaded with default options
                        "^.+$": "$&"
                    }
                }))
                .pipe(publisher.publish())
                .pipe(publisher.sync())
                .pipe(publisher.cache())
                .pipe(awspublish.reporter());
        });
    } else if (config.deploy.type == 'gh-pages') {
        gulp.task('upload', function () {
            return gulp.src('**/*', { cwd: config.paths.build })
                .pipe(ghPages());
        });

    } else {
        gulp.task('upload', () => {});
    }

    gulp.task('serve', gulp.series('clean:pre-build', 'build:project', 'serve:server', 'serve:watch'));
    gulp.task('build', gulp.series('clean:pre-build', 'build:project'));
    gulp.task('deploy', gulp.series('build', 'upload'));

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
