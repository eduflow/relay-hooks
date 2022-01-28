import { GraphQLSubscriptionConfig, OperationType } from 'relay-runtime';
import { SkipGraphQLSubscriptionConfig, SkipSubscriptionConfig, SubscriptionConfig } from './RelayHooksTypes';
export declare function useSubscription<TSubscriptionPayload extends OperationType = OperationType>(config: GraphQLSubscriptionConfig<TSubscriptionPayload>, opts?: SubscriptionConfig): void;
export declare function useSubscription<TSubscriptionPayload extends OperationType = OperationType>(config: SkipGraphQLSubscriptionConfig<TSubscriptionPayload>, opts: SkipSubscriptionConfig): void;
