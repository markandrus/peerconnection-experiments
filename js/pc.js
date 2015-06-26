'use strict';

var room = getFromQueryString(location.search, 'room')[0];
var from = getFromQueryString(location.search, 'from')[0];
var to = getFromQueryString(location.search, 'to')[0];
var wsServer = getFromQueryString(location.search, 'ws')[0];

var pc = new RTCPeerConnection();

// Signaling
// ---------

var sendMessage;
if (wsServer) {
  sendMessage = setupWebSocketSignalingClient(wsServer, room, from, onMessage.bind(null, pc));
} else {
  sendMessage = setupPostMessageSignalingClient(from, onMessage.bind(null, pc));
}

function onMessage(pc, msg) {
  switch (msg.type) {
    case 'offer':
    case 'answer':
      setRemoteDescription(pc, msg).then(function() {
        if (msg.type === 'answer') {
          return;
        }
        return setMediaStreams(pc, getUserMediaConstraints()).then(function() {
          return createAnswer(pc);
        }).then(function(answer) {
          sendMessage(answer, to);
        });
      }).then(function() {
        function onchangestreams() {
          var mediaStreams = pc.getRemoteStreams();
          var audioTracks = [];
          var videoTracks = [];
          mediaStreams.forEach(function(mediaStream) {
            audioTracks = audioTracks.concat(mediaStream.getAudioTracks());
            videoTracks = videoTracks.concat(mediaStream.getVideoTracks());
          });
          console.log('\n');
          console.log(from + ': Remote MediaStreams', mediaStreams);
          console.log(from + ': Remote AudioStreamTracks', audioTracks);
          console.log(from + ': Remote VideoStreamTracks', videoTracks);

          ['audio', 'video'].forEach(function(kind) {
            var foundStream = false;
            mediaStreams.forEach(function(mediaStream) {
              if (!foundStream && mediaStreamContains(kind, mediaStream)) {
                foundStream = true;
                if (kind === 'audio') {
                  attachRemoteAudio(remoteAudio, mediaStream);
                } else {
                  attachRemoteVideo(remoteVideo, mediaStream);
                }
              }
            });
          });

          if (!videoTracks.length) {
            remoteVideo.removeAttribute('src');
            remoteVideo.className = 'hidden';
          }
        }

        if (webrtcDetectedBrowser === 'chrome') {
          onchangestreams();
        } else {
          pc.onaddstream = onchangestreams;
          pc.onremovestream = onchangestreams;
        }
      }).catch(console.error.bind(console));
      break;
    case 'candidate':
      new Promise(function(resolve, reject) {
        try {
          pc.addIceCandidate(new RTCIceCandidate(msg.candidate), resolve, reject);
        } catch (error) {
          reject(error);
        }
      }).catch(console.error.bind(console));
      break;
    default:
      console.log('Unknown message:', msg);
  }
}

// PeerConnection
// --------------

pc.onicecandidate = function onicecandidate(event) {
  var candidate = event.candidate;
  if (candidate) {
    sendMessage({
      type: 'candidate',
      candidate: {
        candidate: candidate.candidate,
        sdpMLineIndex: candidate.sdpMLineIndex,
        sdpMid: candidate.sdpMid
      }
    }, to);
  }
};

var offerAnswerConstraints = {};
if (webrtcDetectedBrowser === 'firefox') {
  offerAnswerConstraints.offerToReceiveAudio = true;
  offerAnswerConstraints.offerToReceiveVideo = true;
} else {
  offerAnswerConstraints.mandatory = {
    OfferToReceiveAudio: true,
    OfferToReceiveVideo: true
  };
}

function createOffer(pc) {
  return new Promise(function(resolve, reject) {
    pc.createOffer(resolve, reject, offerAnswerConstraints);
  }).then(function(offer) {
    console.log('offer\n\n' + offer.sdp);
    return new Promise(function(resolve, reject) {
      try {
        pc.setLocalDescription(offer, resolve.bind(null, offer), reject);
      } catch (error) {
        reject(error);
      }
    });
  }).then(function(offer) {
    return { type: offer.type, sdp: offer.sdp };
  });
}

function createAnswer(pc) {
  return new Promise(function(resolve, reject) {
    pc.createAnswer(resolve, reject, offerAnswerConstraints);
  }).then(function(answer) {
    console.log('answer\n\n' + answer.sdp);
    return new Promise(function(resolve, reject) {
      try {
        pc.setLocalDescription(answer, resolve.bind(null, answer), reject);
      } catch (error) {
        reject(error);
      }
    });
  }).then(function(answer) {
    return { type: answer.type, sdp: answer.sdp };
  });
}

function setRemoteDescription(pc, sdp) {
  return new Promise(function(resolve, reject) {
    try {
      pc.setRemoteDescription(new RTCSessionDescription(sdp), resolve, reject);
    } catch (error) {
      reject(error);
    }
  });
}

// UI
// --

var shareAudioChk = document.querySelector('#share-audio');
var shareVideoChk = document.querySelector('#share-video');
var setMediaStreamsBtn = document.querySelector('#set-mediastreams');
var createOfferBtn = document.querySelector('#create-offer');
var remoteVideo = document.querySelector('#remote-video');
var remoteAudio = document.querySelector('#remote-audio');

setMediaStreamsBtn.onclick = function onclick(event) {
  setMediaStreams(pc, getUserMediaConstraints());
};

createOfferBtn.onclick = function onclick(event) {
  createOffer(pc).then(function(offer) {
    sendMessage(offer, to);
  }).catch(console.error.bind(console));
};

function getUserMediaConstraints() {
  var audio = shareAudioChk.checked;
  var video = shareVideoChk.checked;
  var getUserMediaConstraints = { audio: audio, video: video };
  if (webrtcDetectedBrowser === 'firefox') {
    getUserMediaConstraints.fake = true;
  }
  return getUserMediaConstraints;
}

function pcContains(kind, pc) {
  return pc.getLocalStreams().reduce(function(containsKind, mediaStream) {
    return mediaStreamContains(kind, mediaStream) || containsKind;
  }, false);
}

function mediaStreamContains(kind, mediaStream) {
  var method = kind === 'audio' ? 'getAudioTracks' : 'getVideoTracks';
  return mediaStream[method]().length > 0;
}

function removeMediaStreamsContaining(kind, pc) {
  pc.getLocalStreams().forEach(function(mediaStream) {
    if (mediaStreamContains(kind, mediaStream)) {
      pc.removeStream(mediaStream);
      mediaStream.stop();
    }
  });
}

function setMediaStreams(pc, getUserMediaConstraints) {
  ['audio', 'video'].forEach(function(kind) {
    // If we no longer specifying audio or video, remove any MediaStream
    // containing audio or video MediaStreamTracks.
    if (!getUserMediaConstraints[kind]) {
      removeMediaStreamsContaining(kind, pc);
    }
  });
  ['audio', 'video'].forEach(function(kind) {
    // Don't re-request audio or video if we have it.
    if (getUserMediaConstraints[kind] && pcContains(kind, pc)) {
      getUserMediaConstraints[kind] = false;
    }
  });
  // Don't call getUserMedia if nothing changed.
  if (!getUserMediaConstraints.audio && !getUserMediaConstraints.video) {
    return Promise.resolve();
  }
  return new Promise(function(resolve, reject) {
    getUserMedia(getUserMediaConstraints, resolve, reject);
  }).then(function(mediaStream) {
    pc.addStream(mediaStream);
  });
}

function attachRemoteVideo(remoteVideo, mediaStream) {
  attachMediaStream(remoteVideo, mediaStream);
  remoteVideo.removeAttribute('class');
  remoteVideo.muted = true;
  remoteVideo.play();
}

function attachRemoteAudio(remoteAudio, mediaStream) {
  attachMediaStream(remoteAudio, mediaStream);
  remoteAudio.play();
}
