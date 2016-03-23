import 'babel-polyfill';
import chrome from 'chrome';
import Events from './events';
import * as SQL from './sql';
import * as Storage from './storage';

function openAppTab(active) {
  const url = chrome.extension.getURL('assets/app.html');

  chrome.tabs.query({ url }, (tabs) => {
    if (tabs.length) {
      chrome.tabs.update(tabs[0].id, {active: true});
    } else {
      chrome.tabs.create({
        url: url + (active ? '#active' : ''),
        active: true
      });
    }
  });
}

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request, sender);

  if (request.msg === Events.DetectionReady && sender.tab) {
    chrome.pageAction.show(sender.tab.id);
  } else if (request.msg === Events.SubmissionDone) {
    openAppTab(true);
  } else if (request.msg === Events.SaveChart) {
    const data = request.data;

    Storage.create(data)
      .then(() => {
        chrome.tabs.sendMessage(sender.tab.id, {
          msg: Events.SaveChartDone,
          data: {
            sourceId: data.sourceId
          }
        });
      });
  }
});

chrome.pageAction.onClicked.addListener(function(tab) {
  // send message to content script and let content script handle
  chrome.tabs.sendMessage(tab.id, {
    msg: Events.PageActionClicked
  });
});

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
  title: "My Directory",
  contexts: ["page_action"],
  onclick: function() {
    openAppTab();
  }
});

// to make it easier to debug
window.SQL = SQL;
window.Storage = Storage;
