import { loadCalendar } from "./core/loader.js";
import { matchDay, matchRange } from "./core/engine.js";

/**
 * @param {import('./core/types.js').CalendarType} calendar
 * @param {number} month
 * @param {number | undefined} year
 * @returns {number}
 */
function getMonthLength(calendar, month, year) {
	if (calendar === "jalali") {
		if (month <= 6) return 31;
		if (month <= 11) return 30;
		if (year == null) return 30;
		return _isJalaliLeap(year) ? 30 : 29;
	}
	if (calendar === "gregorian") {
		const base = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
		if (month !== 2) return base[month];
		if (year == null) return 29;
		return _isGregorianLeap(year) ? 29 : 28;
	}
	if (calendar === "hijri") {
		if (month % 2 === 1) return 30;
		if (month !== 12) return 29;
		if (year == null) return 30;
		return _isHijriLeap(year) ? 30 : 29;
	}
	throw new Error(`[persian-events] Unsupported calendar: "${calendar}"`);
}

function _isJalaliLeap(y) {
	return ((((y - (y > 0 ? 474 : 473)) % 2820) + 474 + 38) * 682) % 2816 < 682;
}
function _isGregorianLeap(y) {
	return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}
function _isHijriLeap(y) {
	return [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(y % 30);
}

/**
 * @param {import('./core/types.js').CalendarType} calendar
 * @param {number} month
 * @param {number} day
 * @param {import('./core/types.js').QueryOptions} [options]
 * @returns {Promise<import('./core/types.js').Event[]>}
 */
export async function getEvents(calendar, month, day, options) {
	const raw = await loadCalendar(calendar);
	return matchDay(
		raw,
		calendar,
		month,
		day,
		options?.categories,
		options?.year,
	);
}

/**
 * @param {import('./core/types.js').CalendarType} calendar
 * @param {number} month
 * @param {import('./core/types.js').QueryOptions} [options]
 * @returns {Promise<import('./core/types.js').Event[]>}
 */
export async function getMonthEvents(calendar, month, options) {
	const raw = await loadCalendar(calendar);
	const year = options?.year;
	const lastDay = getMonthLength(calendar, month, year);
	return matchRange(
		raw,
		calendar,
		month,
		1,
		month,
		lastDay,
		options?.categories,
		year,
	);
}

/**
 * @param {import('./core/types.js').CalendarType} calendar
 * @param {number} year
 * @param {import('./core/types.js').QueryOptions} [options]
 * @returns {Promise<import('./core/types.js').Event[]>}
 */
export async function getYearEvents(calendar, year, options) {
	const raw = await loadCalendar(calendar);
	const lastDay = getMonthLength(calendar, 12, year);
	return matchRange(
		raw,
		calendar,
		1,
		1,
		12,
		lastDay,
		options?.categories,
		year,
	);
}
