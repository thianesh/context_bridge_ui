/**
 * Sort an array of member-ID strings by last-activity time.
 * Most-recently active IDs come first.
 *
 * @param {string[]} members         // e.g. ['u1', 'u2', 'u3']
 * @param {Record<string, Date|string|number>} activityById
 *        // e.g. { u1: '2025-07-05T10:00:00Z', u2: 1720280000000, … }
 * @param {boolean} mutate=false     // true = sort in-place
 * @returns {string[]}               // ordered list (original or cloned)
 */
export function sortByActivity(members, activityById, mutate = false) {
  const list = mutate ? members : [...members];

  const ts = v => {
    // Convert any reasonable format → epoch-ms; NaN → -Infinity
    const d = v instanceof Date ? v
            : typeof v === 'number' ? new Date(v)
            : typeof v === 'string' ? new Date(v)
            : null;
    return d?.getTime?.() ?? -Infinity;   // unknown → oldest
  };

  list.sort((a, b) => ts(activityById[b]) - ts(activityById[a]));
  return list;
}
