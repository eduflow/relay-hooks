"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var RelayHooksTypes_1 = require("./RelayHooksTypes");

var useOssFragment_1 = require("./useOssFragment");

function useFragment(fragmentNode, fragmentRef) {
  var data = useOssFragment_1.useOssFragment(fragmentNode, fragmentRef, false, RelayHooksTypes_1.FRAGMENT_NAME)[0];
  return data;
}

exports.useFragment = useFragment;

function useSuspenseFragment(fragmentNode, fragmentRef) {
  var data = useOssFragment_1.useOssFragment(fragmentNode, fragmentRef, true, RelayHooksTypes_1.FRAGMENT_NAME)[0];
  return data;
}

exports.useSuspenseFragment = useSuspenseFragment;

function useFragmentSubscription(fragmentNode, fragmentRef, callback) {
  useOssFragment_1.useOssFragment(fragmentNode, fragmentRef, false, RelayHooksTypes_1.FRAGMENT_NAME, callback);
}

exports.useFragmentSubscription = useFragmentSubscription;