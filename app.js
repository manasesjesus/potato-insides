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


// Chatbot code

/**
 *
 */
app.get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === process.env.VERIFY_TOKEN){
        return res.send(req.query['hub.challenge']);
    }
    res.send('wrong token');
});

const bot = new BootBot({
  accessToken: process.env.ACCESS_TOKEN,
  verifyToken: process.env.VERIFY_TOKEN,
  appSecret: process.env.APP_SECRET
});

bot.setGreetingText("Hello, I'm here to help you manage your tasks. Be sure to setup your bucket by typing 'Setup'. ");
bot.setGetStartedButton((payload, chat) => {
    if (config.bucket === undefined) {
        chat.say('Hello my name is Note Buddy and I can help you keep track of your thoughts');
        chat.say("It seems like you have not setup your bucket settings yet. That has to be done before you can do anything else. Make sure to type 'setup'");
    }
    BotUserId = payload.sender.id;
});

bot.hear('setup', (payload, chat) => {
    const getBucketSlug = (convo) => {
        convo.ask("What's your buckets slug?", (payload, convo) => {
            var slug = payload.message.text;
            convo.set('slug', slug)
            convo.say("setting slug as "+slug).then(() => getBucketReadKey(convo));
        });
    }
  const getBucketReadKey = (convo) => {
    convo.ask("What's your buckets read key?", (payload, convo) => {
      var readkey = payload.message.text;
      convo.set('read_key', readkey)
      convo.say('setting read_key as '+readkey).then(() => getBucketWriteKey(convo))
    })
  }
  const getBucketWriteKey = (convo) => {
    convo.ask("What's your buckets write key?", (payload, convo) => {
      var writekey = payload.message.text
      convo.set('write_key', writekey)
      convo.say('setting write_key as '+writekey).then(() => finishing(convo))
    })
  }
  const finishing = (convo) => {
    var newConfigInfo = {
      slug: convo.get('slug'),
      read_key: convo.get('read_key'),
      write_key: convo.get('write_key')
    }
    config.bucket = newConfigInfo
    convo.say('All set :)')
    convo.end();
  }

  chat.conversation((convo) => {
    getBucketSlug(convo)
  })
})
bot.hear(['hello', 'hey', 'sup'], (payload, chat)=>{
  chat.getUserProfile().then((user) => {
    chat.say(`Hey ${user.first_name}, How are you today?`)
  })
})
bot.hear('config', (payloadc, hat) => {
  if(JSON.stringify(config.bucket) === undefined){
    chat.say("No config found :/ Be sure to run 'setup' to add your bucket details")
  }
  chat.say("A config has been found :) "+ JSON.stringify(config.bucket))
})
bot.hear('create', (payload, chat) => {
  chat.conversation((convo) => {
    convo.ask("What would you like your reminder to be? etc 'I have an appointment tomorrow from 10 to 11 AM' the information will be added automatically", (payload, convo) => {
      datetime = chrono.parseDate(payload.message.text)
      var params = {
        write_key: config.bucket.write_key,
        type_slug: 'reminders',
        title: payload.message.text,
        metafields: [
         {
           key: 'date',
           type: 'text',
           value: datetime
         }
        ]
      }
      Cosmic.addObject(config, params, function(error, response){
        if(!error){
          eventEmitter.emit('new', response.object.slug, datetime)
          convo.say("reminder added correctly :)")
          convo.end()
        } else {
          convo.say("there seems to be a problem. . .")
          convo.end()
        }
      })
    })
  })
})
bot.hear('active', (payload, chat) => {
  chat.say('finding all of your ongoing reminders.')
})
eventEmitter.on('new', function(itemSlug, time) {
  schedule.scheduleJob(time, function(){
    Cosmic.getObject(config, {slug: itemSlug}, function(error, response){
      if(response.object.metadata.date == new Date(time).toISOString()){
        bot.say(BotUserId, response.object.title)
        console.log('firing reminder')
      } else {
        eventEmitter.emit('new', response.object.slug, response.object.metafield.date.value)
        console.log('times do not match checking again at '+response.object.metadata.date)
      }
    })
  })
})
bot.start()
