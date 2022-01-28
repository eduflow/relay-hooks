import warning from 'fbjs/lib/warning';
import { useEffect, useRef, useMemo } from 'react';
import { getFragmentIdentifier, getFragment } from 'relay-runtime';
import { FragmentResolver } from './FragmentResolver';
import { useForceUpdate } from './useForceUpdate';
import { useRelayEnvironment } from './useRelayEnvironment';
export function useOssFragment(fragmentNode, fragmentRef, suspense, name, subscribeResolve) {
  var environment = useRelayEnvironment();
  var forceUpdate = useForceUpdate();
  var ref = useRef(null);

  if (ref.current === null || ref.current === undefined) {
    ref.current = {
      resolver: new FragmentResolver(name)
    };
  }

  var resolver = ref.current.resolver;
  useEffect(function () {
    return function () {
      ref.current.resolver.setUnmounted();
    };
  }, []);
  useEffect(function () {
    return function () {
      resolver.dispose();
    };
  }, [resolver]);
  var fragment = useMemo(function () {
    return getFragment(fragmentNode);
  }, [fragmentNode]);
  var idfragment = useMemo(function () {
    return getFragmentIdentifier(fragment, fragmentRef);
  }, [fragment, fragmentRef]);
  useEffect(function () {
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
      process.env.NODE_ENV !== "production" ? process.env.NODE_ENV !== "production" ? warning(false, 'Relay: Expected to have been able to read non-null data for ' + 'fragment `%s` declared in ' + '`%s`, since fragment reference was non-null. ' + "Make sure that that `%s`'s parent isn't " + 'holding on to and/or passing a fragment reference for data that ' + 'has been deleted.', fragment, name, name) : void 0 : void 0;
    }
  }

  return [data, resolver];
}