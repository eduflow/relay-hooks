(function (global, factory) {
typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('relay-runtime'), require('react'), require('fbjs/lib/areEqual'), require('fbjs/lib/warning'), require('fbjs/lib/invariant'), require('@restart/hooks/useMounted')) :
typeof define === 'function' && define.amd ? define(['exports', 'relay-runtime', 'react', 'fbjs/lib/areEqual', 'fbjs/lib/warning', 'fbjs/lib/invariant', '@restart/hooks/useMounted'], factory) :
(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['relay-hooks'] = {}, global.relayRuntime, global.React, global.areEqual, global.warning, global.invariant, global.useMounted));
}(this, (function (exports, relayRuntime, React, areEqual, warning, invariant, useMounted) { 'use strict';

var React__default = 'default' in React ? React['default'] : React;
areEqual = areEqual && Object.prototype.hasOwnProperty.call(areEqual, 'default') ? areEqual['default'] : areEqual;
warning = warning && Object.prototype.hasOwnProperty.call(warning, 'default') ? warning['default'] : warning;
invariant = invariant && Object.prototype.hasOwnProperty.call(invariant, 'default') ? invariant['default'] : invariant;
useMounted = useMounted && Object.prototype.hasOwnProperty.call(useMounted, 'default') ? useMounted['default'] : useMounted;

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */
var createRelayContext = relayRuntime.__internal.createRelayContext;
var ReactRelayContext = createRelayContext(React__default);

var NETWORK_ONLY = 'network-only';
var STORE_THEN_NETWORK = 'store-and-network';
var STORE_OR_NETWORK = 'store-or-network';
var STORE_ONLY = 'store-only';
var PAGINATION_NAME = 'usePagination';
var REFETCHABLE_NAME = 'useRefetchable';
var FRAGMENT_NAME = 'useFragment'; // pagination

var FORWARD = 'forward';

var isNetworkPolicy = function (policy, full) {
  return policy === NETWORK_ONLY || policy === STORE_THEN_NETWORK || policy === STORE_OR_NETWORK && !full;
};
var isStorePolicy = function (policy) {
  return policy !== NETWORK_ONLY;
};
var forceCache = {
  force: true
}; // Fetcher

function createOperation(gqlQuery, variables, cacheConfig) {
  return relayRuntime.createOperationDescriptor(relayRuntime.getRequest(gqlQuery), variables, cacheConfig);
}

var fetchQuery = relayRuntime.__internal.fetchQuery;
var DATA_RETENTION_TIMEOUT = 30 * 1000;
function fetchResolver(_a) {
  var setLoading = _a.setLoading,
      _b = _a.doRetain,
      doRetain = _b === void 0 ? true : _b,
      disposeTemporary = _a.disposeTemporary;
  var _refetchSubscription = null;
  var disposable = null;
  var releaseQueryTimeout;
  var isLoading = false;
  var query;
  var promise;
  var error = null;
  var env;

  var updateLoading = function (loading) {
    isLoading = loading;
    setLoading && setLoading(isLoading);
  };

  var lookupInStore = function (environment, operation, fetchPolicy, renderPolicy) {
    if (isStorePolicy(fetchPolicy)) {
      var check = environment.check(operation);
      var queryStatus = check.status;
      var hasFullQuery = queryStatus === 'available';
      var canPartialRender = hasFullQuery || renderPolicy === 'partial' && queryStatus !== 'stale';

      if (canPartialRender) {
        return {
          snapshot: environment.lookup(operation.fragment),
          full: hasFullQuery
        };
      }
    }

    return {
      snapshot: null,
      full: false
    };
  };

  var dispose = function () {
    clearTemporaryRetain();
    disposable && disposable.dispose();
    disposeRequest();
    disposable = null;
    env = null;
    query = null;
  };

  var clearTemporaryRetain = function () {
    clearTimeout(releaseQueryTimeout);
    releaseQueryTimeout = null;
  };

  var temporaryRetain = function () {
    var localReleaseTemporaryRetain = function () {
      clearTemporaryRetain();
      dispose();
      disposeTemporary && disposeTemporary();
    };

    releaseQueryTimeout = setTimeout(localReleaseTemporaryRetain, DATA_RETENTION_TIMEOUT);
  };

  var disposeRequest = function () {
    _refetchSubscription && _refetchSubscription.unsubscribe();
    error = null;
  };

  var fetch = function (environment, operation, fetchPolicy, onComplete, onNext, renderPolicy) {
    if (fetchPolicy === void 0) {
      fetchPolicy = 'network-only';
    }

    if (onComplete === void 0) {
      onComplete = function (_e) {
        return undefined;
      };
    }

    if (env != environment || query.request.identifier !== operation.request.identifier) {
      dispose();

      if (doRetain) {
        disposable = environment.retain(operation);
      }
    }

    env = environment;
    query = operation;
    disposeRequest();

    var _a = lookupInStore(environment, operation, fetchPolicy, renderPolicy),
        snapshot = _a.snapshot,
        full = _a.full;

    var isNetwork = isNetworkPolicy(fetchPolicy, full);

    if (snapshot != null) {
      var onlyStore = !isNetwork;
      onNext(operation, snapshot, true, onlyStore);

      if (onlyStore) {
        onComplete(null);
      }
    } // Cancel any previously running refetch.


    _refetchSubscription && _refetchSubscription.unsubscribe();

    if (isNetwork) {
      var resolveNetworkPromise_1 = function () {}; // Declare refetchSubscription before assigning it in .start(), since
      // synchronous completion may call callbacks .subscribe() returns.


      var refetchSubscription_1;

      var cleanup_1 = function () {
        if (_refetchSubscription === refetchSubscription_1) {
          _refetchSubscription = null;
        }

        isLoading = false;
        promise = null;
      };

      fetchQuery(environment, operation).subscribe({
        unsubscribe: function () {
          cleanup_1();
        },
        complete: function () {
          resolveNetworkPromise_1();
          updateLoading(false);
          cleanup_1();
          onComplete(null);
        },
        error: function (e) {
          error = e;
          resolveNetworkPromise_1();
          updateLoading(false);
          cleanup_1();
          onComplete(e);
        },
        next: function () {
          var _a;

          var store = environment.lookup(operation.fragment);
          promise = null;
          ((_a = operation.request.cacheConfig) === null || _a === void 0 ? void 0 : _a.poll) && updateLoading(false);
          resolveNetworkPromise_1();
          onNext(operation, store);
        },
        start: function (subscription) {
          refetchSubscription_1 = subscription;
          _refetchSubscription = refetchSubscription_1;
          updateLoading(true);
        }
      });

      if (!snapshot) {
        promise = new Promise(function (resolve) {
          resolveNetworkPromise_1 = resolve;
        });
      }

      return {
        dispose: function () {
          refetchSubscription_1 && refetchSubscription_1.unsubscribe();
        }
      };
    }

    return {
      dispose: function () {}
    };
  };

  var checkAndSuspense = function (suspense, useLazy) {
    clearTemporaryRetain();
    var toThrow = promise || error;

    if (suspense && toThrow) {
      if (promise && useLazy) {
        temporaryRetain();
      }

      throw toThrow;
    }

    return toThrow;
  };

  var getData = function () {
    return {
      isLoading: isLoading,
      error: error
    };
  };

  return {
    fetch: fetch,
    getData: getData,
    dispose: dispose,
    checkAndSuspense: checkAndSuspense
  };
}

var defaultPolicy = 'network-only';
var cache = new Map();
function getOrCreateQueryFetcher(useLazy, gqlQuery, variables, networkCacheConfig) {
  var query = createOperation(gqlQuery, variables, networkCacheConfig);
  var toGet = useLazy && cache.has(query.request.identifier);
  var queryFetcher = toGet ? cache.get(query.request.identifier) : new QueryFetcher();
  queryFetcher.setQuery(gqlQuery, variables, networkCacheConfig, query);
  return queryFetcher;
}

var emptyforceUpdate = function () {
  return undefined;
};

var QueryFetcher =
/** @class */
function () {
  function QueryFetcher() {
    var _this = this;

    this.forceUpdate = emptyforceUpdate;
    this.result = null;

    this.retry = function (cacheConfigOverride, options) {
      if (options === void 0) {
        options = {};
      }

      var _a = options.fetchPolicy,
          fetchPolicy = _a === void 0 ? 'network-only' : _a;
      /* eslint-disable indent */

      var query = cacheConfigOverride ? createOperation(_this.query.request.node, _this.query.request.variables, cacheConfigOverride) : _this.query;

      _this.fetch(query, fetchPolicy, options);

      _this.resolveResult();

      _this.forceUpdate();
    };

    this.result = {
      retry: this.retry,
      error: null,
      data: null,
      isLoading: false
    };
    this.fetcher = fetchResolver({
      disposeTemporary: function () {
        _this.dispose();

        _this.query && cache.delete(_this.query.request.identifier);
      }
    });
  }

  QueryFetcher.prototype.setQuery = function (gqlQuery, variables, networkCacheConfig, query) {
    this.gqlQuery = gqlQuery;
    this.variables = variables;
    this.query = query;
    this.cacheConfig = networkCacheConfig;
  };

  QueryFetcher.prototype.getForceUpdate = function () {
    return this.forceUpdate;
  };

  QueryFetcher.prototype.setForceUpdate = function (forceUpdate) {
    this.forceUpdate = forceUpdate;
  };

  QueryFetcher.prototype.dispose = function () {
    this.fetcher.dispose();
    this.disposeSnapshot();
  };

  QueryFetcher.prototype.disposeSnapshot = function () {
    this.snapshot = null;

    if (this.rootSubscription) {
      this.rootSubscription.dispose();
      this.rootSubscription = null;
    }
  };

  QueryFetcher.prototype.fetch = function (query, fetchPolicy, options, skip) {
    var _this = this;

    this.disposeSnapshot();

    if (skip) {
      this.fetcher.dispose();
      return;
    } // eslint-disable-next-line @typescript-eslint/camelcase


    var onComplete = options.onComplete;
    var fetchHasReturned = false;

    var onNext = function (_o, snapshot) {
      if (!_this.snapshot) {
        _this.snapshot = snapshot;

        _this.subscribe(snapshot);

        _this.resolveResult();

        if (fetchHasReturned) {
          _this.forceUpdate();
        }
      }
    };

    var complete = function (error) {
      _this.resolveResult();

      if (fetchHasReturned) {
        _this.forceUpdate();
      }

      onComplete && onComplete(error);
    };

    this.fetcher.fetch(this.environment, query, fetchPolicy, complete, onNext);
    fetchHasReturned = true;
  };

  QueryFetcher.prototype.getQuery = function (gqlQuery, variables, networkCacheConfig) {
    if (gqlQuery != this.gqlQuery || networkCacheConfig != this.cacheConfig || variables != this.variables || !areEqual(variables, this.variables)) {
      this.variables = variables;
      this.gqlQuery = gqlQuery;
      this.cacheConfig = networkCacheConfig;
      return createOperation(gqlQuery, variables, networkCacheConfig);
    }

    return this.query;
  };

  QueryFetcher.prototype.resolveEnvironment = function (environment) {
    this.resolve(environment, this.gqlQuery, this.variables, this.options);
  };

  QueryFetcher.prototype.resolve = function (environment, gqlQuery, variables, options) {
    var query = this.getQuery(gqlQuery, variables, options.networkCacheConfig);
    var _a = options.fetchPolicy,
        fetchPolicy = _a === void 0 ? defaultPolicy : _a,
        fetchKey = options.fetchKey,
        skip = options.skip;
    this.options = options;
    var diffQuery = !this.query || query.request.identifier !== this.query.request.identifier;

    if (diffQuery || environment !== this.environment || fetchPolicy !== this.fetchPolicy || fetchKey !== this.fetchKey || skip !== this.skip) {
      this.environment = environment;
      this.query = query;
      this.skip = skip;
      this.fetchPolicy = fetchPolicy;
      this.fetchKey = fetchKey;
      this.fetch(query, fetchPolicy, options, skip);
      this.resolveResult();
    }
  };

  QueryFetcher.prototype.checkAndSuspense = function (suspense, useLazy) {
    if (useLazy) {
      this.setForceUpdate(emptyforceUpdate);
      cache.set(this.query.request.identifier, this);
    }

    var result = this.fetcher.checkAndSuspense(suspense, useLazy);

    if (useLazy) {
      cache.delete(this.query.request.identifier);
    }

    return result;
  };

  QueryFetcher.prototype.getData = function () {
    return this.result;
  };

  QueryFetcher.prototype.resolveResult = function () {
    var _a = this.fetcher.getData(),
        error = _a.error,
        isLoading = _a.isLoading;

    this.result = {
      retry: this.retry,
      error: error,
      data: this.snapshot ? this.snapshot.data : null,
      isLoading: isLoading
    };
  };

  QueryFetcher.prototype.subscribe = function (snapshot) {
    var _this = this;

    if (this.rootSubscription) {
      this.rootSubscription.dispose();
    }

    this.rootSubscription = this.environment.subscribe(snapshot, function (snapshot) {
      // Read from this._fetchOptions in case onDataChange() was lazily added.
      _this.snapshot = snapshot; //this.error = null;

      _this.resolveResult();

      _this.forceUpdate();
    });
  };

  return QueryFetcher;
}();

function useForceUpdate() {
  var _a = React.useReducer(function (x) {
    return x + 1;
  }, 0),
      forceUpdate = _a[1];

  return forceUpdate;
}

function useRelayEnvironment() {
  var environment = React__default.useContext(ReactRelayContext).environment;
  return environment;
}

var useInternalQuery = function (gqlQuery, variables, options, suspense) {
  var environment = useRelayEnvironment();
  var forceUpdate = useForceUpdate();
  var ref = React.useRef();

  if (ref.current === null || ref.current === undefined) {
    ref.current = {
      queryFetcher: getOrCreateQueryFetcher(suspense, gqlQuery, variables, options.networkCacheConfig)
    };
  }

  React.useEffect(function () {
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

var useQuery = function (gqlQuery, variables, options) {
  if (variables === void 0) {
    variables = {};
  }

  if (options === void 0) {
    options = {};
  }

  return useInternalQuery(gqlQuery, variables, options, false);
};
var useLazyLoadQuery = function (gqlQuery, variables, options) {
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

var emptyFunction = function () {
  return undefined;
};

var internalLoadQuery = function (promise) {
  if (promise === void 0) {
    promise = false;
  }

  var queryFetcher = new QueryFetcher();

  var dispose = function () {
    queryFetcher.dispose();
    queryFetcher.setForceUpdate(emptyFunction);
    queryFetcher = new QueryFetcher();
  };

  var next = function (environment, gqlQuery, variables, options) {
    if (variables === void 0) {
      variables = {};
    }

    if (options === void 0) {
      options = {};
    }

    var _a;

    options.networkCacheConfig = (_a = options.networkCacheConfig) !== null && _a !== void 0 ? _a : forceCache;
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
var loadLazyQuery = function () {
  return internalLoadQuery(true);
};
var loadQuery = function () {
  return internalLoadQuery(false);
};

var usePreloadedQuery = function (loadQuery) {
  var forceUpdate = useForceUpdate();
  var environment = useRelayEnvironment();
  React.useEffect(function () {
    return loadQuery.subscribe(forceUpdate); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadQuery]);
  return loadQuery.getValue(environment);
};

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function getValueAtPath(data, path) {
  var result = data;

  for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
    var key = path_1[_i];

    if (result == null) {
      return null;
    }

    if (typeof key === 'number') {
      !Array.isArray(result) ?  invariant(false, 'Relay: Expected an array when extracting value at path. ' + "If you're seeing this, this is likely a bug in Relay.")  : void 0;
      result = result[key];
    } else {
      !(typeof result === 'object' && !Array.isArray(result)) ?  invariant(false, 'Relay: Expected an object when extracting value at path. ' + "If you're seeing this, this is likely a bug in Relay.")  : void 0;
      result = result[key];
    }
  }

  return result;
}

function getStateFromConnection(direction, fragmentNode, connection) {
  var _a, _b;

  if (connection == null) {
    return {
      cursor: null,
      hasMore: false
    };
  }

  var _c = relayRuntime.ConnectionInterface.get(),
      EDGES = _c.EDGES,
      PAGE_INFO = _c.PAGE_INFO,
      HAS_NEXT_PAGE = _c.HAS_NEXT_PAGE,
      HAS_PREV_PAGE = _c.HAS_PREV_PAGE,
      END_CURSOR = _c.END_CURSOR,
      START_CURSOR = _c.START_CURSOR;

  !(typeof connection === 'object') ?  invariant(false, 'Relay: Expected connection in fragment `%s` to have been `null`, or ' + 'a plain object with %s and %s properties. Instead got `%s`.', fragmentNode.name, EDGES, PAGE_INFO, connection)  : void 0;
  var edges = connection[EDGES];
  var pageInfo = connection[PAGE_INFO];

  if (edges == null || pageInfo == null) {
    return {
      cursor: null,
      hasMore: false
    };
  }

  !Array.isArray(edges) ?  invariant(false, 'Relay: Expected connection in fragment `%s` to have a plural `%s` field. ' + 'Instead got `%s`.', fragmentNode.name, EDGES, edges)  : void 0;
  !(typeof pageInfo === 'object') ?  invariant(false, 'Relay: Expected connection in fragment `%s` to have a `%s` field. ' + 'Instead got `%s`.', fragmentNode.name, PAGE_INFO, pageInfo)  : void 0;
  var cursor = direction === 'forward' ? (_a = pageInfo[END_CURSOR]) !== null && _a !== void 0 ? _a : null : (_b = pageInfo[START_CURSOR]) !== null && _b !== void 0 ? _b : null;
  !(cursor === null || typeof cursor === 'string') ?  invariant(false, 'Relay: Expected page info for connection in fragment `%s` to have a ' + 'valid `%s`. Instead got `%s`.', fragmentNode.name, START_CURSOR, cursor)  : void 0;
  var hasMore;

  if (direction === 'forward') {
    hasMore = cursor != null && pageInfo[HAS_NEXT_PAGE] === true;
  } else {
    hasMore = cursor != null && pageInfo[HAS_PREV_PAGE] === true;
  }

  return {
    cursor: cursor,
    hasMore: hasMore
  };
}
function getConnectionState(direction, fragmentNode, fragmentData, connectionPathInFragmentData) {
  var connection = getValueAtPath(fragmentData, connectionPathInFragmentData);
  return getStateFromConnection(direction, fragmentNode, connection);
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */
function getRefetchMetadata(fragmentNode, componentDisplayName) {
  var _a, _b;

  !(((_a = fragmentNode.metadata) === null || _a === void 0 ? void 0 : _a.plural) !== true) ?  invariant(false, 'Relay: getRefetchMetadata(): Expected fragment `%s` not to be plural when using ' + '`%s`. Remove `@relay(plural: true)` from fragment `%s` ' + 'in order to use it with `%s`.', fragmentNode.name, componentDisplayName, fragmentNode.name, componentDisplayName)  : void 0;
  var refetchMetadata = (_b = fragmentNode.metadata) === null || _b === void 0 ? void 0 : _b.refetch;
  !(refetchMetadata != null) ?  invariant(false, 'Relay: getRefetchMetadata(): Expected fragment `%s` to be refetchable when using `%s`. ' + 'Did you forget to add a @refetchable directive to the fragment?', componentDisplayName, fragmentNode.name)  : void 0; // handle both commonjs and es modules

  var refetchableRequest = refetchMetadata.operation.default ? refetchMetadata.operation.default : refetchMetadata.operation;
  var fragmentRefPathInResponse = refetchMetadata.fragmentPathInResult;
  !(typeof refetchableRequest !== 'string') ?  invariant(false, 'Relay: getRefetchMetadata(): Expected refetch query to be an ' + "operation and not a string when using `%s`. If you're seeing this, " + 'this is likely a bug in Relay.', componentDisplayName)  : void 0;
  var identifierField = refetchMetadata.identifierField;
  !(identifierField == null || typeof identifierField === 'string') ?  invariant(false, 'Relay: getRefetchMetadata(): Expected `identifierField` to be a string.')  : void 0;
  return {
    fragmentRefPathInResponse: fragmentRefPathInResponse,
    identifierField: identifierField,
    refetchableRequest: refetchableRequest,
    refetchMetadata: refetchMetadata
  };
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */
function getPaginationMetadata(fragmentNode, componentDisplayName) {
  var _a, _b;

  var _c = getRefetchMetadata(fragmentNode, componentDisplayName),
      paginationRequest = _c.refetchableRequest,
      refetchMetadata = _c.refetchMetadata;

  var paginationMetadata = refetchMetadata.connection;
  !(paginationMetadata != null) ?  invariant(false, 'Relay: getPaginationMetadata(): Expected fragment `%s` to include a ' + 'connection when using `%s`. Did you forget to add a @connection ' + 'directive to the connection field in the fragment?', componentDisplayName, fragmentNode.name)  : void 0;
  var connectionPathInFragmentData = paginationMetadata.path;
  var connectionMetadata = ((_b = (_a = fragmentNode.metadata) === null || _a === void 0 ? void 0 : _a.connection) !== null && _b !== void 0 ? _b : [])[0];
  !(connectionMetadata != null) ?  invariant(false, 'Relay: getPaginationMetadata(): Expected fragment `%s` to include a ' + 'connection when using `%s`. Did you forget to add a @connection ' + 'directive to the connection field in the fragment?', componentDisplayName, fragmentNode.name)  : void 0;
  var identifierField = refetchMetadata.identifierField;
  !(identifierField == null || typeof identifierField === 'string') ?  invariant(false, 'Relay: getRefetchMetadata(): Expected `identifierField` to be a string.')  : void 0;
  return {
    connectionPathInFragmentData: connectionPathInFragmentData,
    identifierField: identifierField,
    paginationRequest: paginationRequest,
    paginationMetadata: paginationMetadata,
    stream: connectionMetadata.stream === true
  };
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */
function getPaginationVariables(direction, count, cursor, baseVariables, extraVariables, paginationMetadata) {
  var _a, _b;

  var backwardMetadata = paginationMetadata.backward,
      forwardMetadata = paginationMetadata.forward;

  if (direction === 'backward') {
    !(backwardMetadata != null && backwardMetadata.count != null && backwardMetadata.cursor != null) ?  invariant(false, 'Relay: Expected backward pagination metadata to be available. ' + "If you're seeing this, this is likely a bug in Relay.")  : void 0;
     warning(!extraVariables.hasOwnProperty(backwardMetadata.cursor), 'Relay: `UNSTABLE_extraVariables` provided by caller should not ' + 'contain cursor variable `%s`. This variable is automatically ' + 'determined by Relay.', backwardMetadata.cursor) ;
     warning(!extraVariables.hasOwnProperty(backwardMetadata.count), 'Relay: `UNSTABLE_extraVariables` provided by caller should not ' + 'contain count variable `%s`. This variable is automatically ' + 'determined by Relay.', backwardMetadata.count) ;

    var paginationVariables_1 = __assign(__assign(__assign({}, baseVariables), extraVariables), (_a = {}, _a[backwardMetadata.cursor] = cursor, _a[backwardMetadata.count] = count, _a));

    if (forwardMetadata && forwardMetadata.cursor) {
      paginationVariables_1[forwardMetadata.cursor] = null;
    }

    if (forwardMetadata && forwardMetadata.count) {
      paginationVariables_1[forwardMetadata.count] = null;
    }

    return paginationVariables_1;
  }

  !(forwardMetadata != null && forwardMetadata.count != null && forwardMetadata.cursor != null) ?  invariant(false, 'Relay: Expected forward pagination metadata to be available. ' + "If you're seeing this, this is likely a bug in Relay.")  : void 0;
   warning(!extraVariables.hasOwnProperty(forwardMetadata.cursor), 'Relay: `UNSTABLE_extraVariables` provided by caller should not ' + 'contain cursor variable `%s`. This variable is automatically ' + 'determined by Relay.', forwardMetadata.cursor) ;
   warning(!extraVariables.hasOwnProperty(forwardMetadata.count), 'Relay: `UNSTABLE_extraVariables` provided by caller should not ' + 'contain count variable `%s`. This variable is automatically ' + 'determined by Relay.', forwardMetadata.count) ;

  var paginationVariables = __assign(__assign(__assign({}, baseVariables), extraVariables), (_b = {}, _b[forwardMetadata.cursor] = cursor, _b[forwardMetadata.count] = count, _b));

  if (backwardMetadata && backwardMetadata.cursor) {
    paginationVariables[backwardMetadata.cursor] = null;
  }

  if (backwardMetadata && backwardMetadata.count) {
    paginationVariables[backwardMetadata.count] = null;
  }

  return paginationVariables;
}

var getPromiseForActiveRequest = relayRuntime.__internal.getPromiseForActiveRequest;

function lookupFragment(environment, selector) {
  return selector.kind === 'PluralReaderSelector' ? selector.selectors.map(function (s) {
    return environment.lookup(s);
  }) : environment.lookup(selector);
}

function getFragmentResult(snapshot) {
  var missData = isMissingData(snapshot);

  if (Array.isArray(snapshot)) {
    return {
      snapshot: snapshot,
      data: snapshot.map(function (s) {
        return s.data;
      }),
      isMissingData: missData
    };
  }

  return {
    snapshot: snapshot,
    data: snapshot.data,
    isMissingData: missData
  };
}

function isMissingData(snapshot) {
  if (Array.isArray(snapshot)) {
    return snapshot.some(function (s) {
      return s.isMissingData;
    });
  }

  return snapshot.isMissingData;
}

function _getAndSavePromiseForFragmentRequestInFlight(fragmentNode, fragmentOwner, env) {
  var _a, _b;

  var networkPromise = getPromiseForActiveRequest(env, fragmentOwner);
  var pendingOperationName;

  if (networkPromise != null) {
    pendingOperationName = fragmentOwner.node.params.name;
  } else {
    var result = env.getOperationTracker().getPendingOperationsAffectingOwner(fragmentOwner);
    var pendingOperations = result === null || result === void 0 ? void 0 : result.pendingOperations;
    networkPromise = (_a = result === null || result === void 0 ? void 0 : result.promise) !== null && _a !== void 0 ? _a : null;
    pendingOperationName = (_b = pendingOperations === null || pendingOperations === void 0 ? void 0 : pendingOperations.map(function (op) {
      return op.node.params.name;
    }).join(',')) !== null && _b !== void 0 ? _b : null;
  }

  if (!networkPromise) {
    return null;
  }

  if (pendingOperationName == null || pendingOperationName.length === 0) {
    pendingOperationName = 'Unknown pending operation';
  } // When the Promise for the request resolves, we need to make sure to
  // update the cache with the latest data available in the store before
  // resolving the Promise


  var fragmentName = fragmentNode.name;
  var promiseDisplayName = pendingOperationName === fragmentName ? "Relay(" + pendingOperationName + ")" : "Relay(" + pendingOperationName + ":" + fragmentName + ")";
  networkPromise.displayName = promiseDisplayName;
  return networkPromise;
}

var FragmentResolver =
/** @class */
function () {
  function FragmentResolver(name) {
    var _this = this;

    this.unmounted = false;
    this.refetchable = false;
    this.pagination = false;

    this.refetch = function (variables, options) {
      var _a, _b, _c, _d;

      if (_this.unmounted === true) {
         warning(false, 'Relay: Unexpected call to `refetch` on unmounted component for fragment ' + '`%s` in `%s`. It looks like some instances of your component are ' + 'still trying to fetch data but they already unmounted. ' + 'Please make sure you clear all timers, intervals, ' + 'async calls, etc that may trigger a fetch.', _this._fragment.name, _this.name) ;
        return {
          dispose: function () {}
        };
      }

      if (_this._selector == null) {
         warning(false, 'Relay: Unexpected call to `refetch` while using a null fragment ref ' + 'for fragment `%s` in `%s`. When calling `refetch`, we expect ' + "initial fragment data to be non-null. Please make sure you're " + 'passing a valid fragment ref to `%s` before calling ' + '`refetch`, or make sure you pass all required variables to `refetch`.', _this._fragment.name, _this.name, _this.name) ;
      }

      var _e = getRefetchMetadata(_this._fragment, _this.name),
          fragmentRefPathInResponse = _e.fragmentRefPathInResponse,
          identifierField = _e.identifierField,
          refetchableRequest = _e.refetchableRequest;

      var fragmentData = _this.getData().data;

      var identifierValue = identifierField != null && fragmentData != null && typeof fragmentData === 'object' ? fragmentData[identifierField] : null;
      var parentVariables;
      var fragmentVariables;

      if (_this._selector == null) {
        parentVariables = {};
        fragmentVariables = {};
      } else if (_this._selector.kind === 'PluralReaderSelector') {
        parentVariables = (_b = (_a = _this._selector.selectors[0]) === null || _a === void 0 ? void 0 : _a.owner.variables) !== null && _b !== void 0 ? _b : {};
        fragmentVariables = (_d = (_c = _this._selector.selectors[0]) === null || _c === void 0 ? void 0 : _c.variables) !== null && _d !== void 0 ? _d : {};
      } else {
        parentVariables = _this._selector.owner.variables;
        fragmentVariables = _this._selector.variables;
      } // NOTE: A user of `useRefetchableFragment()` may pass a subset of
      // all variables required by the fragment when calling `refetch()`.
      // We fill in any variables not passed by the call to `refetch()` with the
      // variables from the original parent fragment owner.

      /* $FlowFixMe[cannot-spread-indexer] (>=0.123.0) This comment suppresses
       * an error found when Flow v0.123.0 was deployed. To see the error
       * delete this comment and run Flow. */


      var refetchVariables = __assign(__assign(__assign({}, parentVariables), fragmentVariables), variables);

      if (identifierField != null && !variables.hasOwnProperty('id')) {
        // @refetchable fragments are guaranteed to have an `id` selection
        // if the type is Node, implements Node, or is @fetchable. Double-check
        // that there actually is a value at runtime.
        if (typeof identifierValue !== 'string') {
           warning(false, 'Relay: Expected result to have a string  ' + '`%s` in order to refetch, got `%s`.', identifierField, identifierValue) ;
        }

        refetchVariables.id = identifierValue;
      }

      var onNext = function (operation, snapshot) {
        var fragmentRef = getValueAtPath(snapshot.data, fragmentRefPathInResponse);

        var isEquals = _this.isEqualsFragmentRef(_this._fragmentRefRefetch || _this._fragmentRef, fragmentRef);

        var missData = isMissingData(snapshot); //fromStore && isMissingData(snapshot);

        if (!isEquals || missData) {
          _this._fragmentRefRefetch = fragmentRef;
          _this._idfragmentrefetch = relayRuntime.getFragmentIdentifier(_this._fragment, fragmentRef);

          _this.lookup(_this._fragment, fragmentRef);

          _this.subscribe();
          /*if (!missData) {
              this.subscribe();
          }*/


          _this.resolverData.isMissingData = missData;
          _this.resolverData.owner = operation.request;

          _this.refreshHooks();
        }
      };

      if (_this.pagination) {
        _this.fetcherNext.dispose();

        _this.fetcherPrevious.dispose();
      }

      var operation = createOperation(refetchableRequest, refetchVariables, forceCache);
      return _this.fetcherRefecth.fetch(_this._environment, operation, options === null || options === void 0 ? void 0 : options.fetchPolicy, options === null || options === void 0 ? void 0 : options.onComplete, onNext, options === null || options === void 0 ? void 0 : options.UNSTABLE_renderPolicy);
    };

    this.loadPrevious = function (count, options) {
      return _this.loadMore('backward', count, options);
    };

    this.loadNext = function (count, options) {
      return _this.loadMore('forward', count, options);
    };

    this.loadMore = function (direction, count, options) {
      var _a;

      var onComplete = (_a = options === null || options === void 0 ? void 0 : options.onComplete) !== null && _a !== void 0 ? _a : function () {
        return undefined;
      };

      var fragmentData = _this.getData().data;

      var fetcher = direction === 'backward' ? _this.fetcherPrevious : _this.fetcherNext;

      if (_this.unmounted === true) {
        // Bail out and warn if we're trying to paginate after the component
        // has unmounted
         warning(false, 'Relay: Unexpected fetch on unmounted component for fragment ' + '`%s` in `%s`. It looks like some instances of your component are ' + 'still trying to fetch data but they already unmounted. ' + 'Please make sure you clear all timers, intervals, ' + 'async calls, etc that may trigger a fetch.', _this._fragment.name, _this.name) ;
        return {
          dispose: function () {}
        };
      }

      if (_this._selector == null) {
         warning(false, 'Relay: Unexpected fetch while using a null fragment ref ' + 'for fragment `%s` in `%s`. When fetching more items, we expect ' + "initial fragment data to be non-null. Please make sure you're " + 'passing a valid fragment ref to `%s` before paginating.', _this._fragment.name, _this.name, _this.name) ;
        onComplete(null);
        return {
          dispose: function () {}
        };
      }

      var isRequestActive = _this._environment.isRequestActive(_this._selector.owner.identifier);

      if (isRequestActive || fetcher.getData().isLoading === true || fragmentData == null) {
        onComplete(null);
        return {
          dispose: function () {}
        };
      }

      !(_this._selector != null && _this._selector.kind !== 'PluralReaderSelector') ?  invariant(false, 'Relay: Expected to be able to find a non-plural fragment owner for ' + "fragment `%s` when using `%s`. If you're seeing this, " + 'this is likely a bug in Relay.', _this._fragment.name, _this.name)  : void 0;

      var _b = getPaginationMetadata(_this._fragment, _this.name),
          paginationRequest = _b.paginationRequest,
          paginationMetadata = _b.paginationMetadata,
          identifierField = _b.identifierField,
          connectionPathInFragmentData = _b.connectionPathInFragmentData;

      var identifierValue = identifierField != null && fragmentData != null && typeof fragmentData === 'object' ? fragmentData[identifierField] : null;
      var parentVariables = _this._selector.owner.variables;
      var fragmentVariables = _this._selector.variables;
      var extraVariables = options === null || options === void 0 ? void 0 : options.UNSTABLE_extraVariables;

      var baseVariables = __assign(__assign({}, parentVariables), fragmentVariables);

      var cursor = getConnectionState(direction, _this._fragment, fragmentData, connectionPathInFragmentData).cursor;
      var paginationVariables = getPaginationVariables(direction, count, cursor, baseVariables, __assign({}, extraVariables), paginationMetadata); // If the query needs an identifier value ('id' or similar) and one
      // was not explicitly provided, read it from the fragment data.

      if (identifierField != null) {
        // @refetchable fragments are guaranteed to have an `id` selection
        // if the type is Node, implements Node, or is @fetchable. Double-check
        // that there actually is a value at runtime.
        if (typeof identifierValue !== 'string') {
           warning(false, 'Relay: Expected result to have a string  ' + '`%s` in order to refetch, got `%s`.', identifierField, identifierValue) ;
        }

        paginationVariables.id = identifierValue;
      }

      var onNext = function () {};

      var operation = createOperation(paginationRequest, paginationVariables, forceCache);
      return fetcher.fetch(_this._environment, operation, undefined, //options?.fetchPolicy,
      onComplete, onNext);
    };

    this.name = name;
    this.pagination = name === PAGINATION_NAME;
    this.refetchable = name === REFETCHABLE_NAME || this.pagination;

    var setLoading = function (_loading) {
      return _this.refreshHooks();
    };

    if (this.refetchable) {
      this.fetcherRefecth = fetchResolver({
        setLoading: setLoading,
        doRetain: true
      });
    }

    if (this.pagination) {
      this.fetcherNext = fetchResolver({
        setLoading: setLoading
      });
      this.fetcherPrevious = fetchResolver({
        setLoading: setLoading
      });
    }
  }

  FragmentResolver.prototype.setForceUpdate = function (forceUpdate) {
    var _this = this;

    if (forceUpdate === void 0) {
      forceUpdate = function () {
        return undefined;
      };
    }

    this.refreshHooks = function () {
      _this.resolveResult();

      forceUpdate();
    };
  };

  FragmentResolver.prototype.subscribeResolve = function (subscribeResolve) {
    if (this._subscribeResolve && this._subscribeResolve != subscribeResolve) {
      subscribeResolve(this.getData());
    }

    this._subscribeResolve = subscribeResolve;
  };

  FragmentResolver.prototype.setUnmounted = function () {
    this.unmounted = true;
  };

  FragmentResolver.prototype.isEqualsFragmentRef = function (prevFragment, fragmentRef) {
    if (this._fragmentRef !== fragmentRef) {
      var prevIDs = relayRuntime.getDataIDsFromFragment(this._fragment, prevFragment);
      var nextIDs = relayRuntime.getDataIDsFromFragment(this._fragment, fragmentRef);

      if (!areEqual(prevIDs, nextIDs) || !areEqual(this.getFragmentVariables(fragmentRef), this.getFragmentVariables(prevFragment))) {
        return false;
      }
    }

    return true;
  };

  FragmentResolver.prototype.dispose = function () {
    this.unsubscribe();
    this.fetcherNext && this.fetcherNext.dispose();
    this.fetcherPrevious && this.fetcherPrevious.dispose();
    this._idfragmentrefetch = null;
    this._fragmentRefRefetch = null;
    this.fetcherRefecth && this.fetcherRefecth.dispose();
  };

  FragmentResolver.prototype.getFragmentVariables = function (fRef) {
    if (fRef === void 0) {
      fRef = this._fragmentRef;
    }

    return relayRuntime.getVariablesFromFragment(this._fragment, fRef);
  };

  FragmentResolver.prototype.resolve = function (environment, idfragment, fragment, fragmentRef) {
    if (!this.resolverData || this._environment !== environment || idfragment !== this._idfragment && (!this._idfragmentrefetch || this._idfragmentrefetch && idfragment !== this._idfragmentrefetch)) {
      this._fragment = fragment;
      this._fragmentRef = fragmentRef;
      this._idfragment = idfragment;
      this._selector = null;
      this.dispose();
      this._environment = environment;
      this.lookup(fragment, this._fragmentRef);
      this.resolveResult();
    }
  };

  FragmentResolver.prototype.lookup = function (fragment, fragmentRef) {
    if (fragmentRef == null) {
      this.resolverData = {
        data: null
      };
      return;
    }

    var isPlural = fragment.metadata && fragment.metadata.plural && fragment.metadata.plural === true;

    if (isPlural) {
      if (fragmentRef.length === 0) {
        this.resolverData = {
          data: []
        };
        return;
      }
    }

    this._selector = relayRuntime.getSelector(fragment, fragmentRef);
    var snapshot = lookupFragment(this._environment, this._selector);
    this.resolverData = getFragmentResult(snapshot);
    var owner = this._selector ? this._selector.kind === 'PluralReaderSelector' ? this._selector.selectors[0].owner : this._selector.owner : null;
    this.resolverData.owner = owner; //this.subscribe();
  };

  FragmentResolver.prototype.checkAndSuspense = function (suspense) {
    var _this = this;

    var _a;

    if (suspense && this.resolverData.isMissingData && this.resolverData.owner) {
      var fragmentOwner = this.resolverData.owner;

      var networkPromise = _getAndSavePromiseForFragmentRequestInFlight(this._fragment, fragmentOwner, this._environment);

      var parentQueryName = (_a = fragmentOwner.node.params.name) !== null && _a !== void 0 ? _a : 'Unknown Parent Query';

      if (networkPromise != null) {
        // When the Promise for the request resolves, we need to make sure to
        // update the cache with the latest data available in the store before
        // resolving the Promise
        var promise = networkPromise.then(function () {
          if (_this._idfragmentrefetch) {
            _this.resolveResult();
          } else {
            _this._idfragment = null;

            _this.dispose();
          } //;

        }).catch(function (_error) {
          if (_this._idfragmentrefetch) {
            _this.resolveResult();
          } else {
            _this._idfragment = null;

            _this.dispose();
          }
        }); // $FlowExpectedError[prop-missing] Expando to annotate Promises.

        promise.displayName = 'Relay(' + parentQueryName + ')';
        this.unsubscribe();

        this.refreshHooks = function () {
          return undefined;
        };

        throw promise;
      }

       warning(false, 'Relay: Tried reading fragment `%s` declared in ' + '`%s`, but it has missing data and its parent query `%s` is not ' + 'being fetched.\n' + 'This might be fixed by by re-running the Relay Compiler. ' + ' Otherwise, make sure of the following:\n' + '* You are correctly fetching `%s` if you are using a ' + '"store-only" `fetchPolicy`.\n' + "* Other queries aren't accidentally fetching and overwriting " + 'the data for this fragment.\n' + '* Any related mutations or subscriptions are fetching all of ' + 'the data for this fragment.\n' + "* Any related store updaters aren't accidentally deleting " + 'data for this fragment.', this._fragment.name, this.name, parentQueryName, parentQueryName) ;
    }

    this.fetcherRefecth && this.fetcherRefecth.checkAndSuspense(suspense);
  };

  FragmentResolver.prototype.getData = function () {
    return this.result;
  };

  FragmentResolver.prototype.resolveResult = function () {
    var data = this.resolverData.data;

    if (this.refetchable || this.pagination) {
      var _a = this.fetcherRefecth.getData(),
          isLoading = _a.isLoading,
          error = _a.error;

      var refetch = this.refetch;

      if (!this.pagination) {
        // useRefetchable
        {
          getRefetchMetadata(this._fragment, this.name);
        }

        this.result = {
          data: data,
          isLoading: isLoading,
          error: error,
          refetch: refetch
        };
      } else {
        // usePagination
        var connectionPathInFragmentData = getPaginationMetadata(this._fragment, this.name).connectionPathInFragmentData;
        var connection = getValueAtPath(data, connectionPathInFragmentData);
        var hasNext = getStateFromConnection('forward', this._fragment, connection).hasMore;
        var hasPrevious = getStateFromConnection('backward', this._fragment, connection).hasMore;

        var _b = this.fetcherNext.getData(),
            isLoadingNext = _b.isLoading,
            errorNext = _b.error;

        var _c = this.fetcherPrevious.getData(),
            isLoadingPrevious = _c.isLoading,
            errorPrevious = _c.error;

        this.result = {
          data: data,
          hasNext: hasNext,
          isLoadingNext: isLoadingNext,
          hasPrevious: hasPrevious,
          isLoadingPrevious: isLoadingPrevious,
          isLoading: isLoading,
          errorNext: errorNext,
          errorPrevious: errorPrevious,
          error: error,
          refetch: refetch,
          loadNext: this.loadNext,
          loadPrevious: this.loadPrevious
        };
      }
    } else {
      // useFragment
      this.result = data;
    }

    this._subscribeResolve && this._subscribeResolve(this.result);
  };

  FragmentResolver.prototype.unsubscribe = function () {
    this._disposable && this._disposable.dispose();
  };

  FragmentResolver.prototype.subscribe = function () {
    var _this = this;

    var environment = this._environment;
    var renderedSnapshot = this.resolverData.snapshot;
    this.unsubscribe();
    var dataSubscriptions = [];

    if (renderedSnapshot) {
      if (Array.isArray(renderedSnapshot)) {
        renderedSnapshot.forEach(function (snapshot, idx) {
          dataSubscriptions.push(environment.subscribe(snapshot, function (latestSnapshot) {
            _this.resolverData.snapshot[idx] = latestSnapshot;
            _this.resolverData.data[idx] = latestSnapshot.data;
            _this.resolverData.isMissingData = false;

            _this.refreshHooks();
          }));
        });
      } else {
        dataSubscriptions.push(environment.subscribe(renderedSnapshot, function (latestSnapshot) {
          _this.resolverData = getFragmentResult(latestSnapshot);
          _this.resolverData.isMissingData = false;

          _this.refreshHooks();
        }));
      }
    }

    this._disposable = {
      dispose: function () {
        dataSubscriptions.map(function (s) {
          return s.dispose();
        });
        _this._disposable = undefined;
      }
    };
  };

  return FragmentResolver;
}();

function useOssFragment(fragmentNode, fragmentRef, suspense, name, subscribeResolve) {
  var environment = useRelayEnvironment();
  var forceUpdate = useForceUpdate();
  var ref = React.useRef(null);

  if (ref.current === null || ref.current === undefined) {
    ref.current = {
      resolver: new FragmentResolver(name)
    };
  }

  var resolver = ref.current.resolver;
  React.useEffect(function () {
    return function () {
      ref.current.resolver.setUnmounted();
    };
  }, []);
  React.useEffect(function () {
    return function () {
      resolver.dispose();
    };
  }, [resolver]);
  var fragment = React.useMemo(function () {
    return relayRuntime.getFragment(fragmentNode);
  }, [fragmentNode]);
  var idfragment = React.useMemo(function () {
    return relayRuntime.getFragmentIdentifier(fragment, fragmentRef);
  }, [fragment, fragmentRef]);
  React.useEffect(function () {
    resolver.subscribe();
    return function () {
      resolver.unsubscribe();
    };
  }, [resolver, idfragment, environment]);
  resolver.subscribeResolve(subscribeResolve);
  resolver.resolve(environment, idfragment, fragment, fragmentRef);

  if (subscribeResolve) {
    resolver.setForceUpdate();
    return;
  }

  resolver.checkAndSuspense(suspense);
  resolver.setForceUpdate(forceUpdate);
  var data = resolver.getData();

  {
    if (fragmentRef != null && (data === undefined || Array.isArray(data) && data.length > 0 && data.every(function (data) {
      return data === undefined;
    }))) {
       warning(false, 'Relay: Expected to have been able to read non-null data for ' + 'fragment `%s` declared in ' + '`%s`, since fragment reference was non-null. ' + "Make sure that that `%s`'s parent isn't " + 'holding on to and/or passing a fragment reference for data that ' + 'has been deleted.', fragment, name, name) ;
    }
  }

  return [data, resolver];
}

function useFragment(fragmentNode, fragmentRef) {
  var data = useOssFragment(fragmentNode, fragmentRef, false, FRAGMENT_NAME)[0];
  return data;
}
function useSuspenseFragment(fragmentNode, fragmentRef) {
  var data = useOssFragment(fragmentNode, fragmentRef, true, FRAGMENT_NAME)[0];
  return data;
}
function useFragmentSubscription(fragmentNode, fragmentRef, callback) {
  useOssFragment(fragmentNode, fragmentRef, false, FRAGMENT_NAME, callback);
}

var useCallback = React__default.useCallback,
    useState = React__default.useState;
function useMutation(mutation, userConfig,
/** if not provided, the context environment will be used. */
environment) {
  if (userConfig === void 0) {
    userConfig = {};
  }

  var _a = useState({
    loading: false,
    data: null,
    error: null
  }),
      state = _a[0],
      setState = _a[1];

  var isMounted = useMounted();
  var relayEnvironment = useRelayEnvironment();
  var resolvedEnvironment = environment || relayEnvironment;
  var configs = userConfig.configs,
      variables = userConfig.variables,
      uploadables = userConfig.uploadables,
      onCompleted = userConfig.onCompleted,
      onError = userConfig.onError,
      optimisticUpdater = userConfig.optimisticUpdater,
      optimisticResponse = userConfig.optimisticResponse,
      updater = userConfig.updater;
  var mutate = useCallback(function (config) {
    var mergedConfig = __assign({
      configs: configs,
      variables: variables,
      uploadables: uploadables,
      onCompleted: onCompleted,
      onError: onError,
      optimisticUpdater: optimisticUpdater,
      optimisticResponse: optimisticResponse,
      updater: updater
    }, config);

    !mergedConfig.variables ?  invariant(false, 'you must specify variables')  : void 0;

    if (isMounted()) {
      setState({
        loading: true,
        data: mergedConfig.optimisticResponse,
        error: null
      });
    }

    return new Promise(function (resolve, reject) {
      function handleError(error) {
        if (isMounted()) {
          setState({
            loading: false,
            data: null,
            error: error
          });
        }

        if (mergedConfig.onError) {
          mergedConfig.onError(error);
          resolve(null);
        } else {
          reject(error);
        }
      }

      relayRuntime.commitMutation(resolvedEnvironment, __assign(__assign({}, mergedConfig), {
        mutation: mutation,
        variables: mergedConfig.variables,
        onCompleted: function (response, errors) {
          if (errors) {
            // FIXME: This isn't right. onError expects a single error.
            handleError(errors);
            return;
          }

          if (isMounted()) {
            setState({
              loading: false,
              data: response,
              error: null
            });
          }

          if (mergedConfig.onCompleted) {
            mergedConfig.onCompleted(response);
          }

          resolve(response);
        },
        onError: handleError
      }));
    });
  }, [resolvedEnvironment, configs, mutation, variables, uploadables, onCompleted, onError, optimisticUpdater, optimisticResponse, updater, isMounted]);
  return [mutate, state];
}

function useSubscription(config, opts) {
  var environment = useRelayEnvironment();
  var skip = opts && opts.skip;
  React.useEffect(function () {
    if (skip) {
      return;
    }

    var dispose = relayRuntime.requestSubscription(environment, config).dispose;
    return dispose;
  }, [environment, config, skip]);
}

function usePagination(fragmentNode, fragmentRef) {
  var data = useOssFragment(fragmentNode, fragmentRef, false, PAGINATION_NAME)[0];
  return data;
}
function usePaginationFragment(fragmentNode, fragmentRef) {
  var data = useOssFragment(fragmentNode, fragmentRef, true, PAGINATION_NAME)[0];
  return data;
}
function usePaginationSubscription(fragmentNode, fragmentRef, callback) {
  useOssFragment(fragmentNode, fragmentRef, false, PAGINATION_NAME, callback);
}

function useRefetchable(fragmentInput, fragmentRef) {
  var data = useOssFragment(fragmentInput, fragmentRef, false, REFETCHABLE_NAME)[0];
  return data;
}
function useRefetchableFragment(fragmentInput, fragmentRef) {
  var data = useOssFragment(fragmentInput, fragmentRef, true, REFETCHABLE_NAME)[0];
  return data;
}
function useRefetchableSubscription(fragmentInput, fragmentRef, callback) {
  useOssFragment(fragmentInput, fragmentRef, false, REFETCHABLE_NAME, callback);
}

var RelayEnvironmentProvider = function (props) {
  var context = React__default.useMemo(function () {
    return {
      environment: props.environment
    };
  }, [props.environment]);
  return React__default.createElement(ReactRelayContext.Provider, {
    value: context
  }, props.children);
};

Object.defineProperty(exports, 'applyOptimisticMutation', {
enumerable: true,
get: function () {
return relayRuntime.applyOptimisticMutation;
}
});
Object.defineProperty(exports, 'commitLocalUpdate', {
enumerable: true,
get: function () {
return relayRuntime.commitLocalUpdate;
}
});
Object.defineProperty(exports, 'commitMutation', {
enumerable: true,
get: function () {
return relayRuntime.commitMutation;
}
});
Object.defineProperty(exports, 'fetchQuery', {
enumerable: true,
get: function () {
return relayRuntime.fetchQuery;
}
});
Object.defineProperty(exports, 'graphql', {
enumerable: true,
get: function () {
return relayRuntime.graphql;
}
});
Object.defineProperty(exports, 'requestSubscription', {
enumerable: true,
get: function () {
return relayRuntime.requestSubscription;
}
});
exports.FORWARD = FORWARD;
exports.FRAGMENT_NAME = FRAGMENT_NAME;
exports.NETWORK_ONLY = NETWORK_ONLY;
exports.PAGINATION_NAME = PAGINATION_NAME;
exports.REFETCHABLE_NAME = REFETCHABLE_NAME;
exports.ReactRelayContext = ReactRelayContext;
exports.RelayEnvironmentProvider = RelayEnvironmentProvider;
exports.STORE_ONLY = STORE_ONLY;
exports.STORE_OR_NETWORK = STORE_OR_NETWORK;
exports.STORE_THEN_NETWORK = STORE_THEN_NETWORK;
exports.loadLazyQuery = loadLazyQuery;
exports.loadQuery = loadQuery;
exports.useFragment = useFragment;
exports.useFragmentSubscription = useFragmentSubscription;
exports.useLazyLoadQuery = useLazyLoadQuery;
exports.useMutation = useMutation;
exports.useOssFragment = useOssFragment;
exports.usePagination = usePagination;
exports.usePaginationFragment = usePaginationFragment;
exports.usePaginationSubscription = usePaginationSubscription;
exports.usePreloadedQuery = usePreloadedQuery;
exports.useQuery = useQuery;
exports.useRefetchable = useRefetchable;
exports.useRefetchableFragment = useRefetchableFragment;
exports.useRefetchableSubscription = useRefetchableSubscription;
exports.useRelayEnvironment = useRelayEnvironment;
exports.useSubscription = useSubscription;
exports.useSuspenseFragment = useSuspenseFragment;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=relay-hooks.js.map
