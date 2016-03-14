'use strict';

var path          = require('path');
var _             = require('lodash');
var webpack       = require('webpack');
var devConfig = require('../client/development');
var config        = require('../config.json');
var ROOT          = require('../path-helper').ROOT;
var CopyWebpackPlugin = require('copy-webpack-plugin');

devConfig.entry = {
  'chrome-content': path.join(ROOT, config.path.src, 'chrome/content'),
  'chrome-inject': path.join(ROOT, config.path.src, 'chrome/inject'),
  'chrome-background': path.join(ROOT, config.path.src, 'chrome/background')
};

// output to /build/chrome folder
devConfig.output.path = path.join(ROOT, config.path.build, 'chrome'),

// we don't need the hot reload for chrome
devConfig.plugins.shift();
devConfig.plugins.push(new CopyWebpackPlugin([
  {from: 'src/chrome/manifest.json'},
  {from: 'src/chrome/icon64.png'},
  {from: 'src/chrome/icon38.png'},
  {from: 'src/chrome/icon19.png'}
]));

module.exports = devConfig;
