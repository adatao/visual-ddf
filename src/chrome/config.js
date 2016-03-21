import chrome from 'chrome';
const defaultServerUrl = 'http://vddf.arimo.com';
const defaultBigAppsUrl = '';

function readChromeConfig(obj) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(obj, (item) => {
      resolve(item);
    });
  });
}

export function getServerUrl() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({
      serverUrl: defaultServerUrl
    }, (item) => {
      resolve(item.serverUrl);
    });
  });
}

export function getBigAppsUrl() {
  return readChromeConfig({
    bigAppsUrl: defaultBigAppsUrl
  });
}
