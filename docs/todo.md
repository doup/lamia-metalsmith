Lamia: Opinionated static site generator template built on top of Metalsmith and Gulp.

    $ gulp [serve]
    $ gulp build
    $ gulp deploy

It uses GraphicsMagick.

TODO:
- [ ] Deploy: FTP+rsync, SSH+rsync, Amazon S3+sync, GitHub pages
- [ ] assets/images/social tema hobeto pentsatu, zentzua zekak? igual Markdown+Template helper batzuk gehitu ber dizkit?
- [ ] metalsmith-benchmark. Metalsmith.use() wrapper bat gehitu.
- [ ] yo generators: `lamia`, `lamia-blog` (composed?)
- [ ] CLI
- [ ] GUI
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
- [ ] postprocess: unorphan, hyphenate, html-minifier
- [ ] RSS
- [ ] sitemap.xml
