"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var RelayHooksTypes_1 = require("./RelayHooksTypes");

var useOssFragment_1 = require("./useOssFragment");

function useRefetchable(fragmentInput, fragmentRef) {
  var data = useOssFragment_1.useOssFragment(fragmentInput, fragmentRef, false, RelayHooksTypes_1.REFETCHABLE_NAME)[0];
  return data;
}

exports.useRefetchable = useRefetchable;

function useRefetchableFragment(fragmentInput, fragmentRef) {
  var data = useOssFragment_1.useOssFragment(fragmentInput, fragmentRef, true, RelayHooksTypes_1.REFETCHABLE_NAME)[0];
  return data;
}

exports.useRefetchableFragment = useRefetchableFragment;

function useRefetchableSubscription(fragmentInput, fragmentRef, callback) {
  useOssFragment_1.useOssFragment(fragmentInput, fragmentRef, false, RelayHooksTypes_1.REFETCHABLE_NAME, callback);
}

exports.useRefetchableSubscription = useRefetchableSubscription;