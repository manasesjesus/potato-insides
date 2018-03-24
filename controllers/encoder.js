/**
 * QR Encoder functions
 */

const QRCode = require('qrcode');
const fs = require('fs');

function createQRImage (res, img_name) {
    QRCode.toFile(img_name, "www.thisIsSparta.com", {
        color: {
            dark: "#F00",   // Blue dots
            light: "#0000"  // Transparent background
        },
        width: 500          // Image size (pixels)
    }, function (err) {
        if (err) throw err

        let img = fs.readFileSync(img_name);

        res.writeHead(200, { "Content-Type": "image/png" });
        res.end(img, "binary");

    });
}

exports.createQRImage = createQRImage;
