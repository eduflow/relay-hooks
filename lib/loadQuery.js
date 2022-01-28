"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var QueryFetcher_1 = require("./QueryFetcher");

var Utils_1 = require("./Utils");

var emptyFunction = function () {
  return undefined;
};

exports.internalLoadQuery = function (promise) {
  if (promise === void 0) {
    promise = false;
  }

  var queryFetcher = new QueryFetcher_1.QueryFetcher();

  var dispose = function () {
    queryFetcher.dispose();
    queryFetcher.setForceUpdate(emptyFunction);
    queryFetcher = new QueryFetcher_1.QueryFetcher();
  };

  var next = function (environment, gqlQuery, variables, options) {
    if (variables === void 0) {
      variables = {};
    }

    if (options === void 0) {
      options = {};
    }

    var _a;

    options.networkCacheConfig = (_a = options.networkCacheConfig) !== null && _a !== void 0 ? _a : Utils_1.forceCache;
    queryFetcher.resolve(environment, gqlQuery, variables, options);
    var toThrow = queryFetcher.checkAndSuspense();
    return toThrow ? toThrow instanceof Error ? Promise.reject(toThrow) : toThrow : Promise.resolve();
  };

  var getValue = function (environment) {
    queryFetcher.resolveEnvironment(environment);
    queryFetcher.checkAndSuspense(promise);
    return queryFetcher.getData();
  };

  var subscribe = function (callback) {
    queryFetcher.setForceUpdate(callback);
    return function () {
      if (queryFetcher.getForceUpdate() === callback) {
        queryFetcher.setForceUpdate(emptyFunction);
      }
    };
  };

  return {
    next: next,
    subscribe: subscribe,
    getValue: getValue,
    dispose: dispose
  };
};

exports.loadLazyQuery = function () {
  return exports.internalLoadQuery(true);
};

exports.loadQuery = function () {
  return exports.internalLoadQuery(false);
};