/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

define([], function () {
  var config = {};

  config.environments = [
    { browserName: 'internet explorer', version: '11', platform: 'Windows 8.1' },
    { browserName: 'internet explorer', version: '10', platform: 'Windows 8' },
    { browserName: 'firefox', version: ['33', '36'], platform: [ 'Windows 7', 'OS X 10.10', 'Linux' ] },
    { browserName: 'firefox', version: ['36'], platform: [ 'Windows 8.1' ] },
    { browserName: 'firefox', version: ['beta', 'dev'], platform: [ 'Windows 7' ] },
    { browserName: 'chrome', version: '41', platform: [ 'Windows 7', 'Linux' ] },
    { browserName: 'safari', version: '8', platform: 'OS X 10.10' },
    { browserName: 'android', version: ['4.4', '5.0'], platform: 'Linux', deviceName: 'Android Emulator' },
    { browserName: 'iphone', version: ['8.1', '7.1'], platform: 'OS X 10.10', deviceName: 'iPad Simulator' },
    { browserName: 'iphone', version: ['8.1', '7.1'], platform: 'OS X 10.10', deviceName: 'iPhone Simulator' }
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
