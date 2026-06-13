import {
	CalendarDate,
	PersianCalendar,
	IslamicCivilCalendar,
	GregorianCalendar,
	getDayOfWeek,
	endOfMonth,
	startOfMonth,
} from "@internationalized/date";

/**
 * @typedef {Object} InternationalizedAdapter
 * @property {(calendar: import('../../src/core/types.js').CalendarType, year: number, month: number) => number} firstWeekdayOfMonth
 * @property {(calendar: import('../../src/core/types.js').CalendarType, year: number, month: number) => number} daysInMonth
 */

/** @type {Record<import('../../src/core/types.js').CalendarType, any>} */
const CALENDARS = {
	jalali: new PersianCalendar(),
	hijri: new IslamicCivilCalendar(),
	gregorian: new GregorianCalendar(),
};

const LOCALE = {
	jalali: "fa-IR",
	hijri: "fa-IR",
	gregorian: "en-US",
};

/**
 * @param {number} rawWeekday
 * @param {import('../../src/core/types.js').CalendarType} calendar
 * @returns {number}
 */
function normaliseWeekday(rawWeekday, calendar) {
	if (calendar === "jalali" || calendar === "hijri") {
		return (rawWeekday + 6) % 7;
	}
	return rawWeekday;
}

/**
 * @returns {InternationalizedAdapter}
 */
export function createInternationalizedAdapter() {
	return {
		/**
		 * @param {import('../../src/core/types.js').CalendarType} calendar
		 * @param {number} year
		 * @param {number} month
		 * @returns {number}
		 */
		firstWeekdayOfMonth(calendar, year, month) {
			const cal = CALENDARS[calendar];
			if (!cal) {
				throw new Error(
					`[persian-holidays] createInternationalizedAdapter: unknown calendar "${calendar}".`,
				);
			}
			const firstDay = startOfMonth(new CalendarDate(cal, year, month, 1));
			const raw = getDayOfWeek(firstDay, LOCALE[calendar]);
			return normaliseWeekday(raw, calendar);
		},

		/**
		 * @param {import('../../src/core/types.js').CalendarType} calendar
		 * @param {number} year
		 * @param {number} month
		 * @returns {number}
		 */
		daysInMonth(calendar, year, month) {
			const cal = CALENDARS[calendar];
			if (!cal) {
				throw new Error(
					`[persian-holidays] createInternationalizedAdapter: unknown calendar "${calendar}".`,
				);
			}
			const last = endOfMonth(new CalendarDate(cal, year, month, 1));
			return last.day;
		},
	};
}
