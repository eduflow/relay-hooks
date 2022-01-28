import { FRAGMENT_NAME } from './RelayHooksTypes';
import { useOssFragment } from './useOssFragment';
export function useFragment(fragmentNode, fragmentRef) {
  var data = useOssFragment(fragmentNode, fragmentRef, false, FRAGMENT_NAME)[0];
  return data;
}
export function useSuspenseFragment(fragmentNode, fragmentRef) {
  var data = useOssFragment(fragmentNode, fragmentRef, true, FRAGMENT_NAME)[0];
  return data;
}
export function useFragmentSubscription(fragmentNode, fragmentRef, callback) {
  useOssFragment(fragmentNode, fragmentRef, false, FRAGMENT_NAME, callback);
}