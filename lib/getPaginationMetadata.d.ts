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
import { ConcreteRequest, ReaderFragment, ReaderPaginationMetadata } from 'relay-runtime';
export declare function getPaginationMetadata(fragmentNode: ReaderFragment, componentDisplayName: string): {
    connectionPathInFragmentData: ReadonlyArray<string | number>;
    identifierField: string | null;
    paginationRequest: ConcreteRequest;
    paginationMetadata: ReaderPaginationMetadata;
    stream: boolean;
};
