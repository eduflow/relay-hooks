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

import invariant from 'fbjs/lib/invariant';
import warning from 'fbjs/lib/warning';
export function getPaginationVariables(direction, count, cursor, baseVariables, extraVariables, paginationMetadata) {
  var _a, _b;

  var backwardMetadata = paginationMetadata.backward,
      forwardMetadata = paginationMetadata.forward;

  if (direction === 'backward') {
    !(backwardMetadata != null && backwardMetadata.count != null && backwardMetadata.cursor != null) ? process.env.NODE_ENV !== "production" ? !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: Expected backward pagination metadata to be available. ' + "If you're seeing this, this is likely a bug in Relay.") : invariant(false) : void 0 : !false ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0 : void 0;
    process.env.NODE_ENV !== "production" ? process.env.NODE_ENV !== "production" ? warning(!extraVariables.hasOwnProperty(backwardMetadata.cursor), 'Relay: `UNSTABLE_extraVariables` provided by caller should not ' + 'contain cursor variable `%s`. This variable is automatically ' + 'determined by Relay.', backwardMetadata.cursor) : void 0 : void 0;
    process.env.NODE_ENV !== "production" ? process.env.NODE_ENV !== "production" ? warning(!extraVariables.hasOwnProperty(backwardMetadata.count), 'Relay: `UNSTABLE_extraVariables` provided by caller should not ' + 'contain count variable `%s`. This variable is automatically ' + 'determined by Relay.', backwardMetadata.count) : void 0 : void 0;

    var paginationVariables_1 = __assign(__assign(__assign({}, baseVariables), extraVariables), (_a = {}, _a[backwardMetadata.cursor] = cursor, _a[backwardMetadata.count] = count, _a));

    if (forwardMetadata && forwardMetadata.cursor) {
      paginationVariables_1[forwardMetadata.cursor] = null;
    }

    if (forwardMetadata && forwardMetadata.count) {
      paginationVariables_1[forwardMetadata.count] = null;
    }

    return paginationVariables_1;
  }

  !(forwardMetadata != null && forwardMetadata.count != null && forwardMetadata.cursor != null) ? process.env.NODE_ENV !== "production" ? !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: Expected forward pagination metadata to be available. ' + "If you're seeing this, this is likely a bug in Relay.") : invariant(false) : void 0 : !false ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0 : void 0;
  process.env.NODE_ENV !== "production" ? process.env.NODE_ENV !== "production" ? warning(!extraVariables.hasOwnProperty(forwardMetadata.cursor), 'Relay: `UNSTABLE_extraVariables` provided by caller should not ' + 'contain cursor variable `%s`. This variable is automatically ' + 'determined by Relay.', forwardMetadata.cursor) : void 0 : void 0;
  process.env.NODE_ENV !== "production" ? process.env.NODE_ENV !== "production" ? warning(!extraVariables.hasOwnProperty(forwardMetadata.count), 'Relay: `UNSTABLE_extraVariables` provided by caller should not ' + 'contain count variable `%s`. This variable is automatically ' + 'determined by Relay.', forwardMetadata.count) : void 0 : void 0;

  var paginationVariables = __assign(__assign(__assign({}, baseVariables), extraVariables), (_b = {}, _b[forwardMetadata.cursor] = cursor, _b[forwardMetadata.count] = count, _b));

  if (backwardMetadata && backwardMetadata.cursor) {
    paginationVariables[backwardMetadata.cursor] = null;
  }

  if (backwardMetadata && backwardMetadata.count) {
    paginationVariables[backwardMetadata.count] = null;
  }

  return paginationVariables;
}