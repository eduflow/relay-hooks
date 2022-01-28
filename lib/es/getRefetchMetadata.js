/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */
// flowlint ambiguous-object-type:error
'use strict';

import invariant from 'fbjs/lib/invariant';
export function getRefetchMetadata(fragmentNode, componentDisplayName) {
  var _a, _b;

  !(((_a = fragmentNode.metadata) === null || _a === void 0 ? void 0 : _a.plural) !== true) ? process.env.NODE_ENV !== "production" ? !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: getRefetchMetadata(): Expected fragment `%s` not to be plural when using ' + '`%s`. Remove `@relay(plural: true)` from fragment `%s` ' + 'in order to use it with `%s`.', fragmentNode.name, componentDisplayName, fragmentNode.name, componentDisplayName) : invariant(false) : void 0 : !false ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0 : void 0;
  var refetchMetadata = (_b = fragmentNode.metadata) === null || _b === void 0 ? void 0 : _b.refetch;
  !(refetchMetadata != null) ? process.env.NODE_ENV !== "production" ? !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: getRefetchMetadata(): Expected fragment `%s` to be refetchable when using `%s`. ' + 'Did you forget to add a @refetchable directive to the fragment?', componentDisplayName, fragmentNode.name) : invariant(false) : void 0 : !false ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0 : void 0; // handle both commonjs and es modules

  var refetchableRequest = refetchMetadata.operation.default ? refetchMetadata.operation.default : refetchMetadata.operation;
  var fragmentRefPathInResponse = refetchMetadata.fragmentPathInResult;
  !(typeof refetchableRequest !== 'string') ? process.env.NODE_ENV !== "production" ? !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: getRefetchMetadata(): Expected refetch query to be an ' + "operation and not a string when using `%s`. If you're seeing this, " + 'this is likely a bug in Relay.', componentDisplayName) : invariant(false) : void 0 : !false ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0 : void 0;
  var identifierField = refetchMetadata.identifierField;
  !(identifierField == null || typeof identifierField === 'string') ? process.env.NODE_ENV !== "production" ? !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: getRefetchMetadata(): Expected `identifierField` to be a string.') : invariant(false) : void 0 : !false ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0 : void 0;
  return {
    fragmentRefPathInResponse: fragmentRefPathInResponse,
    identifierField: identifierField,
    refetchableRequest: refetchableRequest,
    refetchMetadata: refetchMetadata
  };
}