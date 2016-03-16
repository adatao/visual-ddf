// import 'babel-polyfill';
import chrome from 'chrome';
import Events from './events';

// let db = openDatabase('vddf', '1.0', 'DDF Storage', 10*1024*1024);
// db.transaction((tx) => {
//   tx.executeSql('create table if not exists metadata (id integer primary key, uuid text, name text)');
// });

// function runSql(sql) {
//   return new Promise((resolve, reject) => {
//     db.transaction((tx) => {
//       try {
//         tx.executeSql(sql, [], (tx, results) => {
//           resolve(results);
//         }, (tx, error) => {
//           reject(error);
//         });
//       } catch (ex) {
//         reject(ex);
//       }
//     });
//   });
// }

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

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log(request);
//     console.log(sender.tab ?
//                 "from a content script:" + sender.tab.url :
//                 "from the extension");

//     if (request.sql) {
//       runSql(request.sql)
//         .then((result) => {
//           sendResponse({result: {
//             rows: result.rows,
//             rowsAffected: result.rowsAffected
//           }});
//         }).catch(err => {
//           sendResponse({error: err.message});
//         });

//       return true;
//     } else {
//       sendResponse({error: 'Unknown command'});
//     }
//   });
