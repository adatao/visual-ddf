// import 'babel-polyfill';
import chrome from 'chrome';
import Events from './events';
// import ChromeStorageContentProxyStorageServer from './storage/chrome-storage-proxy-server';

// function sql(query) {
//   return new Promise((resolve, reject) => {
//     chrome.runtime.sendMessage({sql: query}, function(response) {
//       if (response === undefined) {
//         reject('Database is not responding');
//       } else if (response.error) {
//         reject(response.error);
//       } else {
//         resolve(response.result.rows ? response.result.rows : response.result.rowsAffected);
//       }
//     });
//   });
// }

// let storageProxyServer = new ChromeStorageContentProxyStorageServer(window, chrome.storage.local, sql);

(function () {
  var head = document.getElementsByTagName('head')[0];

  if (head) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = chrome.extension.getURL('chrome-inject.js');

    head.appendChild(script);
  }

  document.addEventListener(Events.DetectionReady, () => {
    console.log('done done');
    chrome.extension.sendMessage({
      msg: Events.DetectionReady
    });
  });

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // just proxy the event to document
    if (request.msg == Events.PageActionClicked) {
      Events.dispatch(request.msg);
    }
  });
})();
