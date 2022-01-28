import { OperationType, IEnvironment } from 'relay-runtime';
import { LoadQuery } from './RelayHooksTypes';
export declare const internalLoadQuery: <TOperationType extends OperationType = OperationType>(promise?: boolean) => LoadQuery<TOperationType, IEnvironment>;
export declare const loadLazyQuery: <TOperationType extends OperationType = OperationType>() => LoadQuery<TOperationType, IEnvironment>;
export declare const loadQuery: <TOperationType extends OperationType = OperationType>() => LoadQuery<TOperationType, IEnvironment>;
