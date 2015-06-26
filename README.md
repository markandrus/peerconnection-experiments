PeerConnection Experiments
==========================

This is a simple project for testing PeerConnection functionality. It provides
enough scaffolding for you to negotiate and attach MediaStreams to the DOM, as
well as supporting other functionality such as renegotiation.

Test at

- [peerconnection-experiments.herokuapp.com](https://peerconnection-experiments.herokuapp.com) (WebSocket or IFrames)
- [markandrus.github.io/peerconnection-experiments](https://markandrus.github.io/peerconnection-experiments/) (IFrames-only)

or test locally by running

```
$ npm install && npm start
```

and navigate to [localhost:9000](http://localhost:9000). Currently the project
uses the postMessage API for signaling, so there's no need to run, for example,
a WebSocket server.
