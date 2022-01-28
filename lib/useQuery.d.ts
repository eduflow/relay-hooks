import { GraphQLTaggedNode, OperationType } from 'relay-runtime';
import { RenderProps, QueryOptions } from './RelayHooksTypes';
export declare const useQuery: <TOperationType extends OperationType = OperationType>(gqlQuery: GraphQLTaggedNode, variables?: TOperationType["variables"], options?: QueryOptions) => RenderProps<TOperationType>;
export declare const useLazyLoadQuery: <TOperationType extends OperationType = OperationType>(gqlQuery: GraphQLTaggedNode, variables?: TOperationType["variables"], options?: QueryOptions) => RenderProps<TOperationType>;
