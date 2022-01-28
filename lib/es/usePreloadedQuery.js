import { useEffect } from 'react';
import { useForceUpdate } from './useForceUpdate';
import { useRelayEnvironment } from './useRelayEnvironment';
export var usePreloadedQuery = function (loadQuery) {
  var forceUpdate = useForceUpdate();
  var environment = useRelayEnvironment();
  useEffect(function () {
    return loadQuery.subscribe(forceUpdate); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadQuery]);
  return loadQuery.getValue(environment);
};