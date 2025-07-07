/**
 * Order members by their last-activity time (most-recent first).
 *
 * @param {Array<Object>|Array<string>} members
 *        Either an array of objects that contain a `member_id` field,
 *        or an array of raw member-id strings.
 *
 * @param {Record<string, string|number|Date>} activityById
 *        A lookup table: { [member_id]: ISO string | epoch-ms | Date }
 *
 * @param {boolean} mutate   // default: false – set true to sort in-place
 * @returns {Promise<Array>} A (possibly new) array ordered by recency
 */
export async function orderByLastActivity(
  members,
  activityById,
  mutate = false,
) {
  // Choose whether to mutate or clone
  const list = mutate ? members : [...members];

  // Helper: normalize any timestamp into epoch-ms; 0 when missing/invalid
  const toMs = v => {
    const t = v instanceof Date ? v
            : typeof v === 'number' ? new Date(v)
            : typeof v === 'string' ? new Date(v)
            : null;
    return t?.getTime?.() || 0;
  };

  // Extract member_id no matter which list shape you gave us
  const getId = m => (typeof m === 'string' ? m : m.member_id);

  // Stable sort: most-recent first
  list.sort((m1, m2) => toMs(activityById[getId(m2)]) -
                        toMs(activityById[getId(m1)]));

  return list;
}
