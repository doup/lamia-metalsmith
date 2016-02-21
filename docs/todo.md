Lamia: Opinionated static site generator template built on top of Metalsmith and Gulp.

    $ gulp [serve]
    $ gulp build
    $ gulp deploy

It uses GraphicsMagick.

IMPORTANT:
- [ ] Deploy:
    - [X] Amazon S3+sync
    - [ ] FTP+rsync
    - [ ] SSH+rsync
    - [ ] GitHub pages
- [X] assets/images/social tema hobeto pentsatu, zentzua zekak?
- [X] lamia/source/assets => public izena jarri. Ta artxibuak raiz-ea kopiatu. (favicon.ico tema soluzionatzeko)

NEXT:
- [ ] Meta/SocialImages/Disqus/Analytics temantzat Mixin/Helper batzuk sortu?
- [ ] console.log => debug = require('debug')('lamia')
- [ ] reload on config.yml change
- [ ] yo generators: `lamia`, `lamia-blog` (composed?)
- [ ] gulp tasken izenak eta pathei koherentzi gehio ematen saiatu

TODO:
- [ ] metalsmith-benchmark. Metalsmith.use() wrapper bat gehitu.
- [ ] CLI
- [ ] GUI

DONE:
- [X] build eta pre-build, tmp karpetan baten jarri, bestela dropboxen jarri ezkeo gero movidak eongoituk.
- [X] viewHelpers integratu
- [X] User eta Developer experientziak separatu: /content eta /lamia
- [X] Hooks.
- [X] showDrafts kendu, ta horren berren if bat erabili. Show drafts-ek propiedadia aldatzen bait dik.
- [X] URLs
- [X] Redirections
- [X] gulp-useref es util? Aurreago beitu, cuando este consolidado un poco el codebase. Eztek bearrezkua.
- [X] fingerprint bueltan jarri layout.jade-en
- [X] pipeline eta metalsmith hobeto separatu? /metalsmith.js edo /metalsmith/helpers.js|build.js|plugins.js
- [X] config.yml

TODO PROJECT:
- [ ] setProperty npm package baten bihurtu
- [ ] markdownetan ##title => ## title
- [ ] postprocess (plugins?): unorphan, hyphenate, html-minifier
- [ ] RSS
- [ ] sitemap.xml
