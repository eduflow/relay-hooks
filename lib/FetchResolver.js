"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var relay_runtime_1 = require("relay-runtime");

var Utils_1 = require("./Utils");

var fetchQuery = relay_runtime_1.__internal.fetchQuery;
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
    if (Utils_1.isStorePolicy(fetchPolicy)) {
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

    var isNetwork = Utils_1.isNetworkPolicy(fetchPolicy, full);

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

exports.fetchResolver = fetchResolver;