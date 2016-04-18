Lamia: Opinionated static site generator template built on top of Metalsmith and Gulp.

    $ gulp [serve]
    $ gulp build
    $ gulp deploy

It uses GraphicsMagick.

TODO:
- [ ] Deploy:
    - [X] Amazon S3+sync
    - [X] Local Folder
    - [ ] GitHub pages
        - Base URL? http://grautonomia.github.io/web/ que funcione en local y en GitHub.
        - Puede ser tambien en: http://grautonomia.github.io
    - [ ] FTP+rsync
    - [ ] SSH+rsync
- [ ] config.yml mailan URLia i18n-eko aukera eon berko zian
- [ ] Nik tuneautako paketiak berriro gehitu, adib.: `metalsmith-slug`
- [ ] Watch debounce/throotle.
- [ ] Meta/SocialImages/Disqus/Analytics temantzat Mixin/Helper batzuk sortu?
- [ ] console.log => debug = require('debug')('lamia')
- [ ] reload on config.yml change
- [ ] gulp tasken izenak eta pathei koherentzi gehio ematen saiatu (si hace falta, oain etziok ondo?)
- [X] No copiar las imagenes originales a `pics` y a `social`.
- [X] assets/images/social tema hobeto pentsatu, zentzua zekak?
- [X] lamia/source/assets => public izena jarri. Ta artxibuak raiz-ea kopiatu. (favicon.ico tema soluzionatzeko)

NEXT:
- [ ] yo generators: `lamia`, `lamia-blog` (composed?)
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
