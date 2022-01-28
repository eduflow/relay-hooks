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

Object.defineProperty(exports, "__esModule", {
  value: true
});

var invariant = require("fbjs/lib/invariant");

var getRefetchMetadata_1 = require("./getRefetchMetadata");

function getPaginationMetadata(fragmentNode, componentDisplayName) {
  var _a, _b;

  var _c = getRefetchMetadata_1.getRefetchMetadata(fragmentNode, componentDisplayName),
      paginationRequest = _c.refetchableRequest,
      refetchMetadata = _c.refetchMetadata;

  var paginationMetadata = refetchMetadata.connection;
  !(paginationMetadata != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: getPaginationMetadata(): Expected fragment `%s` to include a ' + 'connection when using `%s`. Did you forget to add a @connection ' + 'directive to the connection field in the fragment?', componentDisplayName, fragmentNode.name) : invariant(false) : void 0;
  var connectionPathInFragmentData = paginationMetadata.path;
  var connectionMetadata = ((_b = (_a = fragmentNode.metadata) === null || _a === void 0 ? void 0 : _a.connection) !== null && _b !== void 0 ? _b : [])[0];
  !(connectionMetadata != null) ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: getPaginationMetadata(): Expected fragment `%s` to include a ' + 'connection when using `%s`. Did you forget to add a @connection ' + 'directive to the connection field in the fragment?', componentDisplayName, fragmentNode.name) : invariant(false) : void 0;
  var identifierField = refetchMetadata.identifierField;
  !(identifierField == null || typeof identifierField === 'string') ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: getRefetchMetadata(): Expected `identifierField` to be a string.') : invariant(false) : void 0;
  return {
    connectionPathInFragmentData: connectionPathInFragmentData,
    identifierField: identifierField,
    paginationRequest: paginationRequest,
    paginationMetadata: paginationMetadata,
    stream: connectionMetadata.stream === true
  };
}

exports.getPaginationMetadata = getPaginationMetadata;