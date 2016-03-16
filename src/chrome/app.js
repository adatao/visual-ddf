import React from 'react';
import chrome from 'chrome';
import ReactDOM from 'react-dom';
import Directory from './components/directory';
import { loadMaterialFonts } from './utils';
import 'flexboxgrid';
import './common.css';
import './app.css';
import * as SQL from './sql';

loadMaterialFonts();

// i can still listen to message if i want
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request);
});

window.addEventListener('load', () => {
  ReactDOM.render(
    <Directory />,
    document.getElementById('app')
  );
});
