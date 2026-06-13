/**
 * @typedef {Object} CalendarAdapter
 * @property {(calendar: import('./types.js').CalendarType, year: number, month: number) => number} firstWeekdayOfMonth
 * @property {(calendar: import('./types.js').CalendarType, year: number, month: number) => number} daysInMonth
 */

/** @type {CalendarAdapter | null} */
let _adapter = null;

/**
 * @param {CalendarAdapter} adapter
 */
export function setAdapter(adapter) {
	if (
		typeof adapter?.firstWeekdayOfMonth !== "function" ||
		typeof adapter?.daysInMonth !== "function"
	) {
		throw new TypeError(
			"[persian-holidays] setAdapter() requires an object with " +
				"firstWeekdayOfMonth(calendar, year, month) and " +
				"daysInMonth(calendar, year, month) methods.",
		);
	}

	_adapter = adapter;
}

/**
 * @param {string} [callerHint]
 * @returns {CalendarAdapter}
 */
export function getAdapter(callerHint) {
	if (_adapter === null) {
		const who = callerHint ? `Rule "${callerHint}" ` : "A relative rule ";

		throw new Error(
			`[persian-holidays] ${who}requires calendar arithmetic but no adapter has been registered.\n` +
				`Call setAdapter() once at startup.`,
		);
	}

	return _adapter;
}

export function clearAdapter() {
	_adapter = null;
}
