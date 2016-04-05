# Lamia

Opinionated static site generator template built on top of Metalsmith and Gulp.

```
var gulp  = require('gulp');
var Lamia = require('lamia');
var path  = require('path');

gulp.registry(new Lamia(path.join(__dirname, '../'), require('./deploy.json')));
```

## Project structure

```
/assets
    /images
        /pics
        /social
/content
/lamia
    config.yml
    /source
        metalsmith.js
        /i18n
        /js
        /public
        /scss
        /templates
```

    $ gulp --env=prod
