require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();
const mongoose = require('mongoose');
const { URLModel } = require('./URLSchema');

const URL = URLModel;

mongoose.connect(process.env.MONGO_URI).then(() => {
  return mongoose.connection.db.admin().listDatabases();
}).then((databases) => {
  console.log("List of databases:", databases.databases)
}).catch((err) => {
  console.error('Error', err);
});

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use('/api/shorturl', (req, res, next) => {
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

app.post('/api/shorturl', (req, res) => {
  let url = req.body.url, flag = true;
  if(!url.startsWith('https://')) {
    res.json({error: 'invalid url'})
    return;
  }
  dns.lookup(url, (err, address, family) => {
    if(err) {
      flag = false;
      res.json({error: 'invalid url'});
      return;
    }
  })
  if(!flag) return;
  let short_url = parseInt(Math.random()*100000);
  const entry = new URL({
    original_url: url,
    short_url
  })
  entry.save();
  res.json({original_url: url, short_url});
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  let short_url = req.params.shorturl;
  URL.findOne({short_url}).then((data) => {
    // res.redirect(data.original_url);
    res.redirect(data.original_url);
    console.log(data.original_url);
  }).catch((err) => console.error(err));
  // res.send("Lets wait and see");
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
