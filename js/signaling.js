function setupPostMessageSignalingServer(onMessage) {
  function getIFrames() {
    var iframes = new Map();
    [].forEach.call(document.querySelectorAll('iframe'), function(iframe) {
      var from = getFromQueryString(iframe.src.split('?')[1], 'from');
      if (from[0]) {
        iframes.set(from[0], iframe.contentWindow);
      }
    });
    return iframes;
  }

  var iframes = getIFrames();

  function sendMessage(msg, to) {
    if (!to) {
      // Send to all
      for (var iframe of iframes.keys()) {
        sendMessage(msg, iframe);
      }
    } else if (iframes.has(to)) {
      // Send to one
      iframes.get(to).postMessage(msg, '*');
    }
  }

  function _onMessage(event) {
    onMessage(event.data);
  }

  addEventListener('message', _onMessage, false);

  return sendMessage;
}

function setupPostMessageSignalingClient(from, onMessage) {
  function sendMessage(msg, to) {
    msg = {
      from: from,
      msg: msg
    };
    if (to) {
      msg.to = to;
    }
    parent.postMessage(msg, '*');
  }

  function _onMessage(event) {
    var msg = event.data;
    if (msg.to && msg.to !== from) {
      return;
    }
    if (msg.from === from) {
      return;
    }
    onMessage(msg);
  }

  addEventListener('message', _onMessage, false);

  return sendMessage;
}

function setupWebSocketSignalingClient(wsServer, from, onMessage) {
  var ws = new WebSocket(wsServer);
  var queue = [];

  function sendMessage(msg, to) {
    msg = {
      from: from,
      msg: msg
    };
    if (to) {
      msg.to = to;
    }
    if (ws.readyState < 1) {
      queue.push(msg);
    } else if (ws.readyState === 1) {
      ws.send(JSON.stringify(msg));
    }
  }

  function onopen() {
    queue.forEach(function(msg) {
      sendMessage.apply(null, msg);
    });
  }

  function _onMessage(event) {
    var msg = JSON.parse(event.data);
    if (msg.to && msg.to !== from) {
      return;
    }
    if (msg.from === from) {
      return;
    }
    onMessage(msg.msg);
  }

  ws.onmessage = _onMessage;

  return sendMessage;
}
