require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();
const mongoose = require('mongoose');
const { URLModel } = require('./URLSchema');

const URL = URLModel;

var validUrl = require('valid-url');

let stringIsAValidUrl = (url) => {
  return (validUrl.isUri(url));
}

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
  console.log(url)
  if(!stringIsAValidUrl(url)) {
    return res.json({error: 'invalid url'})
  }
  if(!flag) return;
  let short_url = parseInt(Math.random()*100000);
  const entry = new URL({
    original_url: url,
    short_url
  })
  entry.save();
  return res.json({original_url: url, short_url});
});

app.get('/api/shorturl/:shorturl?', (req, res) => {
  try {
    let short_url = req.params.shorturl;
    URL.findOne({short_url}).then((data) => {
      console.log(data.original_url);
      return res.redirect(data.original_url);
    }).catch((err) => {
      console.error(err);
      return res.status(404).json('No URL found');
    });
  } catch(err) { 
    console.error(err); 
    return res.status(500).json('Server error');
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
