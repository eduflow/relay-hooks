import { createOperationDescriptor, getRequest } from 'relay-runtime';
import { STORE_OR_NETWORK, STORE_THEN_NETWORK, NETWORK_ONLY } from './RelayHooksTypes';
export var isNetworkPolicy = function (policy, full) {
  return policy === NETWORK_ONLY || policy === STORE_THEN_NETWORK || policy === STORE_OR_NETWORK && !full;
};
export var isStorePolicy = function (policy) {
  return policy !== NETWORK_ONLY;
};
export var forceCache = {
  force: true
}; // Fetcher

export function createOperation(gqlQuery, variables, cacheConfig) {
  return createOperationDescriptor(getRequest(gqlQuery), variables, cacheConfig);
}