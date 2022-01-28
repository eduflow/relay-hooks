"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = require("react");

var ReactRelayContext_1 = require("./ReactRelayContext");

function useRelayEnvironment() {
  var environment = React.useContext(ReactRelayContext_1.ReactRelayContext).environment;
  return environment;
}

exports.useRelayEnvironment = useRelayEnvironment;