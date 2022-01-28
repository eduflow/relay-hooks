"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var warning = require("fbjs/lib/warning");

var react_1 = require("react");

var relay_runtime_1 = require("relay-runtime");

var FragmentResolver_1 = require("./FragmentResolver");

var useForceUpdate_1 = require("./useForceUpdate");

var useRelayEnvironment_1 = require("./useRelayEnvironment");

function useOssFragment(fragmentNode, fragmentRef, suspense, name, subscribeResolve) {
  var environment = useRelayEnvironment_1.useRelayEnvironment();
  var forceUpdate = useForceUpdate_1.useForceUpdate();
  var ref = react_1.useRef(null);

  if (ref.current === null || ref.current === undefined) {
    ref.current = {
      resolver: new FragmentResolver_1.FragmentResolver(name)
    };
  }

  var resolver = ref.current.resolver;
  react_1.useEffect(function () {
    return function () {
      ref.current.resolver.setUnmounted();
    };
  }, []);
  react_1.useEffect(function () {
    return function () {
      resolver.dispose();
    };
  }, [resolver]);
  var fragment = react_1.useMemo(function () {
    return relay_runtime_1.getFragment(fragmentNode);
  }, [fragmentNode]);
  var idfragment = react_1.useMemo(function () {
    return relay_runtime_1.getFragmentIdentifier(fragment, fragmentRef);
  }, [fragment, fragmentRef]);
  react_1.useEffect(function () {
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

  if ('production' !== process.env.NODE_ENV) {
    if (fragmentRef != null && (data === undefined || Array.isArray(data) && data.length > 0 && data.every(function (data) {
      return data === undefined;
    }))) {
      process.env.NODE_ENV !== "production" ? warning(false, 'Relay: Expected to have been able to read non-null data for ' + 'fragment `%s` declared in ' + '`%s`, since fragment reference was non-null. ' + "Make sure that that `%s`'s parent isn't " + 'holding on to and/or passing a fragment reference for data that ' + 'has been deleted.', fragment, name, name) : void 0;
    }
  }

  return [data, resolver];
}

exports.useOssFragment = useOssFragment;