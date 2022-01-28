"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var react_1 = require("react");

var relay_runtime_1 = require("relay-runtime");

var useRelayEnvironment_1 = require("./useRelayEnvironment");

function useSubscription(config, opts) {
  var environment = useRelayEnvironment_1.useRelayEnvironment();
  var skip = opts && opts.skip;
  react_1.useEffect(function () {
    if (skip) {
      return;
    }

    var dispose = relay_runtime_1.requestSubscription(environment, config).dispose;
    return dispose;
  }, [environment, config, skip]);
}

exports.useSubscription = useSubscription;