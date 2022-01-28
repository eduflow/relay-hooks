import { OperationType } from 'relay-runtime';
import { RenderProps, LoadQuery } from './RelayHooksTypes';
export declare const usePreloadedQuery: <TOperationType extends OperationType = OperationType>(loadQuery: LoadQuery<OperationType, import("relay-runtime").IEnvironment>) => RenderProps<TOperationType>;
