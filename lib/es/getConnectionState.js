import invariant from 'fbjs/lib/invariant';
import { ConnectionInterface } from 'relay-runtime';
import { getValueAtPath } from './getValueAtPath';
export function getStateFromConnection(direction, fragmentNode, connection) {
  var _a, _b;

  if (connection == null) {
    return {
      cursor: null,
      hasMore: false
    };
  }

  var _c = ConnectionInterface.get(),
      EDGES = _c.EDGES,
      PAGE_INFO = _c.PAGE_INFO,
      HAS_NEXT_PAGE = _c.HAS_NEXT_PAGE,
      HAS_PREV_PAGE = _c.HAS_PREV_PAGE,
      END_CURSOR = _c.END_CURSOR,
      START_CURSOR = _c.START_CURSOR;

  !(typeof connection === 'object') ? process.env.NODE_ENV !== "production" ? !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: Expected connection in fragment `%s` to have been `null`, or ' + 'a plain object with %s and %s properties. Instead got `%s`.', fragmentNode.name, EDGES, PAGE_INFO, connection) : invariant(false) : void 0 : !false ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0 : void 0;
  var edges = connection[EDGES];
  var pageInfo = connection[PAGE_INFO];

  if (edges == null || pageInfo == null) {
    return {
      cursor: null,
      hasMore: false
    };
  }

  !Array.isArray(edges) ? process.env.NODE_ENV !== "production" ? !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: Expected connection in fragment `%s` to have a plural `%s` field. ' + 'Instead got `%s`.', fragmentNode.name, EDGES, edges) : invariant(false) : void 0 : !false ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0 : void 0;
  !(typeof pageInfo === 'object') ? process.env.NODE_ENV !== "production" ? !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: Expected connection in fragment `%s` to have a `%s` field. ' + 'Instead got `%s`.', fragmentNode.name, PAGE_INFO, pageInfo) : invariant(false) : void 0 : !false ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0 : void 0;
  var cursor = direction === 'forward' ? (_a = pageInfo[END_CURSOR]) !== null && _a !== void 0 ? _a : null : (_b = pageInfo[START_CURSOR]) !== null && _b !== void 0 ? _b : null;
  !(cursor === null || typeof cursor === 'string') ? process.env.NODE_ENV !== "production" ? !false ? process.env.NODE_ENV !== "production" ? invariant(false, 'Relay: Expected page info for connection in fragment `%s` to have a ' + 'valid `%s`. Instead got `%s`.', fragmentNode.name, START_CURSOR, cursor) : invariant(false) : void 0 : !false ? process.env.NODE_ENV !== "production" ? invariant(false) : invariant(false) : void 0 : void 0;
  var hasMore;

  if (direction === 'forward') {
    hasMore = cursor != null && pageInfo[HAS_NEXT_PAGE] === true;
  } else {
    hasMore = cursor != null && pageInfo[HAS_PREV_PAGE] === true;
  }

  return {
    cursor: cursor,
    hasMore: hasMore
  };
}
export function getConnectionState(direction, fragmentNode, fragmentData, connectionPathInFragmentData) {
  var connection = getValueAtPath(fragmentData, connectionPathInFragmentData);
  return getStateFromConnection(direction, fragmentNode, connection);
}