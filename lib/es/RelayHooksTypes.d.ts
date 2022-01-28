import { Disposable, OperationType, CacheConfig, GraphQLTaggedNode, IEnvironment, MutationConfig as BaseMutationConfig, MutationParameters, FragmentSpecResolver, VariablesOf, FragmentReference, RenderPolicy, GraphQLSubscriptionConfig } from 'relay-runtime';
export declare type MutationState<T extends MutationParameters> = {
    loading: boolean;
    data: T['response'] | null;
    error?: Error | null;
};
export declare type MutationNode<T extends MutationParameters> = BaseMutationConfig<T>['mutation'];
export declare type MutationConfig<T extends MutationParameters> = Partial<Omit<BaseMutationConfig<T>, 'mutation' | 'onCompleted'>> & {
    onCompleted?(response: T['response']): void;
};
export declare type MutationConfigWithoutVariables<T extends MutationParameters> = Omit<MutationConfig<T>, 'variables'>;
export declare type Mutate<T extends MutationParameters> = (config?: Partial<MutationConfig<T>>) => Promise<T['response']>;
export declare type MutateWithVariables<T extends MutationParameters> = (config: Partial<MutationConfig<T>> & {
    variables: T['variables'];
}) => Promise<T['response']>;
export declare const NETWORK_ONLY = "network-only";
export declare const STORE_THEN_NETWORK = "store-and-network";
export declare const STORE_OR_NETWORK = "store-or-network";
export declare const STORE_ONLY = "store-only";
export declare const PAGINATION_NAME = "usePagination";
export declare const REFETCHABLE_NAME = "useRefetchable";
export declare const FRAGMENT_NAME = "useFragment";
export declare type FragmentNames = typeof PAGINATION_NAME | typeof REFETCHABLE_NAME | typeof FRAGMENT_NAME;
export declare type FetchPolicy = typeof STORE_ONLY | typeof STORE_OR_NETWORK | typeof STORE_THEN_NETWORK | typeof NETWORK_ONLY;
export declare type ContainerResult = {
    data: {
        [key: string]: any;
    };
    resolver: FragmentSpecResolver;
};
export interface RenderProps<T extends OperationType> {
    error: Error | null;
    data: T['response'] | null | undefined;
    retry: (_cacheConfigOverride?: CacheConfig, options?: Options) => void;
    isLoading: boolean;
}
export declare type QueryOptions = {
    fetchPolicy?: FetchPolicy;
    fetchKey?: string | number;
    networkCacheConfig?: CacheConfig;
    skip?: boolean;
    onComplete?: (_e: Error | null) => void;
    UNSTABLE_renderPolicy?: RenderPolicy;
};
export declare type $Call<Fn extends (...args: any[]) => any> = Fn extends (arg: any) => infer RT ? RT : never;
export declare type KeyType<TData = unknown> = Readonly<{
    ' $data'?: TData;
    ' $fragmentRefs': FragmentReference;
}>;
export declare type ArrayKeyType = ReadonlyArray<{
    readonly ' $data'?: ReadonlyArray<unknown>;
} | null>;
export declare type KeyTypeData<TKey extends KeyType<TData>, TData = unknown> = Required<TKey>[' $data'];
export declare type KeyReturnType<T extends KeyType> = (arg: T) => NonNullable<T[' $data']>;
export declare type ArrayKeyReturnType<T extends ArrayKeyType> = (arg: T) => NonNullable<NonNullable<T[0]>[' $data']>[0];
export declare type LoadMoreFn<TQuery extends OperationType = OperationType> = (count: number, options?: OptionsLoadMore<TQuery>) => Disposable;
export declare const FORWARD = "forward";
export declare type LoadQuery<TOperationType extends OperationType = OperationType, TEnvironment extends IEnvironment = IEnvironment> = {
    next: (environment: TEnvironment, gqlQuery: GraphQLTaggedNode, variables?: TOperationType['variables'], options?: QueryOptions) => Promise<void>;
    subscribe: (callback: () => any) => () => void;
    getValue: (environment?: TEnvironment) => RenderProps<TOperationType> | Promise<any>;
    dispose: () => void;
};
export interface Options {
    fetchPolicy?: FetchPolicy;
    onComplete?: (arg: Error | null) => void;
    UNSTABLE_renderPolicy?: RenderPolicy;
}
export interface OptionsLoadMore<TQuery extends OperationType = OperationType> {
    onComplete?: (arg: Error | null) => void;
    UNSTABLE_extraVariables?: VariablesOf<TQuery>;
}
export declare type RefetchFnDynamic<TQuery extends OperationType, TKey extends KeyType | null, TOptions = Options> = RefetchInexactDynamicResponse<TQuery, TOptions> & RefetchExactDynamicResponse<TQuery, TOptions>;
export declare type RefetchInexact<TQuery extends OperationType, TOptions> = (data?: unknown) => RefetchFnInexact<TQuery, TOptions>;
export declare type RefetchInexactDynamicResponse<TQuery extends OperationType, TOptions> = ReturnType<RefetchInexact<TQuery, TOptions>>;
export declare type RefetchExact<TQuery extends OperationType, TOptions> = (data?: unknown | null) => RefetchFnExact<TQuery, TOptions>;
export declare type RefetchExactDynamicResponse<TQuery extends OperationType, TOptions> = ReturnType<RefetchExact<TQuery, TOptions>>;
export declare type RefetchFnBase<TVars, TOptions> = (vars: TVars, options?: TOptions) => Disposable;
export declare type RefetchFnExact<TQuery extends OperationType, TOptions = Options> = RefetchFnBase<VariablesOf<TQuery>, TOptions>;
export declare type RefetchFnInexact<TQuery extends OperationType, TOptions = Options> = RefetchFnBase<Partial<VariablesOf<TQuery>>, TOptions>;
export interface ReturnTypeRefetchNode<TQuery extends OperationType, TKey extends KeyType | null, TFragmentData> extends ReturnTypeRefetchSuspenseNode<TQuery, TKey, TFragmentData> {
    isLoading: boolean;
    error: Error | null;
}
export declare type ReturnTypeRefetchSuspenseNode<TQuery extends OperationType, TKey extends KeyType | null, TFragmentData> = {
    data: TFragmentData;
    refetch: RefetchFnDynamic<TQuery, TKey>;
};
export interface ReturnTypePagination<TQuery extends OperationType, TKey extends KeyType | null, TFragmentData> extends ReturnTypePaginationSuspense<TQuery, TKey, TFragmentData> {
    isLoading: boolean;
    error: Error | null;
}
export interface ReturnTypePaginationSuspense<TQuery extends OperationType, TKey extends KeyType | null, TFragmentData> {
    data: TFragmentData;
    loadNext: LoadMoreFn<TQuery>;
    loadPrevious: LoadMoreFn<TQuery>;
    hasNext: boolean;
    hasPrevious: boolean;
    isLoadingNext: boolean;
    isLoadingPrevious: boolean;
    errorNext: Error | null;
    errorPrevious: Error | null;
    refetch: RefetchFnDynamic<TQuery, TKey>;
}
export declare type SubscriptionConfig = {
    skip?: boolean;
};
export declare type SkipSubscriptionConfig = {
    skip: true;
};
export interface SkipGraphQLSubscriptionConfig<TSubscription extends OperationType> extends Omit<GraphQLSubscriptionConfig<TSubscription>, 'variables' | 'subscription'> {
    subscription?: GraphQLSubscriptionConfig<TSubscription>['subscription'];
    variables?: TSubscription['variables'];
}
