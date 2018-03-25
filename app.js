/**
 * Description of the awesome node app
 */

const PORT = process.env.PORT || 5000;

// Middlewares
const express = require('express');
const app  = express();
const bodyParser = require('body-parser');
//const fs = require('fs');
//const path = require('path');

// QR controllers
const encoder = require("./controllers/encoder.js");
const decoder = require("./controllers/decoder.js");

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Landing page
app
//  .use(express.static(path.join(__dirname, 'public')))
//  .set('views', path.join(__dirname, 'views'))
  .get('/', (req, res) => res.json({ "hello" : "hooman" }))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

/**
 *
 */
//creates FeedbackQR
app.get("/bizs/:id/purchases/", function (req, res) {
    let id   = req.params.id;
    let time = new Date().getTime();
    let img_name = "qrcodes/feedbackqr/" + id + "_" + time + ".png";

    encoder.createQRImage(res, img_name);
});

//Decodes and Evaluates FeedbackQR
app.get("/decode", function (req, res) {
  //how to load the image?
  decoder.decodeQRImage(res, );
});

//create CouponQR
app.get('/bizs/:id/coupons', function(req, res){
  let id   = req.params.id;
  let time = new Date().getTime();
  let img_name = "qrcodes/couponqr/" + id + "_" + time + ".png";

  encoder.createQRImage(res, img_name);
});

//Decode and Evaluate CouponQR
//same as FeedbackQR
app.get('decode/coupon', function (req, res) {

});

// for Facebook verification
app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})
