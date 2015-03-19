var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();

router.get('/:db', function(req, res, next) {
  var envFile = 'db-' + req.params.db + '.db';
  var envPath = path.join(__dirname, '..', envFile);

  var data = {
    envFile: envFile
  };

  var sqlite3 = require('sqlite3').verbose();


  fs.exists(envPath, function (exists) {
    if (! exists) {
      return next();
    }

    data.env = req.params.db;

    var db = new sqlite3.Database(envPath);

    db.serialize(function() {

      db.all('SELECT DISTINCT gitHash from screenshots ORDER BY jobDate DESC;', function(err, row) {
        data.hashes = row;

        return res.render('env.html', data);
      });

    });

    db.close();
  });

});

router.get('/:db/:hash', function(req, res, next) {
  var envFile = 'db-' + req.params.db + '.db';
  var envPath = path.join(__dirname, '..', envFile);
  var givenHash = req.params.hash;

  var data = {
    envFile: envFile,
    givenHash: givenHash
  };

  var sqlite3 = require('sqlite3').verbose();


  fs.exists(envPath, function (exists) {
    if (! exists) {
      return next();
    }

    data.env = req.params.db;

    var db = new sqlite3.Database(envPath);

    db.serialize(function() {

      db.all('SELECT * from screenshots WHERE gitHash = ? ORDER BY jobDate DESC', givenHash, function(err, row) {
        data.screenshots = row;

        data.screenshots.forEach(function (item) {
          item.ids = [];
          // screenshot ids are different for mobile / desktop and browsers
          if(item.browserName === 'internet explorer') {
            item.ids = ['0032', '0033', '0039', '0041', '0043', '0045', '0052', '0053']
          }
          // if iOS
          else if(item.deviceName && item.deviceName.indexOf('Simulator') >= 0) {
            item.ids = ['0005', '0007', '0013', '0015', '0016']
          }
          else if(item.deviceName && item.deviceName.indexOf('Android') >= 0) {
            item.ids = ['0027', '0028', '0034', '0035', '0038']
          }
           else {
            item.ids = ['0010', '0023', '0025', '0030', '0032', '0035', '0047']
          }
        });

        return res.render('hash.html', data);
      });

    });

    db.close();
  });

});

module.exports = router;
