#!/bin/bash

if [ "$1" = "--dev" ]; then
   IS_DEV=1
fi

echo "Building client side ..."
if [ $IS_DEV ]; then
  webpack --config webpack/client/development.js
else
  webpack --config webpack/client/production.js
fi

echo "Building server side ..."
babel --ignore=browser,chrome,test src -d build
