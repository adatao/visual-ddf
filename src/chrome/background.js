import 'babel-polyfill';
import chrome from 'chrome';
import Events from './events';
import * as SQL from './sql';
import * as Storage from './storage';

function openAppTab() {
  const params = {
    url: chrome.extension.getURL('assets/app.html')
  };

  chrome.tabs.query(params, (tabs) => {
    if (tabs.length) {
      chrome.tabs.update(tabs[0].id, {active: true});
    } else {
      chrome.tabs.create({...params, active: true});
    }
  });
}

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
  console.log(request, sender);

  if (request.msg === Events.DetectionReady && sender.tab) {
    // chrome.pageAction.setTitle({
    //   tabId: sender.tab.id,
    //   title: 'Ready'
    // });

    chrome.pageAction.show(sender.tab.id);
  } else if (request.msg === Events.SubmissionDone) {
    openAppTab();
  } else if (request.msg === Events.SaveChart) {
    // save to metadata table
    const data = request.data;

    Storage.create(data);
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
