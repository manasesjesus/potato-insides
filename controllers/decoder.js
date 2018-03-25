/**
 * QR Encoder functions
 */

const QrCodeReader = require('qrcode-reader');
const qr = new QrCodeReader();
const fs = require('fs');

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

function decodeQRImage (url) {

    var qr = new QrCodeReader();
    qr.callback = function(err, value) {
        if (err) {
            console.error(err);
            // TODO handle error
        }
        console.log(value.result);
        console.log(value);
    };
    qr.decode(url);

}

exports.decodeQRImage = decodeQRImage;
