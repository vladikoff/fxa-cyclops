/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([
  'intern',
  'intern/lib/args',
  'intern!object',
  'require',
  'intern/node_modules/dojo/node!request'
], function (intern, args, registerSuite, require, request) {

  var url = "https://latest.dev.lcip.org/";
  var screenshotEndpoint = (args.cyclops || 'http://127.0.0.1:10092') + '/screenshot';
  var pages = [
    'signin',
    'signup'
  ];

  var suite = {
    name: 'pages'
  };

  var visitFn = function (path, width, height) {
    return function () {
      var name = this.name;

      return this.remote
        .get(require.toUrl(url + path))
        .setFindTimeout(20000)
        .findByCssSelector('#stage header')
        .end()
        .setWindowSize(width, height)
        .sleep(5000)
        .takeScreenshot()
        .then(function(buffer) {
          if (request) {
            var r = request({
              url: screenshotEndpoint,
              method: 'POST'
            }, function optionalCallback(err, httpResponse, body) {
              if (err) {
                console.log(err);
              }
              console.log('Upload successful!');
            });
            var form = r.form();
            form.append('project', 'fxa-content-server');
            form.append('name', name);
            form.append('time', Date.now());
            form.append('width', width);
            form.append('height', height);
            form.append('screenshot', buffer);
          }
        })
    };
  };

  pages.forEach(function (path) {
    suite['fxa_' + path] = visitFn(path, 1024, 768);
  });

  registerSuite(suite);
});
