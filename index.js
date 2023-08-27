require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();
const mongoose = require('mongoose');
const { URLModel } = require('./URLSchema');

const URLValidate = require('url').URL;

const URL = URLModel;

let stringIsAValidUrl = (url) => {
  try {
    new URLValidate(url);
    return true;
  } catch (err) {
    return false;
  }
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
  if(!stringIsAValidUrl(url)) {
    return res.json({error: 'invalid url'})
  }
  // URL.findOne({original_url: url}).then((data) => {
  //   if(data) {
  //     console.log(data);
  //     flag = false;
  //     return res.status(200).json({original_url: data.original_url, short_url: data.short_url});
  //   }
  // }).catch((err)=>res.status(500).json({'Internal error': err}));
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
