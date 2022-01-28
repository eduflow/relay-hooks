import { useRef, useEffect } from 'react';
import { getOrCreateQueryFetcher } from './QueryFetcher';
import { useForceUpdate } from './useForceUpdate';
import { useRelayEnvironment } from './useRelayEnvironment';
import { forceCache } from './Utils';

var useInternalQuery = function (gqlQuery, variables, options, suspense) {
  var environment = useRelayEnvironment();
  var forceUpdate = useForceUpdate();
  var ref = useRef();

  if (ref.current === null || ref.current === undefined) {
    ref.current = {
      queryFetcher: getOrCreateQueryFetcher(suspense, gqlQuery, variables, options.networkCacheConfig)
    };
  }

  useEffect(function () {
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

export var useQuery = function (gqlQuery, variables, options) {
  if (variables === void 0) {
    variables = {};
  }

  if (options === void 0) {
    options = {};
  }

  return useInternalQuery(gqlQuery, variables, options, false);
};
export var useLazyLoadQuery = function (gqlQuery, variables, options) {
  if (variables === void 0) {
    variables = {};
  }

  if (options === void 0) {
    options = {};
  }

  var _a;

  options.networkCacheConfig = (_a = options.networkCacheConfig) !== null && _a !== void 0 ? _a : forceCache;
  return useInternalQuery(gqlQuery, variables, options, true);
};