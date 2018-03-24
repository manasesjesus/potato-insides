const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app  = express();
const QRCode = require('qrcode');
const fs = require('fs');

app
//  .use(express.static(path.join(__dirname, 'public')))
//  .set('views', path.join(__dirname, 'views'))
//  .set('view engine', 'ejs')
  .get('/', (req, res) => res.json({ "hello" : "world" }))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

//
app.get("/qrcodes/customer", function (req, res) {
    // middleware to generate a qrcode

    QRCode.toFile('qrcodes/test.png', 'www.thisIsATest.com', {
        color: {
            dark: '#00F',  // Blue dots
            light: '#0000' // Transparent background
        },
        width: 500
    }, function (err) {
        if (err) throw err
        console.log('done');

        var img = fs.readFileSync('qrcodes/test.png');

        res.writeHead(200, {'Content-Type': 'image/png' });
        res.end(img, 'binary');

    });

});
//important
