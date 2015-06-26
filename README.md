PeerConnection Experiments
==========================

This is a simple project for testing PeerConnection functionality. It provides
enough scaffolding for you to negotiate and attach MediaStreams to the DOM, as
well as supporting other functionality such as renegotiation.

Test now at [markandrus.github.io/peerconnection-experiments](https://markandrus.github.io/peerconnection-experiments).

To test locally, run

```
$ python -m SimpleHTTPServer 9000
```

and navigate to [localhost:9000](http://localhost:9000). Currently the project
uses the postMessage API for signaling, so there's no need to run, for example,
a WebSocket server.

TODO
----

- Add WebSocket signaling as an option for testing between Chrome and Firefox.
