const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const app  = express();

app
//  .use(express.static(path.join(__dirname, 'public')))
//  .set('views', path.join(__dirname, 'views'))
//  .set('view engine', 'ejs')
  .get('/', (req, res) => res.json({ "hello" : "world" }))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

//
app.get("/qrcodes/customer", function (req, res) {
  // middleware to generate a qrcode
  res.json({"qr" : "this is your new code"});
});
//important
