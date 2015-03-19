/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern/lib/args',
  'intern!object',
  'require',
  'intern/node_modules/dojo/node!request',
  'intern/node_modules/dojo/node!sqlite3',
  'intern/node_modules/dojo/node!bluebird',
  'intern/node_modules/dojo/node!crypto'
], function (intern, args, registerSuite, require, request, sqlite, Promise, crypto) {

  var SQL_TABLE = 'CREATE TABLE IF NOT EXISTS `screenshots` ( `run` INTEGER PRIMARY KEY AUTOINCREMENT, `dataHash` TEXT, `gitHash` TEXT, `jobId` TEXT, `platform` TEXT, `browserName` TEXT, `browserVersion` TEXT, `jobDate` INTEGER, `platformName` TEXT, `platformVersion` TEXT, `deviceName` TEXT, `width` INTEGER);';
  var serverEnv = args.fxaEnv || 'latest';

  var url = 'https://' + serverEnv + '.dev.lcip.org/';
  var gitHash = null;

  var suite = {
    name: 'pages'
  };
  var password = 'screenshottest';
  var PAUSE = parseInt(args.pause) || 4000;


  var visitFn = function (width, height) {
    return function () {
      var self = this;
      var email = 'screenshot' + Date.now() + '@restmail.net';
      this.timeout = 90000;

      var jobId = self.remote.sessionId;
      var platform = self.remote.environmentType.platform;
      var browserName = self.remote.environmentType.browserName;
      var platformVersion = self.remote.environmentType.platformVersion;
      var deviceName = self.remote.environmentType.deviceName;
      var platformName = self.remote.environmentType.platformName;
      var browserVersion = self.remote.environmentType.version;
      var jobDate = Date.now();

      return this.remote
        .get(require.toUrl(url + 'signin'))
        .setFindTimeout(20000)
        .then(function () {
          return getGitHash();
        })
        .sleep(PAUSE)
        .findByCssSelector('#stage header')
        .end()
        .then(function () {
          // android driver throws an error if we try to resize the window
          if (browserName !== 'android') {
            self.remote.setWindowSize(width, height);
          }
        })

        .sleep(1000)
        .get(require.toUrl(url + 'signup'))
        .sleep(PAUSE)
        .findByCssSelector('.email')
        .type(email)
        .end()

        .findByCssSelector('.password')
        .type(password)
        .end()

        .findByCssSelector('#fxa-1990')
        .click()
        .end()

        .findByCssSelector('#submit-btn')
        .click()
        .end()

        .findByCssSelector('#fxa-confirm-header')
        .click()
        .end()

        // wait for the email to arrive ...
        // TODO: poll here instead
        .sleep(10000)
        .then(function () {
          var dfd = self.async();

          verifyEmailLink(email).then(function (link) {
              dfd.resolve(link);
          });

          return dfd.promise;
        })

        .then(function (verifyLink) {
          return self.remote.get(verifyLink);
        })

        .findByCssSelector('#fxa-settings-header')
        .end()

        .sleep(PAUSE)

        .then(function () {

          var sqlite3 = sqlite.verbose();
          var db = new sqlite3.Database('db-' + serverEnv + '.db');

          db.serialize(function () {
            db.run(SQL_TABLE);
            var str = gitHash + platform + browserName + browserVersion + platformName + platformVersion + deviceName + width;
            var dataHash = crypto.createHash('sha256').update(str).digest('hex');

            db.run('DELETE FROM screenshots WHERE dataHash = ?', [ dataHash ]);

            var stmt = db.prepare('INSERT INTO screenshots VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
            stmt.run(null, dataHash, gitHash, jobId, platform, browserName, browserVersion, jobDate, platformName, platformVersion, deviceName, width);
            stmt.finalize();
          });

          db.close();

        })
        .catch(function (err) {
            throw err;
            process.exit(0);
        })
    };
  };

  suite['fxa_screenshot_1024'] = visitFn(1024, 768);
  suite['fxa_screenshot_500'] = visitFn(500, 768);

  registerSuite(suite);

  var getGitHash = function () {
    return new Promise(function (resolve, reject) {
      var r = request({
        url: url + 'ver.json',
        method: 'GET'
      }, function requestCallback(err, httpResponse, body) {
        if (err) {
          console.log(err);
          return reject(err);
        }

        try {
          body = JSON.parse(body);
        } catch (err) {
          return reject(err);
        }

        gitHash = body.commit;
        return resolve(gitHash);
      });

    });
  };

  var verifyEmailLink = function (email) {
    var url = 'https://restmail.net/mail/' + email;

    return new Promise(function (resolve, reject) {
      var r = request({
        url: url,
        method: 'GET'
      }, function requestCallback(err, httpResponse, body) {

        if (err) {
          console.log(err);
          return reject(err);
        }

        try {
          body = JSON.parse(body.toString());
        } catch (err) {
          return reject(err);
        }

        var verifyLink = body[0]['headers']['x-link'];
        return resolve(verifyLink);
      });

    });
  };
});

