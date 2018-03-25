/**
 * QR Encoder functions
 */
const QRCode = require('qrcode');
const fs = require('fs');
var QRCodeReader = require('qrcode-reader');

function decodeQRImage () {
  console.log("decoding image:");

  var Jimp = require("jimp");
  //read send img
  var buffer = fs.readFileSync('qrcodes/feedbackqr/IMG_4583.jpg');
  Jimp.read(buffer, function(err, image) {
      if (err) {
          console.error(err);
          // TODO handle error
      }
      var qr = new QRCodeReader();
      qr.callback = function(err, value) {
          if (err) {
              console.error(err);
              // TODO handle error
          }
          //QRCode data
          var qrdata = value.result;
          console.log(qrdata);
          //console.log(value);

          //validate img
          console.log("validate process:");
          let validateName = 'qrcodes/' + qrdata + '.png';

          fs.readFile(validateName, (err, data) => {
            if (err) {console.log("error finding file")};
            console.log("data valid");
          });

      };

      qr.decode(image.bitmap);
  });


}

exports.decodeQRImage = decodeQRImage;
