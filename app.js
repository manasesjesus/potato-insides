'use strict'
/**
 * Description of the awesome node app
 */


const PORT = process.env.PORT || 5000;

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


// Chatbot code

/**
 *
 */
app.get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN) {
        console.log("Verified token");
        return res.status(200).send(req.query["hub.challenge"]);
    }
    res.send('wrong token');
});



// All callbacks for Messenger will be POST-ed here
app.post("/webhook", function (req, res) {
    if (req.body.object == "page") {
        // Iterate over each entry
        // There may be multiple entries if batched
        req.body.entry.forEach(function(entry) {
            entry.messaging.forEach(function(event) {
                if (event.postback) {
                    processPostback(event);
                } else if (event.message) {
                    processMessage(event);
                }
            });
        });

        res.sendStatus(200);
    }
});

function processPostback(event) {
    var senderId = event.sender.id;
    var payload = event.postback.payload;

    if (payload === "Greeting") {
        // Get user's first name from the User Profile API
        // and include it in the greeting
        request({
            url: "https://graph.facebook.com/v2.6/" + senderId,
            qs: {
                access_token: process.env.PAGE_ACCESS_TOKEN,
                fields: "first_name"
            },
            method: "GET"
        }, function(error, response, body) {
            var greeting = "";
            if (error) {
                console.log("Error getting user's name: " +  error);
            } else {
                var bodyObj = JSON.parse(body);
                name = bodyObj.first_name;
                greeting = "Hello " + name + "! ";
            }
            var message = greeting + "I'm Taco, your virtual weiter. Would you like a free coffee?";
            sendMessage(senderId, {text: message});
        });
    } else if (payload === "Correct") {
        sendMessage(senderId, {text: "Great! Come any day to PoC Restaurant with this code FC1982 and claim your free coffee ;)"});
    } else if (payload === "Incorrect") {
        sendMessage(senderId, {text: "Oops! Sorry about that. I don't have other coffee today :("});
    }
}

function processMessage(event) {
    if (!event.message.is_echo) {
        var message = event.message;
        var senderId = event.sender.id;

        console.log("Received message from senderId: " + senderId);
        console.log("Message is: " + JSON.stringify(message));

        // You may get a text or attachment but not both
        if (message.text) {
            var formattedMsg = message.text.toLowerCase().trim();

            switch (formattedMsg) {
                case "type":
                case "date":
                getCoffeeDetail(senderId, formattedMsg);
                break;

                default:
                findCoffee(senderId, formattedMsg);
            }
        } else if (message.attachments) {
            sendMessage(senderId, {text: "Sorry, I don't understand your request."});
        }
    }
}

function getCoffeeDetail(userId, field) {
    Coffee.findOne({user_id: userId}, function(err, coffee) {
        if(err) {
            sendMessage(userId, {text: "Something went wrong. Try again"});
        } else {
            sendMessage(userId, {text: coffee[field]});
        }
    });
}

function findCoffee(userId, wannaCoffee) {
    if (wannaCoffee.indexOf("yes") >= 0 || wannaCoffee.indexOf("no") >= 0 ) {
        console.log("wannaCoffee: " + wannaCoffee);
        if (wannaCoffee.indexOf("yes") >= 0) {
            var query = {user_id: userId};
            var update = {
                user_id: userId,
                type: "Cappucciono",
                date: new Date(),
                image_url: "https://es.jura.com/-/media/global/images/coffee-recipes/cappuccino.jpg"
            };
            var options = {upsert: true};
                    message = {
                        attachment: {
                            type: "template",
                            payload: {
                                template_type: "generic",
                                elements: [{
                                    title: "Cappuccino",
                                    subtitle: "Do you like this one?",
                                    image_url: "https://es.jura.com/-/media/global/images/coffee-recipes/cappuccino.jpg",
                                    buttons: [{
                                        type: "postback",
                                        title: "Yes",
                                        payload: "Correct"
                                    }, {
                                        type: "postback",
                                        title: "No",
                                        payload: "Incorrect"
                                    }]
                                }]
                            }
                        }
                    };
                    sendMessage(userId, message);
        } else {
            sendMessage(userId, {text: "Ok, write me later when you change your mind ;)"});
        }
    } else {
        sendMessage(userId, {text: "Please answer Yes or No"});
    }
}

// sends message to user
function sendMessage(recipientId, message) {
    request({
        url: "https://graph.facebook.com/v2.6/me/messages",
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: "POST",
        json: {
            recipient: {id: recipientId},
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log("Error sending message: " + response.error);
        }
    });
}
