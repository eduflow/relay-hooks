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
import { ConcreteRequest, ReaderFragment, ReaderRefetchMetadata } from 'relay-runtime';
export declare function getRefetchMetadata(fragmentNode: ReaderFragment, componentDisplayName: string): {
    fragmentRefPathInResponse: ReadonlyArray<string | number>;
    identifierField: string | null;
    refetchableRequest: ConcreteRequest;
    refetchMetadata: ReaderRefetchMetadata;
};
