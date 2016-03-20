import 'babel-polyfill';
import React from 'react';
import chrome from 'chrome';
import ReactDOM from 'react-dom';
import Directory from 'src/vddf-react/components/directory';
import { loadMaterialFonts } from 'src/browser/utils';
import 'flexboxgrid';
import './common.css';
import './app.css';
import Events from './events';
import * as Storage from './storage';
import * as SQL from './sql';
import Manager from 'src/vddf-react/manager';
import FileLoader from 'src/vddf-react/loaders/file';
import { getServerUrl } from './config';

loadMaterialFonts();

let _manager = null;

function getManager() {
  if (_manager) return Promise.resolve(_manager);
  else {
    return getServerUrl()
      .then(serverUrl => {
        _manager = new Manager({baseUrl: serverUrl});
        _manager.addLoader(new FileLoader());

        return _manager;
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
        <Directory screenWidth={window.innerWidth} storage={Storage} manager={manager} charts={charts} reload={gogoVDDF} />,
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

window.SQL = SQL;
window.Storage = Storage;
