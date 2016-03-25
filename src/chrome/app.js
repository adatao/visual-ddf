import 'babel-polyfill';
import React from 'react';
import chrome from 'chrome';
import ReactDOM from 'react-dom';
import Directory from 'src/vddf-react/components/directory';
import { loadMaterialFonts } from 'src/browser/utils';
import Events from './events';
import * as Storage from './storage';
import * as SQL from './sql';
import Manager from 'src/vddf-react/manager';
import FileLoader from 'src/vddf-react/loaders/file';
import { getServerUrl, getAvatarUrl } from './config';

// styles
import 'flexboxgrid';
import '../vddf-react/common.css';
import '../vddf-react/directory.css';

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

function gogoVDDF(active) {
  let manager;
  let avatarUrl;

  Promise.all([
    getManager(),
    getAvatarUrl()
  ])
    .then(res => {
      manager = res[0];
      avatarUrl = res[1];

      return Storage.list();
    })
    .then(charts => {
      const directory = ReactDOM.render(
        <Directory screenWidth={window.innerWidth}
                   screenHeight={window.innerHeight}
                   storage={Storage}
                   manager={manager}
                   avatarUrl={avatarUrl}
                   charts={charts}
                   reload={gogoVDDF} />,

        document.getElementById('app')
      );

      if (active) {
        directory.refs.content.select(0, true);
      }
    });
}

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg === Events.SubmissionDone) {
    gogoVDDF(true);
  }
});

window.addEventListener('load', () => {
  gogoVDDF(window.location.hash === '#active');
  window.location.hash = '';
});

window.SQL = SQL;
window.Storage = Storage;
