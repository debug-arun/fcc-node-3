require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use('/api/shorturl', (req, res, next) => {
  console.log("Body parsed")
  next();
}, bodyParser.urlencoded({extended: false}))

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.path} - ${req.ip}`);
  next();
});

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let dnsmap = {};

app.post('/api/shorturl', (req, res) => {
  let url = req.body.url, flag = true;
  if(!url.startsWith('https://')) url = 'https://'+url;
  dns.lookup(url, (err, address, family) => {
    if(err) {
      flag = false;
      res.json({error: 'invalid url'});
      return;
    }
  })
  if(!flag) return;
  let shorturl = parseInt(Math.random()*100000);
  while(dnsmap[shorturl] != undefined) {
    shorturl = parseInt(Math.random()*100000);
  }
  dnsmap[shorturl] = url;
  res.json({originalurl:url, shorturl});
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  let shorturl = req.params.shorturl;
  if(dnsmap[shorturl] == undefined) {
    res.json({error: "shorturl doesn't exist"});
    return;
  }
  res.redirect(dnsmap[shorturl]);
});

app.get('/api/map', (req, res) => res.send(dnsmap))

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
