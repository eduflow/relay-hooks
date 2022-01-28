"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var react_1 = require("react");

var QueryFetcher_1 = require("./QueryFetcher");

var useForceUpdate_1 = require("./useForceUpdate");

var useRelayEnvironment_1 = require("./useRelayEnvironment");

var Utils_1 = require("./Utils");

var useInternalQuery = function (gqlQuery, variables, options, suspense) {
  var environment = useRelayEnvironment_1.useRelayEnvironment();
  var forceUpdate = useForceUpdate_1.useForceUpdate();
  var ref = react_1.useRef();

  if (ref.current === null || ref.current === undefined) {
    ref.current = {
      queryFetcher: QueryFetcher_1.getOrCreateQueryFetcher(suspense, gqlQuery, variables, options.networkCacheConfig)
    };
  }

  react_1.useEffect(function () {
    return function () {
      return ref.current.queryFetcher.dispose();
    };
  }, []);
  var queryFetcher = ref.current.queryFetcher;
  queryFetcher.resolve(environment, gqlQuery, variables, options);
  queryFetcher.checkAndSuspense(suspense, suspense);
  queryFetcher.setForceUpdate(forceUpdate);
  return queryFetcher.getData();
};

exports.useQuery = function (gqlQuery, variables, options) {
  if (variables === void 0) {
    variables = {};
  }

  if (options === void 0) {
    options = {};
  }

  return useInternalQuery(gqlQuery, variables, options, false);
};

exports.useLazyLoadQuery = function (gqlQuery, variables, options) {
  if (variables === void 0) {
    variables = {};
  }

  if (options === void 0) {
    options = {};
  }

  var _a;

  options.networkCacheConfig = (_a = options.networkCacheConfig) !== null && _a !== void 0 ? _a : Utils_1.forceCache;
  return useInternalQuery(gqlQuery, variables, options, true);
};