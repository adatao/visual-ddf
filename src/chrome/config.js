import chrome from 'chrome';
const defaultUrl = 'http://vddf.arimo.com';

export function getServerUrl() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get({
      serverUrl: defaultUrl
    }, (item) => {
      resolve(item.serverUrl);
    });
  });
}
