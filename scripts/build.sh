#!/bin/bash

if [ "$1" = "--dev" ]; then
   IS_DEV=1
fi

echo "Building adaviz ..."
(cd adaviz && npm run build:lib)

echo "Building client side ..."
if [ $IS_DEV ]; then
  webpack --config webpack/client/development.js
else
  webpack --config webpack/client/production.js
fi

echo "Building server side ..."
babel --ignore=browser,webapp,chrome,test src -d build
