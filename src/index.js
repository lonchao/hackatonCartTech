var express = require('express');
var app = express();

const readerController = require('./controllers/ReaderController');

app.get('/', function(req, res) {
  res.send('CartTech 0.1!');
});

app.get('/read', function(req, res) {
  return readerController.read(req, res);
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
