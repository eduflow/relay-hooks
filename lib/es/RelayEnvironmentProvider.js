import React from 'react';
import { ReactRelayContext } from './ReactRelayContext'; // eslint-disable-line @typescript-eslint/no-unused-vars

export var RelayEnvironmentProvider = function (props) {
  var context = React.useMemo(function () {
    return {
      environment: props.environment
    };
  }, [props.environment]);
  return React.createElement(ReactRelayContext.Provider, {
    value: context
  }, props.children);
};