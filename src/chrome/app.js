import 'babel-polyfill';
import React from 'react';
import chrome from 'chrome';
import ReactDOM from 'react-dom';
import Directory from './components/directory';
import { loadMaterialFonts } from './utils';
import 'flexboxgrid';
import './common.css';
import './app.css';
import Events from './events';
import * as Storage from './storage';
import Manager from 'src/vddf-react/manager';


loadMaterialFonts();

let _manager = null;

function getManager() {
  if (_manager) return Promise.resolve(_manager);
  else {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get('serverUrl', (item) => {
        _manager = new Manager({baseUrl: item.serverUrl});

        resolve(_manager);
      });
    });
  }
}

function gogoVDDF() {
  let manager;

  getManager()
    .then(res => {
      manager = res;

      return Storage.list();
    })
    .then(charts => {
      ReactDOM.render(
        <Directory screenWidth={window.innerWidth} manager={manager} charts={charts} />,
        document.getElementById('app')
      );
    });
}

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg === Events.SubmissionDone) {
    // TODO: we want to wait a bit longer before new charts are available
    gogoVDDF();
  }
});

window.addEventListener('load', () => {
  gogoVDDF();
});

window.Storage = Storage;
