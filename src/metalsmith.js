'use strict';

var assign       = require('lodash.assign');
var clearRequire = require('clear-require');
var noop         = function () {};
var path         = require('path');

var Metalsmith    = require('metalsmith');
var branch        = require('metalsmith-branch');
var drafts        = require('metalsmith-drafts');
var filenameDate  = require('metalsmith-date-in-filename');
var ignore        = require('metalsmith-ignore');
var i18n          = require('metalsmith-i18n');
var layouts       = require('metalsmith-layouts');
var markdown      = require('metalsmith-markdownit');
var mingo         = require('metalsmith-mingo');
var multiLanguage = require('metalsmith-multi-language');
var permalinks    = require('metalsmith-permalinks');
var redirect      = require('metalsmith-redirect');
var slug          = require('metalsmith-slug');

// Lamia plugins
var pictures = require('./plugins').pictures;

// Markdown-it config
var markdown = markdown({ linkify: true, typographer: true })
    .use(require('markdown-it-footnote'));

module.exports = function metalsmithBuild(config, done) {
    clearRequire(config.paths.project_metalsmith);

    var project = require(config.paths.project_metalsmith);

    // INIT
    var ms = Metalsmith(config.paths.base);

    ms.source('content');
    ms.destination(path.join(config.paths.pre_build, 'metalsmith'));
    ms.clean(false);
    ms.use(ignore(['.DS_Store', '*/.DS_Store']));

    // Multi-language
    // This must go before drafts, since the secondary locale
    // gets some of its properties from the primary locale.
    // For example `draft`.
    ms.use(multiLanguage({
        default: config.i18n.default,
        locales: config.i18n.locales
    }));

    // Drafts handling
    if (config.env != 'dev') {
        ms.use(drafts());
    }

    // PRE MARKDOWN HOOK
    (project.preMarkdown || noop)(ms, config);

    // RENDER MARKDOWN
    ms.use(filenameDate());
    ms.use(i18n({
        default:   config.i18n.default,
        locales:   config.i18n.locales,
        directory: path.join(config.paths.source, 'i18n')
    }));
    ms.use(slug({ patterns: ['*.md'], lower: true }));
    ms.use(markdown);
    ms.use(pictures(config.assets.pic_sizes));

    // POST MARKDOWN HOOK
    (project.postMarkdown || noop)(ms, config);

    // RENDER LAYOUTS
    // Change URLs
    if (config.urls) {
        for (var glob in config.urls) {
            ms.use(branch(glob).use(permalinks({ pattern: config.urls[glob] })))
        }
    }

    // Render with templates
    var viewHelpers = {
        nl2br:       str => str.replace(/(\r\n|\n\r|\r|\n)/g, '<br/>'),
        env:         config.env,
        markdown:    str => markdown.parser.render(str),
        isoDate:     date => date.toISOString().substr(0, 10),
        socialImage: (img, size) => {
            size = size || 'large';
            return `/assets/images/social/${img}_${size}.jpg`;
        },
        url: (url) => {
            if (config.env === 'dev') {
                return url;
            } else {
                return config.base_url + url;
            }
        },
    };

    ms.use(mingo());
    ms.metadata(assign((project.viewHelpers || noop)(config) || {}, viewHelpers));
    ms.use(layouts({
        engine:    'jade',
        directory: path.join(config.paths.source, 'templates')
    }));

    // POST LAYOUT HOOK
    (project.postLayout || noop)(ms, config);

    // Redirections
    if (config.redirect) {
        ms.use(redirect(config.redirect));
    }

    // BUILD
    ms.build(done);
};
