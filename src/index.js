'use strict';

var fs   = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var yaml = require('js-yaml');
var path = require('path');
var util = require('util');
var DefaultRegistry = require('undertaker-registry');
var config;

function LamiaRegistry(baseDir) {
    DefaultRegistry.call(this);

    // Config
    try {
        module.exports.config = config = yaml.safeLoad(fs.readFileSync(`${baseDir}/config.yml`, 'utf8'));
    } catch (e) {
        console.log(e);
    }

    if (argv._[0] == 'deploy') {
        config.env = 'prod';
    } else {
        config.env = argv.env ? argv.env : 'dev';
    }

    config.paths = { base: require('path').normalize(baseDir + '/../') }
    config.paths.assets = path.join(config.paths.base, 'assets/');
    config.paths.content = path.join(config.paths.base, 'content/');
    config.paths.build = path.join(config.paths.base, '.build/');
    config.paths.pre_build = path.join(config.paths.base, '.pre-build/');
    config.paths.source = path.join(config.paths.base, 'lamia/source/');
    config.paths.project_metalsmith = path.join(config.paths.base, 'lamia/source/metalsmith.js');

    this.config = config;
}

util.inherits(LamiaRegistry, DefaultRegistry);

LamiaRegistry.prototype.init = function init(gulp) {
    require('./gulp')(gulp, this.config);
};

module.exports = LamiaRegistry;
