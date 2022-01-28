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
import { ReaderPaginationMetadata, Variables } from 'relay-runtime';
export declare function getPaginationVariables(direction: 'forward' | 'backward', count: number, cursor: string | null, baseVariables: Variables, extraVariables: Variables, paginationMetadata: ReaderPaginationMetadata): {
    [key: string]: any;
};
