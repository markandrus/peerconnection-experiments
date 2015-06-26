PeerConnection Experiments
==========================

This is a simple project for testing PeerConnection functionality. It provides
enough scaffolding for you to negotiate and attach MediaStreams to the DOM, as
well as supporting other functionality such as renegotiation.

[peerconnection-experiments.herokuapp.com](https://peerconnection-experiments.herokuapp.com)

To test locally, run

```
$ npm install && npm start
```

and navigate to [localhost:9000](http://localhost:9000). Currently the project
uses the postMessage API for signaling, so there's no need to run, for example,
a WebSocket server.
