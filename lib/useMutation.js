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

var useMounted_1 = require("@restart/hooks/useMounted");

var invariant = require("fbjs/lib/invariant");

var React = require("react");

var relay_runtime_1 = require("relay-runtime");

var useRelayEnvironment_1 = require("./useRelayEnvironment");

var useCallback = React.useCallback,
    useState = React.useState;

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

  var isMounted = useMounted_1.default();
  var relayEnvironment = useRelayEnvironment_1.useRelayEnvironment();
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

    !mergedConfig.variables ? process.env.NODE_ENV !== "production" ? invariant(false, 'you must specify variables') : invariant(false) : void 0;

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

      relay_runtime_1.commitMutation(resolvedEnvironment, __assign(__assign({}, mergedConfig), {
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

exports.useMutation = useMutation;