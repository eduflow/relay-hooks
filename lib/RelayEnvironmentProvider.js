"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = require("react");

var ReactRelayContext_1 = require("./ReactRelayContext"); // eslint-disable-line @typescript-eslint/no-unused-vars


exports.RelayEnvironmentProvider = function (props) {
  var context = React.useMemo(function () {
    return {
      environment: props.environment
    };
  }, [props.environment]);
  return React.createElement(ReactRelayContext_1.ReactRelayContext.Provider, {
    value: context
  }, props.children);
};