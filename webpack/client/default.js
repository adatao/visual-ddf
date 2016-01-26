'use strict';

var path    = require('path');
var webpack = require('webpack');
var config  = require('../config.json');
var ROOT    = require('../path-helper').ROOT;
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  context: ROOT,
  entry: {
    vddf: path.join(ROOT, config.path.src, 'browser')
  },
  output: {
    path: path.join(ROOT, config.path.assetBuild),
    publicPath: config.path.build,
    filename: '[name].js',
    chunkFilename: '[id].js'
  },
  externals: {
    'fetch': 'fetch'
  },
  resolve: {
    modulesDirectories: ['node_modules', 'bower_components'],
    extensions: ['', '.js'],
    alias: {
      'src': path.join(ROOT, config.path.src).slice(0, -1)
    }
  },
  module: {
    loaders: [
      {test: require.resolve('react'), loader: 'expose?React'},
      {
        test: /.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(png|ttf|eot|svg|woff|woff2)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader'
      }
    ]
  },
  plugins: [
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.ResolverPlugin([
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('.bower.json', ['main'])
    ]),
    new webpack.DefinePlugin({
      'process.env.runtimeEnv': '"client"'
    }),
    new CopyWebpackPlugin([
    ])
  ]
};
