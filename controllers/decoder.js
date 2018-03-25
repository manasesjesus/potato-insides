/**
 * QR Encoder functions
 */

const QrCodeReader = require('qrcode-reader');
const qr = new QrCodeReader();
const fs = require('fs');
var http = require('http');

qr.callback = function(error, result) {
    if(error) {
        console.log(error);
        return;
    }
    console.log(result);
}

function decodeQRImageLocal () {
    var Jimp = require("jimp");
    var buffer = fs.readFileSync("qrcodes/feedbacks/IMG_2018.jpg");

    Jimp.read(buffer, function(err, image) {
        if (err) {
            // TODO: handle error
            console.log("There was an error here:");
            console.error(err);

            return;
        }

        var qr = new QrCodeReader();
        qr.callback = function(err, value) {
            if (err) {
                console.error(err);
                // TODO handle error
            }
            console.log(value.result);
            console.log(value);
        };
        qr.decode(image.bitmap);
    });
}

function decodeQRImage (res, img_url) {
    const download = require('image-downloader');
    img_url = 'http://scontent-ort2-1.xx.fbcdn.net/v/t34.0-12/29138872_105103870336911_1203187849_n.jpg?_nc_cat=0&_nc_ad=z-m&_nc_cid=0&oh=0c18af2bc3abc969fd6b039ce8095e67&oe=5AB8F89A';
    let img_name = 'qrcodes/feedbacks/uid_timestap.jpg';
    options = {
        url: img_url,
        dest: img_name
    }

    download.image(options)
            .then(({ filename, image }) => {
                console.log('File saved to', filename);

                var Jimp = require("jimp");
                var buffer = fs.readFileSync(filename);

                console.log("leido....");

                Jimp.read(buffer, function(err, image) {
                    if (err) {
                        // TODO: handle error
                        console.log("There was an error here:");
                        console.error(err);

                        return;
                    }

                    var qr = new QrCodeReader();
                    qr.callback = function(err, value) {
                        if (err) {
                            console.log("invalid code");
                            return null;
                        }
                        console.log(value.result);
                        console.log(value);
                        res.json({ msg_decoded : value.result });
                    };
                    qr.decode(image.bitmap);
                });

            }).catch((err) => {
                throw err
            });

}

exports.decodeQRImage = decodeQRImage;
