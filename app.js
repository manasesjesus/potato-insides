/**
 * Description of the awesome node app
 */

const PORT = process.env.PORT || 5000;

// Middlewares
const express = require('express');
const app  = express();
//const fs = require('fs');
//const path = require('path');

// QR controllers
const encoder = require("./controllers/encoder.js");
const decoder = require("./controllers/decoder.js");

// Landing page
app
//  .use(express.static(path.join(__dirname, 'public')))
//  .set('views', path.join(__dirname, 'views'))
  .get('/', (req, res) => res.json({ "hello" : "hooman" }))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

/**
 *
 */
app.get("/bizs/:id/purchases/", function (req, res) {
    let id   = req.params.id;
    let time = new Date().getTime();
    let img_name = "qrcodes/" + id + "_" + time + ".png";

    encoder.createQRImage(res, img_name);
});
