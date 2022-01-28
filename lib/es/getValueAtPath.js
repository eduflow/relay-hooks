import invariant from 'fbjs/lib/invariant';
export function getValueAtPath(data, path) {
  var result = data;

  for (var _i = 0, path_1 = path; _i < path_1.length; _i++) {
    var key = path_1[_i];

    if (result == null) {
      return null;
    }

    if (typeof key === 'number') {
      !Array.isArray(result) ? process.env.NODE_ENV !== "production" ? !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: Expected an array when extracting value at path. ' + "If you're seeing this, this is likely a bug in Relay.") : invariant(false) : void 0 : !false ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0 : void 0;
      result = result[key];
    } else {
      !(typeof result === 'object' && !Array.isArray(result)) ? process.env.NODE_ENV !== "production" ? !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: Expected an object when extracting value at path. ' + "If you're seeing this, this is likely a bug in Relay.") : invariant(false) : void 0 : !false ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0 : void 0;
      result = result[key];
    }
  }

  return result;
}