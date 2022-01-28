import { Variables, ConnectionMetadata, GraphQLTaggedNode, OperationDescriptor, CacheConfig } from 'relay-runtime';
import { FetchPolicy } from './RelayHooksTypes';
export declare type ReactConnectionMetadata = ConnectionMetadata & {
    fragmentName: string;
};
export declare const isNetworkPolicy: (policy: FetchPolicy, full: boolean) => boolean;
export declare const isStorePolicy: (policy: FetchPolicy) => boolean;
export declare const forceCache: {
    force: boolean;
};
export declare function createOperation(gqlQuery: GraphQLTaggedNode, variables: Variables, cacheConfig?: CacheConfig | null): OperationDescriptor;
