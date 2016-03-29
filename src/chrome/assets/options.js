// Saves options to chrome.storage
function save_options() {
  var url = document.getElementById('serverUrl').value;
  var avatar = document.getElementById('avatarUrl').value;

  chrome.storage.sync.set({
    serverUrl: url,
    avatarUrl: avatar
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    serverUrl: 'https://vddf.arimo.com',
    bigAppsUrl: '',
    avatarUrl: ''
  }, function(items) {
    document.getElementById('serverUrl').value = items.serverUrl;
    document.getElementById('avatarUrl').value = items.avatarUrl;
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
