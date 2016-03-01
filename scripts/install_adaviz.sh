#!/bin/bash

if [ ! -d './adaviz' ]; then
  git clone git@github.com:adatao/adaVIZ-JS.git adaviz
  (cd adaviz && npm install && npm run build:lib)
fi
