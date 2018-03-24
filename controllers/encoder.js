/**
 * QR Encoder functions
 */

const QRCode = require('qrcode');
const fs = require('fs');

/**
 * Create an unique QR-code image
 * Response:
 *      the QR-code as a PNG image
 */
function createQRImage (res, img_name) {
    QRCode.toFile(img_name, img_name.substring(img_name.indexOf("/") + 1, img_name.indexOf(".png")), {
        color: {
            dark: "#00F",   // Blue dots
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
