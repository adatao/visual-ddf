'use strict';

var path          = require('path');
var _             = require('lodash');
var webpack       = require('webpack');
var defaultConfig = require('./default');
var config        = require('../config.json');
var ROOT          = require('../path-helper').ROOT;

module.exports = _.merge(defaultConfig, {
  entry: {

  }, // Hot Module Replacement
  cache: true,
  debug: true,
  outputPathinfo: true,
  devtool: 'source-map',
  devServer: {
    contentBase: ROOT,
    noInfo: true,
    hot: true,
    inline: true,
    headers: { "Access-Control-Allow-Origin": "*" }
  },
  module: {
    loaders: [
      // {
      //   test: /.js$/,
      //   exclude: /node_modules/,
      //   loaders: ['react-hot']
      // },
      {
        test: /\.css$/,
        loader: 'style!css!autoprefixer'
      },
      {
        test: /\.less$/,
        loader: 'style!css!autoprefixer!less'
      },
      {
        test: /\.scss$/,
        loader: 'style!css!autoprefixer!sass'
      },
      {
        test: /\.styl$/,
        loader: 'style!css!autoprefixer!stylus'
      }
    ]
  }, // Hot Module Replacement
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin(), // Hot Module Replacement
    /*new webpack.optimize.CommonsChunkPlugin('common', 'common.bundle.js'),*/ // Code splitting
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"development"'
    })
  ]
}, function(obj1, obj2) {
  return _.isArray(obj2) ? obj2.concat(obj1) : undefined;
});
