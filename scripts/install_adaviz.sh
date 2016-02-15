#!/bin/bash

if [ ! -d './adaviz' ]; then
  git clone git@github.com:adatao/adaVIZ-JS.git adaviz
  (cd adaviz && npm install && npm run build:lib)
  
  # add adaviz to node_modules
  mkdir -p node_modules
  (cd node_modules && ln -s ../adaviz)
fi
