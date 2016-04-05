'use strict';

var fs   = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var yaml = require('js-yaml');
var path = require('path');
var util = require('util');
var prettyjson = require('prettyjson');
var Registry = require('undertaker-registry');
var config;

function LamiaRegistry(projectDir, deployConfig) {
    Registry.call(this);

    // Config
    try {
        config = yaml.safeLoad(fs.readFileSync(`${projectDir}/lamia/config.yml`, 'utf8'));
    } catch (e) {
        console.log(e);
    }

    if (argv._[0] == 'deploy') {
        config.env = 'prod';
    } else {
        config.env = argv.env ? argv.env : 'dev';
    }

    config.version = require('../package.json').version;

    // Deploy options
    config.deploy = deployConfig || { type: false };

    // Generate project hash for tmp file from project path
    config.project_hash = require('crypto').createHash('md5').update(projectDir).digest('hex');

    config.paths = {};
    config.paths.base = projectDir;
    config.paths.tmp = path.join(require('os').homedir(), '.lamia', config.project_hash);
    config.paths.assets = path.join(config.paths.base, 'assets');
    config.paths.content = path.join(config.paths.base, 'content');
    config.paths.build = path.join(config.paths.tmp, 'build');
    config.paths.pre_build = path.join(config.paths.tmp, 'pre-build');
    config.paths.source = path.join(config.paths.base, 'lamia/source');
    config.paths.project_metalsmith = path.join(config.paths.base, 'lamia/source/metalsmith.js');

    console.log();
    console.log(prettyjson.render(config.paths));
    console.log();

    this.config = config;
}

util.inherits(LamiaRegistry, Registry);

LamiaRegistry.prototype.init = function init(gulp) {
    require('./gulp')(gulp, this.config);
};

module.exports = LamiaRegistry;
