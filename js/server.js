'use strict';

function getPCs() {
  var pcs = new Map();
  [].forEach.call(document.querySelectorAll('iframe'), function(iframe) {
    var from = getFromQueryString(iframe.src.split('?')[1], 'from');
    if (from[0]) {
      pcs.set(from[0], iframe.contentWindow);
    }
  });
  return pcs;
}

var pcs = getPCs();

function sendMessage(msg, to) {
  if (!to) {
    // Send to all
    for (var pc of pcs.keys()) {
      sendMessage(msg, pc);
    }
  } else if (pcs.has(to)) {
    // Send to one
    pcs.get(to).postMessage(msg, '*');
  }
}

function onMessage(event) {
  var msg = event.data;
  sendMessage(msg.msg, msg.to);
}

addEventListener('message', onMessage, false);
