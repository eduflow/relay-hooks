import areEqual from 'fbjs/lib/areEqual';
import { fetchResolver } from './FetchResolver';
import { createOperation } from './Utils';
var defaultPolicy = 'network-only';
var cache = new Map();
export function getOrCreateQueryFetcher(useLazy, gqlQuery, variables, networkCacheConfig) {
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

export { QueryFetcher };