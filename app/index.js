var express = require('express');
var app = express();
var fs = require('fs');
const readerController = require('./controllers/ReaderController');

app.use(express.static('public'));

const allFiles = fs.readdirSync('./tmp');
readerController.readAll(allFiles);

fs.watch('./tmp', {}, async (eventType, filename) => {
  if (filename) {
    await readerController.read('./tmp/' + filename);
  }
});

app.get('/', function(req, res) {
  res.send('CartTech 0.1!');
});

app.get('/read', function(req, res) {
  return readerController.read(req, res);
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!');
});
