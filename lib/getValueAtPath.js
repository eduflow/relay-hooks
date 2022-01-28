"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var invariant = require("fbjs/lib/invariant");

function getValueAtPath(data, path) {
  var result = data;

  for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
    var key = path_1[_i];

    if (result == null) {
      return null;
    }

    if (typeof key === 'number') {
      !Array.isArray(result) ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: Expected an array when extracting value at path. ' + "If you're seeing this, this is likely a bug in Relay.") : invariant(false) : void 0;
      result = result[key];
    } else {
      !(typeof result === 'object' && !Array.isArray(result)) ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: Expected an object when extracting value at path. ' + "If you're seeing this, this is likely a bug in Relay.") : invariant(false) : void 0;
      result = result[key];
    }
  }

  return result;
}

exports.getValueAtPath = getValueAtPath;