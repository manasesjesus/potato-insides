'use strict';
/**
 * Description of the awesome node app
 */


const PORT = process.env.PORT || 1337;

// Middlewares
const express = require("express");
const app  = express();
const bodyParser = require("body-parser");
const request = require("request");

require("dotenv").config();

//const fs = require('fs');
//const path = require('path');

// QR controllers
const encoder = require("./controllers/encoder.js");
const decoder = require("./controllers/decoder.js");

// Process application/x-www-form-urlencoded
app.set('port', PORT);
//app.use(bodyParser.urlencoded({extended: false}))
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
    let img_name = "qrcodes/purchases" + id + "_" + time + ".png";

    encoder.createQRImage(res, img_name);
});

/**
 *
 */
app.get("/bizs/:id/feedbacks/", function (req, res) {
    let id   = req.params.id;

    decoder.decodeQRImage(res, "path/to/image");
});


// Chatbot code

/**
 * Webhook Verification
 */
app.get('/webhook', (req, res) => {
    // Your verify token. Should be a random string.
    //let VERIFY_TOKEN = "<YOUR_VERIFY_TOKEN>"

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {
        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === process.env.VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

app.post('/webhook', (req, res) => {
    let body = req.body;

    // Checks this is an event from a page subscription
    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
});


// Handles messages events
function handleMessage(sender_psid, received_message) {
    let response;

    // Check if the message contains text
    if (received_message.text) {
        // Create the payload for a basic text message
        response = {
            "text": "Hello! Please send me your QR code to validate it."
        };
    }
    else if (received_message.attachments) {
        // Gets the URL of the message attachment
        let attachment_url = received_message.attachments[0].payload.url;

        //console.log(attachment_url);

        /* TODO:
            - decode the qr code
            - if invalid, return error message to Messenger
            - if valid, extract the biz's name and set it in the variable below
         */

        let biz_name = "Fast Burgers";

        // valid QR code response
        response = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": "Did you have a nice experience at " + biz_name + "?",
                        //"subtitle": "Tap a button to answer.",
                        //"image_url": attachment_url,
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Yes!",
                                "payload": "yes",
                            },
                            {
                                "type": "postback",
                                "title": "No!",
                                "payload": "no",
                            }
                        ],
                    }]
                }
            }
        }
    }

    // Sends the response message
    callSendAPI(sender_psid, response);
}

// Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback) {
    let response;
    let feedmsg;

    console.log("loads the postback");

    // Get the payload for the postback
    let payload = received_postback.payload;

    // Set the response based on the postback payload
    if (payload === 'yes') {
        feedmsg = "Thanks for your feedback! Here's your coupon for a free drink.";
      } else if (payload === 'no') {
        feedmsg = "We appologize for that and would like to give you a 10% discount coupon for your next purchase.";
      }

      response = {
          "attachment": {
              "type": "template",
              "payload": {
                  "template_type": "generic",
                  "elements": [{
                      "title": feedmsg,
                      //"subtitle": "Tap a button to answer.",
                      "image_url": "qrcodes/coupons/mcbrgs_1521932291606.png"
                  }]
              }
          }
      }

      // Send the message to acknowledge the postback
      callSendAPI(sender_psid, response);
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": process.env.ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
  });
}
