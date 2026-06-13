/**
 * @typedef {import('./types.js').RawEvent} RawEvent
 * @typedef {string} CalendarName
 * @typedef {Record<CalendarName, RawEvent[]>} CalendarDataMap
 * @typedef {Map<CalendarName, RawEvent[]>} CalendarCacheMap
 */

/** @type {CalendarCacheMap} */
const cache = new Map();

/** @type {CalendarDataMap} */
const _staticData = {};

/**
 * @param {CalendarName} calendar
 * @returns {Promise<RawEvent[]>}
 */
export async function loadCalendar(calendar) {
	if (cache.has(calendar)) {
		const events = cache.get(calendar);
		if (events) return events;
	}

	if (_staticData[calendar]) {
		const events = _staticData[calendar];
		cache.set(calendar, events);
		return events;
	}

	throw new Error(
		`[persian-events] No data registered for calendar "${calendar}". ` +
			`Import from "persian-events/${calendar}" or call registerData().`,
	);
}

/**
 * @param {CalendarName} calendar
 * @param {RawEvent[]} events
 */
export function registerData(calendar, events) {
	_staticData[calendar] = events;
	cache.delete(calendar);
}

/**
 * @param {CalendarName} calendar
 * @returns {RawEvent[]}
 */
export function getLoadedData(calendar) {
	const data = _staticData[calendar];
	if (!data) {
		throw new Error(`[persian-events] Data for "${calendar}" not loaded.`);
	}
	return data;
}
