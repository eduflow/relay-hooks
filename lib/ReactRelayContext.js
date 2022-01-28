/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var React = require("react");

var relay_runtime_1 = require("relay-runtime");

var createRelayContext = relay_runtime_1.__internal.createRelayContext;
exports.ReactRelayContext = createRelayContext(React);