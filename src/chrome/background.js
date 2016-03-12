// import 'babel-polyfill';
// import chrome from 'chrome';

// let db = openDatabase('vddf', '1.0', 'DDF Storage', 5*1024*1024);
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
