/**
 * Description of the awesome node app
 */

const PORT = process.env.PORT || 5000;

// Middlewares
const express = require("express");
const app  = express();
const bodyParser = require("body-parser");
const request = require("request");
const Cosmic = require("cosmicjs");
const BootBot = require("bootbot");
require("dotenv").config();
const chrono = require("chrono-node");
var schedule = require("node-schedule");
const EventEmitter = require("events").EventEmitter;
//const fs = require('fs');
//const path = require('path');

var config = {};
const reminders = [];
const eventEmitter = new EventEmitter();

// QR controllers
const encoder = require("./controllers/encoder.js");
const decoder = require("./controllers/decoder.js");

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// Start server
app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

// Define API endpoints
app.get('/', (req, res) => res.json({ "hi" : "hooman" }));


/**
 *
 */
app.get("/bizs/:id/purchases/", function (req, res) {
    let id   = req.params.id;
    let time = new Date().getTime();
    let img_name = "qrcodes/" + id + "_" + time + ".png";

    encoder.createQRImage(res, img_name);
});

/**
 *
 */
app.get('/webhook/', function(req, res) {
    console.log(req.query['hub.verify_token']);
    console.log(req.query['hub.challenge']);
    console.log(process.env.VERIFY_TOKEN);

    if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN){
        return res.send(req.query['hub.challenge']);
    }
    res.send('wrong token');
});
