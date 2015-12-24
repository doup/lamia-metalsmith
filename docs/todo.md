Lamia: Opinionated static site generator template built on top of Metalsmith and Gulp.

    $ gulp [serve]
    $ gulp build
    $ gulp deploy

It uses GraphicsMagick.

TODO:
- [ ] build eta pre-build, tmp karpetan baten jarri, bestela dropboxen jarri ezkeo gero movidak eongoituk.
- [ ] assets/images/social tema hobeto pentsatu, zentzua zekak? igual Markdown+Template helper batzuk gehitu ber dizkit?
- [ ] User eta Developer experientziak separatu: /content eta /lamia
- [ ] metalsmith-benchmark. Metalsmith.use() wrapper bat gehitu.
- [ ] markdownetan ##title => ## title
- [ ] postprocess: unorphan, hyphenate, html-minifier
- [ ] RSS
- [ ] sitemap.xml
- [ ] Deploy: FTP, s3, github pages
- [ ] setProperty npm package baten bihurtu
- [ ] viewHelpers integratu
- [X] Hooks.
- [X] showDrafts kendu, ta horren berren if bat erabili. Show drafts-ek propiedadia aldatzen bait dik.
- [X] URLs
- [X] Redirections
- [X] gulp-useref es util? Aurreago beitu, cuando este consolidado un poco el codebase. Eztek bearrezkua.
- [X] fingerprint bueltan jarri layout.jade-en
- [X] pipeline eta metalsmith hobeto separatu? /metalsmith.js edo /metalsmith/helpers.js|build.js|plugins.js
- [X] config.yml
