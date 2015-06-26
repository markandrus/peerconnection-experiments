'use strict';

var sendMessage = setupPostMessageSignalingServer(onMessage);

function onMessage(msg) {
  sendMessage(msg.msg, msg.to);
}
