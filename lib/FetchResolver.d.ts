import { Disposable, FetchPolicy, OperationDescriptor, IEnvironment, Snapshot, RenderPolicy } from 'relay-runtime';
export declare type Fetcher = {
    fetch: (environment: IEnvironment, operation: OperationDescriptor, fetchPolicy: FetchPolicy | null | undefined, onComplete: (_e: Error | null) => void, onNext: (operation: OperationDescriptor, snapshot: Snapshot, fromStore?: boolean, onlyStore?: boolean) => void, renderPolicy?: RenderPolicy) => Disposable;
    getData: () => {
        isLoading: boolean;
        error?: Error | null;
    };
    dispose: () => void;
    checkAndSuspense: (suspense: boolean, useLazy?: boolean) => Promise<any> | Error | null;
};
export declare function fetchResolver({ setLoading, doRetain, disposeTemporary, }: {
    doRetain?: boolean;
    setLoading?: (loading: boolean) => void;
    disposeTemporary?: () => void;
}): Fetcher;
