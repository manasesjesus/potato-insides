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

function decodeQRImage () {
    var Jimp = require("jimp");
    var buffer = fs.readFileSync("qrcodes/feedbacks/IMG_2018.png");
    Jimp.read(buffer, function(err, image) {
        if (err) {
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

exports.decodeQRImage = decodeQRImage;
