#!/bin/bash

if [ "$1" = "--dev" ]; then
   IS_DEV=1
fi

if [ $IS_DEV ]; then
  webpack --config webpack/client/development.js
else
  webpack --config webpack/client/production.js
fi

