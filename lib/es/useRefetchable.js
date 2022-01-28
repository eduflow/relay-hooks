import { REFETCHABLE_NAME } from './RelayHooksTypes';
import { useOssFragment } from './useOssFragment';
export function useRefetchable(fragmentInput, fragmentRef) {
  var data = useOssFragment(fragmentInput, fragmentRef, false, REFETCHABLE_NAME)[0];
  return data;
}
export function useRefetchableFragment(fragmentInput, fragmentRef) {
  var data = useOssFragment(fragmentInput, fragmentRef, true, REFETCHABLE_NAME)[0];
  return data;
}
export function useRefetchableSubscription(fragmentInput, fragmentRef, callback) {
  useOssFragment(fragmentInput, fragmentRef, false, REFETCHABLE_NAME, callback);
}