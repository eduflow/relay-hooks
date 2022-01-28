import { GraphQLTaggedNode } from 'relay-runtime';
import { FragmentNames } from './RelayHooksTypes';
export declare function useOssFragment(fragmentNode: GraphQLTaggedNode, fragmentRef: any | null, suspense: boolean, name: FragmentNames, subscribeResolve?: (data: any) => void): any;
