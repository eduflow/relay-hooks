"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var relay_runtime_1 = require("relay-runtime");

var RelayHooksTypes_1 = require("./RelayHooksTypes");

exports.isNetworkPolicy = function (policy, full) {
  return policy === RelayHooksTypes_1.NETWORK_ONLY || policy === RelayHooksTypes_1.STORE_THEN_NETWORK || policy === RelayHooksTypes_1.STORE_OR_NETWORK && !full;
};

exports.isStorePolicy = function (policy) {
  return policy !== RelayHooksTypes_1.NETWORK_ONLY;
};

exports.forceCache = {
  force: true
}; // Fetcher

function createOperation(gqlQuery, variables, cacheConfig) {
  return relay_runtime_1.createOperationDescriptor(relay_runtime_1.getRequest(gqlQuery), variables, cacheConfig);
}

exports.createOperation = createOperation;