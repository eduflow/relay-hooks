import { useEffect } from 'react';
import { requestSubscription } from 'relay-runtime';
import { useRelayEnvironment } from './useRelayEnvironment';
export function useSubscription(config, opts) {
  var environment = useRelayEnvironment();
  var skip = opts && opts.skip;
  useEffect(function () {
    if (skip) {
      return;
    }

    var dispose = requestSubscription(environment, config).dispose;
    return dispose;
  }, [environment, config, skip]);
}