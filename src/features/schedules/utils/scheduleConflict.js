// Schedule overlap detection — used to give instant feedback before submit.
// The bus-service backend enforces the same rule authoritatively; this is only
// a UX convenience so the user doesn't have to round-trip to learn about a clash.

const toMs = (value) => new Date(value).getTime();

/**
 * Find the first schedule in `schedules` whose [departureDateTime, arrivalDateTime]
 * window overlaps the requested [departure, arrival] window for the same bus.
 *
 * Two windows overlap iff each one starts strictly before the other ends, so
 * back-to-back schedules (one ends exactly when the next starts) are allowed.
 *
 * @param {Array}  schedules existing schedules for the bus
 * @param {string} departure requested departure (ISO date-time string)
 * @param {string} arrival   requested arrival (ISO date-time string)
 * @param {number|null} excludeId schedule id to ignore (the one being edited)
 * @returns the conflicting schedule, or null
 */
export const findConflictingSchedule = (schedules, departure, arrival, excludeId = null) => {
  if (!departure || !arrival) return null;
  const depMs = toMs(departure);
  const arrMs = toMs(arrival);
  if (Number.isNaN(depMs) || Number.isNaN(arrMs)) return null;

  return (
    (schedules || []).find((s) => {
      if (excludeId != null && s.id === excludeId) return false;
      if (!s.departureDateTime || !s.arrivalDateTime) return false;
      return depMs < toMs(s.arrivalDateTime) && toMs(s.departureDateTime) < arrMs;
    }) || null
  );
};
