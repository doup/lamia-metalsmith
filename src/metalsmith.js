'use strict';

var clearRequire = require('clear-require');
var config = require('./index').config;

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
var noop          = function () {};

// Lamia plugins
var pictures   = require('./plugins').pictures;
var showDrafts = require('./plugins').showDrafts;

// Markdown-it config
var markdown = markdown({ linkify: true, typographer: true })
    .use(require('markdown-it-footnote'));

var viewHelpers = {
    nl2br: str => str.replace(/(\r\n|\n\r|\r|\n)/g, '<br/>'),
    config: config,
    markdown: str => markdown.parser.render(str),
    isoDate: date => date.toISOString().substr(0, 10),
};

module.exports = function metalsmithBuild(config, done) {
    clearRequire(config.paths.project_metalsmith);

    var project = require(config.paths.project_metalsmith);

    // INIT
    var ms = Metalsmith(config.paths.base);

    ms.source('content')
    ms.destination('lamia/.pre-build/metalsmith')
    ms.clean(false)
    ms.use(ignore(['.DS_Store', '*/.DS_Store']))

    // Multi-language
    // This must go before drafts, since the secondary locale
    // gets some of its properties from the primary locale.
    // For example `draft`.
    ms.use(multiLanguage({
        default: config.i18n.default,
        locales: config.i18n.locales
    }))

    // Drafts handling
    if (config.env != 'dev') {
        ms.use(drafts());
    }

    // PRE MARKDOWN HOOK
    (project.preMarkdown || noop)(ms, config);

    // RENDER MARKDOWN
    ms.use(filenameDate())
    ms.use(i18n({
        default:   config.i18n.default,
        locales:   config.i18n.locales,
        directory: config.paths.source +'i18n'
    }))
    ms.use(slug({ patterns: ['*.md'], lower: true }))
    ms.use(markdown)
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
    ms.use(mingo())
    ms.metadata(viewHelpers)
    ms.use(layouts({
        engine:    'jade',
        directory: config.paths.source +'templates'
    }))

    // Redirections
    if (config.redirect) {
        ms.use(redirect(config.redirect));
    }

    // POST LAYOUT HOOK
    (project.postLayout || noop)(ms, config);

    // BUILD
    ms.build(done);
};
