"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var react_1 = require("react");

function useForceUpdate() {
  var _a = react_1.useReducer(function (x) {
    return x + 1;
  }, 0),
      forceUpdate = _a[1];

  return forceUpdate;
}

exports.useForceUpdate = useForceUpdate;