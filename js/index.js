'use strict';

function parseQueryString(queryString) {
  var keyValues = [];
  if (queryString) {
    queryString = queryString.replace(/^\?/, '');
    queryString.split('&').forEach(function(keyValue) {
      keyValue = keyValue.split('=');
      var key = keyValue[0];
      var value = keyValue[1];
      if (key && value) {
        key = decodeURIComponent(key);
        value = decodeURIComponent(value);
        keyValues.push([key, value]);
      }
    });
  }
  return keyValues;
}

function getFromQueryString(queryString, key) {
  var keyValues = parseQueryString(queryString);
  var values = [];
  keyValues.forEach(function(keyValue) {
    if (keyValue[0] === key) {
      values.push(keyValue[1]);
    }
  });
  return values;
}
