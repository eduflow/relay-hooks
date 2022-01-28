import { PAGINATION_NAME } from './RelayHooksTypes';
import { useOssFragment } from './useOssFragment';
export function usePagination(fragmentNode, fragmentRef) {
  var data = useOssFragment(fragmentNode, fragmentRef, false, PAGINATION_NAME)[0];
  return data;
}
export function usePaginationFragment(fragmentNode, fragmentRef) {
  var data = useOssFragment(fragmentNode, fragmentRef, true, PAGINATION_NAME)[0];
  return data;
}
export function usePaginationSubscription(fragmentNode, fragmentRef, callback) {
  useOssFragment(fragmentNode, fragmentRef, false, PAGINATION_NAME, callback);
}