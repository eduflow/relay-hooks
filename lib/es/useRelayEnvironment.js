import React from 'react';
import { ReactRelayContext } from './ReactRelayContext';
export function useRelayEnvironment() {
  var environment = React.useContext(ReactRelayContext).environment;
  return environment;
}