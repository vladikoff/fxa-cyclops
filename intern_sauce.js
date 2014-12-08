/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([], function () {
  var config = {};

  config.environments = [
    { browserName: 'internet explorer', version: '11', platform: 'Windows 8.1' },
    { browserName: 'internet explorer', version: '10', platform: 'Windows 8' },
    { browserName: 'firefox', version: '33', platform: [ 'Windows 7', 'OS X 10.10', 'Linux' ] },
    { browserName: 'chrome', version: '38', platform: [ 'Windows 7', 'OS X 10.10', 'Linux' ] },
    { browserName: 'safari', version: '8', platform: 'OS X 10.10' }
  ];

  config.functionalSuites = [
    'all'
  ];

  config.tunnel = 'SauceLabsTunnel';
  config.tunnelOptions = {
    accessKey: "ee5354a4-3d5e-47a0-84b0-0b7aaa12a720",
    username: 'fxa-content',
    port: 4445
  };

  config.excludeInstrumentation = /./;

  return config;
});
