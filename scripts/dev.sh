#!/bin/bash

webpack --config webpack/chrome/development --watch &
webpack-dev-server --config webpack/client/development.js &
nodemon
