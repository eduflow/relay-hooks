import { ReaderFragment } from 'relay-runtime';
export declare function getStateFromConnection(direction: string, fragmentNode: ReaderFragment, connection: any | null): {
    cursor: string | null;
    hasMore: boolean;
};
export declare function getConnectionState(direction: string, fragmentNode: ReaderFragment, fragmentData: any, connectionPathInFragmentData: ReadonlyArray<string | number>): {
    cursor: string | null;
    hasMore: boolean;
};
