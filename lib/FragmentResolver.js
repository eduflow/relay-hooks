"use strict";

var __assign = this && this.__assign || function () {
  __assign = Object.assign || function (t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];

      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }

    return t;
  };

  return __assign.apply(this, arguments);
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

var areEqual = require("fbjs/lib/areEqual");

var invariant = require("fbjs/lib/invariant");

var warning = require("fbjs/lib/warning");

var relay_runtime_1 = require("relay-runtime");

var FetchResolver_1 = require("./FetchResolver");

var getConnectionState_1 = require("./getConnectionState");

var getPaginationMetadata_1 = require("./getPaginationMetadata");

var getPaginationVariables_1 = require("./getPaginationVariables");

var getRefetchMetadata_1 = require("./getRefetchMetadata");

var getValueAtPath_1 = require("./getValueAtPath");

var RelayHooksTypes_1 = require("./RelayHooksTypes");

var Utils_1 = require("./Utils");

var getPromiseForActiveRequest = relay_runtime_1.__internal.getPromiseForActiveRequest;

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
        process.env.NODE_ENV !== "production" ? warning(false, 'Relay: Unexpected call to `refetch` on unmounted component for fragment ' + '`%s` in `%s`. It looks like some instances of your component are ' + 'still trying to fetch data but they already unmounted. ' + 'Please make sure you clear all timers, intervals, ' + 'async calls, etc that may trigger a fetch.', _this._fragment.name, _this.name) : void 0;
        return {
          dispose: function () {}
        };
      }

      if (_this._selector == null) {
        process.env.NODE_ENV !== "production" ? warning(false, 'Relay: Unexpected call to `refetch` while using a null fragment ref ' + 'for fragment `%s` in `%s`. When calling `refetch`, we expect ' + "initial fragment data to be non-null. Please make sure you're " + 'passing a valid fragment ref to `%s` before calling ' + '`refetch`, or make sure you pass all required variables to `refetch`.', _this._fragment.name, _this.name, _this.name) : void 0;
      }

      var _e = getRefetchMetadata_1.getRefetchMetadata(_this._fragment, _this.name),
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
          process.env.NODE_ENV !== "production" ? warning(false, 'Relay: Expected result to have a string  ' + '`%s` in order to refetch, got `%s`.', identifierField, identifierValue) : void 0;
        }

        refetchVariables.id = identifierValue;
      }

      var onNext = function (operation, snapshot) {
        var fragmentRef = getValueAtPath_1.getValueAtPath(snapshot.data, fragmentRefPathInResponse);

        var isEquals = _this.isEqualsFragmentRef(_this._fragmentRefRefetch || _this._fragmentRef, fragmentRef);

        var missData = isMissingData(snapshot); //fromStore && isMissingData(snapshot);

        if (!isEquals || missData) {
          _this._fragmentRefRefetch = fragmentRef;
          _this._idfragmentrefetch = relay_runtime_1.getFragmentIdentifier(_this._fragment, fragmentRef);

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

      var operation = Utils_1.createOperation(refetchableRequest, refetchVariables, Utils_1.forceCache);
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
        process.env.NODE_ENV !== "production" ? warning(false, 'Relay: Unexpected fetch on unmounted component for fragment ' + '`%s` in `%s`. It looks like some instances of your component are ' + 'still trying to fetch data but they already unmounted. ' + 'Please make sure you clear all timers, intervals, ' + 'async calls, etc that may trigger a fetch.', _this._fragment.name, _this.name) : void 0;
        return {
          dispose: function () {}
        };
      }

      if (_this._selector == null) {
        process.env.NODE_ENV !== "production" ? warning(false, 'Relay: Unexpected fetch while using a null fragment ref ' + 'for fragment `%s` in `%s`. When fetching more items, we expect ' + "initial fragment data to be non-null. Please make sure you're " + 'passing a valid fragment ref to `%s` before paginating.', _this._fragment.name, _this.name, _this.name) : void 0;
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

      !(_this._selector != null && _this._selector.kind !== 'PluralReaderSelector') ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: Expected to be able to find a non-plural fragment owner for ' + "fragment `%s` when using `%s`. If you're seeing this, " + 'this is likely a bug in Relay.', _this._fragment.name, _this.name) : invariant(false) : void 0;

      var _b = getPaginationMetadata_1.getPaginationMetadata(_this._fragment, _this.name),
          paginationRequest = _b.paginationRequest,
          paginationMetadata = _b.paginationMetadata,
          identifierField = _b.identifierField,
          connectionPathInFragmentData = _b.connectionPathInFragmentData;

      var identifierValue = identifierField != null && fragmentData != null && typeof fragmentData === 'object' ? fragmentData[identifierField] : null;
      var parentVariables = _this._selector.owner.variables;
      var fragmentVariables = _this._selector.variables;
      var extraVariables = options === null || options === void 0 ? void 0 : options.UNSTABLE_extraVariables;

      var baseVariables = __assign(__assign({}, parentVariables), fragmentVariables);

      var cursor = getConnectionState_1.getConnectionState(direction, _this._fragment, fragmentData, connectionPathInFragmentData).cursor;
      var paginationVariables = getPaginationVariables_1.getPaginationVariables(direction, count, cursor, baseVariables, __assign({}, extraVariables), paginationMetadata); // If the query needs an identifier value ('id' or similar) and one
      // was not explicitly provided, read it from the fragment data.

      if (identifierField != null) {
        // @refetchable fragments are guaranteed to have an `id` selection
        // if the type is Node, implements Node, or is @fetchable. Double-check
        // that there actually is a value at runtime.
        if (typeof identifierValue !== 'string') {
          process.env.NODE_ENV !== "production" ? warning(false, 'Relay: Expected result to have a string  ' + '`%s` in order to refetch, got `%s`.', identifierField, identifierValue) : void 0;
        }

        paginationVariables.id = identifierValue;
      }

      var onNext = function () {};

      var operation = Utils_1.createOperation(paginationRequest, paginationVariables, Utils_1.forceCache);
      return fetcher.fetch(_this._environment, operation, undefined, //options?.fetchPolicy,
      onComplete, onNext);
    };

    this.name = name;
    this.pagination = name === RelayHooksTypes_1.PAGINATION_NAME;
    this.refetchable = name === RelayHooksTypes_1.REFETCHABLE_NAME || this.pagination;

    var setLoading = function (_loading) {
      return _this.refreshHooks();
    };

    if (this.refetchable) {
      this.fetcherRefecth = FetchResolver_1.fetchResolver({
        setLoading: setLoading,
        doRetain: true
      });
    }

    if (this.pagination) {
      this.fetcherNext = FetchResolver_1.fetchResolver({
        setLoading: setLoading
      });
      this.fetcherPrevious = FetchResolver_1.fetchResolver({
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
      var prevIDs = relay_runtime_1.getDataIDsFromFragment(this._fragment, prevFragment);
      var nextIDs = relay_runtime_1.getDataIDsFromFragment(this._fragment, fragmentRef);

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

    return relay_runtime_1.getVariablesFromFragment(this._fragment, fRef);
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

    this._selector = relay_runtime_1.getSelector(fragment, fragmentRef);
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

      process.env.NODE_ENV !== "production" ? warning(false, 'Relay: Tried reading fragment `%s` declared in ' + '`%s`, but it has missing data and its parent query `%s` is not ' + 'being fetched.\n' + 'This might be fixed by by re-running the Relay Compiler. ' + ' Otherwise, make sure of the following:\n' + '* You are correctly fetching `%s` if you are using a ' + '"store-only" `fetchPolicy`.\n' + "* Other queries aren't accidentally fetching and overwriting " + 'the data for this fragment.\n' + '* Any related mutations or subscriptions are fetching all of ' + 'the data for this fragment.\n' + "* Any related store updaters aren't accidentally deleting " + 'data for this fragment.', this._fragment.name, this.name, parentQueryName, parentQueryName) : void 0;
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
        if ('production' !== process.env.NODE_ENV) {
          getRefetchMetadata_1.getRefetchMetadata(this._fragment, this.name);
        }

        this.result = {
          data: data,
          isLoading: isLoading,
          error: error,
          refetch: refetch
        };
      } else {
        // usePagination
        var connectionPathInFragmentData = getPaginationMetadata_1.getPaginationMetadata(this._fragment, this.name).connectionPathInFragmentData;
        var connection = getValueAtPath_1.getValueAtPath(data, connectionPathInFragmentData);
        var hasNext = getConnectionState_1.getStateFromConnection('forward', this._fragment, connection).hasMore;
        var hasPrevious = getConnectionState_1.getStateFromConnection('backward', this._fragment, connection).hasMore;

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

exports.FragmentResolver = FragmentResolver;