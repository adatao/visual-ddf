import chrome from 'chrome';
import Events from './events';
import { getServerUrl } from './config';
import fetch from 'fetch';

(function () {
  var head = document.getElementsByTagName('head')[0];

  if (head) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = chrome.extension.getURL('chrome-inject.js');

    head.appendChild(script);
  }

  document.addEventListener(Events.DetectionReady, () => {
    chrome.extension.sendMessage({
      msg: Events.DetectionReady
    });
  });

  document.addEventListener(Events.SqlRequest, (e) => {
    chrome.extension.sendMessage({
      msg: Events.SqlRequest,
      data: e.detail.data
    });
  });

  document.addEventListener(Events.SaveChart, (e) => {
    chrome.extension.sendMessage({
      msg: Events.SaveChart,
      data: e.detail.data
    });
  });

  // tell the background page so it can open a tab for us
  document.addEventListener(Events.SubmissionDone, () => {
    chrome.extension.sendMessage({
      msg: Events.SubmissionDone
    });
  });

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // just proxy the event to document
    if (request.msg === Events.MenuActionClicked) {
      Events.dispatch(request.msg, null, request.data);
    } else if (request.msg === Events.PageActionClicked) {
      getServerUrl()
        .then(serverUrl => {
          Events.dispatch(request.msg, null, {
            baseUrl: chrome.extension.getURL('assets'),
            serverUrl
          });
        });
    } else if (request.msg === Events.SaveChartDone ||
               request.msg === Events.SqlResponse
              ) {
      Events.dispatch(request.msg, null, request.data);
    }
  });
})();
