import { GraphQLTaggedNode, OperationType } from 'relay-runtime';
import { KeyType, KeyTypeData, ReturnTypeRefetchNode, ReturnTypeRefetchSuspenseNode } from './RelayHooksTypes';
export declare function useRefetchable<TQuery extends OperationType, TKey extends KeyType>(fragmentInput: GraphQLTaggedNode, fragmentRef: TKey): ReturnTypeRefetchNode<TQuery, TKey, KeyTypeData<TKey>>;
export declare function useRefetchableFragment<TQuery extends OperationType, TKey extends KeyType>(fragmentInput: GraphQLTaggedNode, fragmentRef: TKey): ReturnTypeRefetchSuspenseNode<TQuery, TKey, KeyTypeData<TKey>>;
export declare function useRefetchableSubscription<TQuery extends OperationType, TKey extends KeyType>(fragmentInput: GraphQLTaggedNode, fragmentRef: TKey, callback: (data: ReturnTypeRefetchNode<TQuery, TKey, KeyTypeData<TKey>>) => void): void;
