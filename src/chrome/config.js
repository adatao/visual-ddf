import chrome from 'chrome';
const defaultServerUrl = 'https://vddf.arimo.com';
const defaultBigAppsUrl = '';
const defaultAvatarUrl = 'avatar.png';

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

export function getAvatarUrl() {
  return readChromeConfig({
    avatarUrl: ''
  }).then(i => i.avatarUrl || defaultAvatarUrl);
}

export function getBigAppsUrl() {
  return readChromeConfig({
    bigAppsUrl: defaultBigAppsUrl
  });
}
