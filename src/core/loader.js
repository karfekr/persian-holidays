/** @type {Map<string, import('./types.js').RawEvent[]>} */
const cache = new Map();

/** @type {Record<string, import('./types.js').RawEvent[]>} */
const _staticData = {};

/**
 * Load events for a calendar type.
 */
export async function loadCalendar(calendar) {
	if (cache.has(calendar)) return cache.get(calendar);

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
 * Register preloaded calendar data.
 */
export function registerData(calendar, events) {
	_staticData[calendar] = events;
	cache.delete(calendar);
}

/**
 * Get already-loaded data (must be registered first).
 */
export function getLoadedData(calendar) {
	const data = _staticData[calendar];
	if (!data) {
		throw new Error(
			`[persian-events] Data for "${calendar}" not loaded.`,
		);
	}
	return data;
}
