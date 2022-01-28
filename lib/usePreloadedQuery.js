"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var react_1 = require("react");

var useForceUpdate_1 = require("./useForceUpdate");

var useRelayEnvironment_1 = require("./useRelayEnvironment");

exports.usePreloadedQuery = function (loadQuery) {
  var forceUpdate = useForceUpdate_1.useForceUpdate();
  var environment = useRelayEnvironment_1.useRelayEnvironment();
  react_1.useEffect(function () {
    return loadQuery.subscribe(forceUpdate); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadQuery]);
  return loadQuery.getValue(environment);
};