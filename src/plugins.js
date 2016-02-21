'use strict';

module.exports.pictures = function (picSizes) {
    picSizes = picSizes || {};

    var cheerio = require('cheerio');
    var picRE   = RegExp('#('+ Object.keys(picSizes).join('|') +')$');
    var $, changed, match, ext;

    return function pictures(files, ms, done) {
        for (var file in files) {
            changed = false;
            $ = cheerio.load(files[file].contents);

            $('img').each(function () {
                var src = $(this).attr('src');

                if (src[0] != '/') {
                    src = `/assets/images/pics/${src}`;
                    match = src.match(picRE);

                    if (match) {
                        ext = require('path').extname(src);
                        src = src.replace(ext, '_'+ match[1] +'.jpg');

                        if (picSizes[match[1]].class) {
                            $(this).parent().addClass('lamia-image '+ picSizes[match[1]].class);
                        }

                        $(this).attr('src', src);
                        changed = true;
                    }
                }
            });

            if (changed) {
                files[file].contents = new Buffer($.html());
            }
        }

        done();
    };
};
