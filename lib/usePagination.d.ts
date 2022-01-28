import { GraphQLTaggedNode, OperationType } from 'relay-runtime';
import { KeyType, KeyTypeData, ReturnTypePagination, ReturnTypePaginationSuspense } from './RelayHooksTypes';
export declare function usePagination<TQuery extends OperationType, TKey extends KeyType>(fragmentNode: GraphQLTaggedNode, fragmentRef: TKey): ReturnTypePagination<TQuery, TKey, KeyTypeData<TKey>>;
export declare function usePaginationFragment<TQuery extends OperationType, TKey extends KeyType>(fragmentNode: GraphQLTaggedNode, fragmentRef: TKey): ReturnTypePaginationSuspense<TQuery, TKey, KeyTypeData<TKey>>;
export declare function usePaginationSubscription<TQuery extends OperationType, TKey extends KeyType>(fragmentNode: GraphQLTaggedNode, fragmentRef: TKey, callback: (data: ReturnTypePagination<TQuery, TKey, KeyTypeData<TKey>>) => void): void;
