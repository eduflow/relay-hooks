import { Environment, MutationParameters } from 'relay-runtime';
import { MutationNode, MutationConfig, MutationConfigWithoutVariables, MutationState, Mutate, MutateWithVariables } from './RelayHooksTypes';
export declare function useMutation<T extends MutationParameters>(mutation: MutationNode<T>, userConfig?: MutationConfigWithoutVariables<T>, 
/** if not provided, the context environment will be used. */
environment?: Environment): [MutateWithVariables<T>, MutationState<T>];
export declare function useMutation<T extends MutationParameters>(mutation: MutationNode<T>, userConfig?: MutationConfig<T>, 
/** if not provided, the context environment will be used. */
environment?: Environment): [Mutate<T>, MutationState<T>];
