import { resolveRule } from "./ruleResolver.js";

/** @typedef {import('./types.js').RawEvent} RawEvent */
/** @typedef {import('./types.js').CalendarType} CalendarType */
/** @typedef {import('./types.js').Category} Category */
/** @typedef {import('./types.js').Event} Event */

/**
 * @typedef {object} ResolveRuleContext
 * @property {number | undefined} year
 * @property {CalendarType} calendar
 * @property {boolean} skipOnMissingYear
 */

/**
 * @typedef {{ month: number, day: number }} MonthDayPoint
 */

/**
 * @param {number} aM
 * @param {number} aD
 * @param {number} bM
 * @param {number} bD
 * @returns {number}
 */
function cmpDate(aM, aD, bM, bD) {
	return aM !== bM ? aM - bM : aD - bD;
}

/**
 * @param {number} month
 * @param {number} day
 * @param {number} startMonth
 * @param {number} startDay
 * @param {number} endMonth
 * @param {number} endDay
 * @returns {boolean}
 */
function inRange(month, day, startMonth, startDay, endMonth, endDay) {
	return (
		cmpDate(month, day, startMonth, startDay) >= 0 &&
		cmpDate(month, day, endMonth, endDay) <= 0
	);
}

/**
 * @param {RawEvent} event
 * @param {Category[] | undefined} categories
 * @returns {boolean}
 */
function matchesCategory(event, categories) {
	if (!categories || categories.length === 0) return true;
	return event.categories.some((c) => categories.includes(c));
}

/**
 * @param {RawEvent} raw
 * @param {CalendarType} calendar
 * @returns {Event}
 */
function toEvent(raw, calendar) {
	return {
		id: raw.id,
		title: raw.title,
		categories: raw.categories,
		isHolidayInIran: raw.isHolidayInIran,
		calendar,
		type: raw.type,
	};
}

/**
 * @param {RawEvent[]} rawEvents
 * @param {CalendarType} calendar
 * @param {number} month
 * @param {number} day
 * @param {Category[] | undefined} categories
 * @param {number | undefined} year
 * @returns {Event[]}
 */
export function matchDay(rawEvents, calendar, month, day, categories, year) {
	/** @type {Event[]} */
	const results = [];

	for (const event of rawEvents) {
		if (!matchesCategory(event, categories)) continue;

		if (event.type === "fixed") {
			if (
				event.month != null &&
				event.day != null &&
				event.month === month &&
				event.day === day
			) {
				results.push(toEvent(event, calendar));
			}
		} else if (event.type === "multi-day") {
			const { startMonth, startDay, endMonth, endDay } = event;
			if (
				startMonth != null &&
				startDay != null &&
				endMonth != null &&
				endDay != null &&
				inRange(month, day, startMonth, startDay, endMonth, endDay)
			) {
				results.push(toEvent(event, calendar));
			}
		} else if (event.type === "relative") {
			if (event.rule == null) continue;
			/** @type {ResolveRuleContext} */
			const ctx = { year, calendar, skipOnMissingYear: year == null };
			/** @type {MonthDayPoint[]} */
			const resolved = resolveRule(event.rule, ctx);
			for (const pt of resolved) {
				if (pt.month === month && pt.day === day) {
					results.push(toEvent(event, calendar));
					break;
				}
			}
		}
	}

	return results;
}

/**
 * @param {RawEvent[]} rawEvents
 * @param {CalendarType} calendar
 * @param {number} startMonth
 * @param {number} startDay
 * @param {number} endMonth
 * @param {number} endDay
 * @param {Category[] | undefined} categories
 * @param {number | undefined} year
 * @returns {Event[]}
 */
export function matchRange(
	rawEvents,
	calendar,
	startMonth,
	startDay,
	endMonth,
	endDay,
	categories,
	year,
) {
	/** @type {Event[]} */
	const results = [];
	const seen = new Set();

	/**
	 * @param {RawEvent} event
	 */
	const add = (event) => {
		if (!seen.has(event.id)) {
			seen.add(event.id);
			results.push(toEvent(event, calendar));
		}
	};

	for (const event of rawEvents) {
		if (!matchesCategory(event, categories)) continue;

		if (event.type === "fixed") {
			if (
				event.month != null &&
				event.day != null &&
				inRange(event.month, event.day, startMonth, startDay, endMonth, endDay)
			) {
				add(event);
			}
		} else if (event.type === "multi-day") {
			const {
				startMonth: evStartMonth,
				startDay: evStartDay,
				endMonth: evEndMonth,
				endDay: evEndDay,
			} = event;
			if (
				evStartMonth != null &&
				evStartDay != null &&
				evEndMonth != null &&
				evEndDay != null
			) {
				const overlapStart =
					cmpDate(evEndMonth, evEndDay, startMonth, startDay) >= 0;
				const overlapEnd =
					cmpDate(evStartMonth, evStartDay, endMonth, endDay) <= 0;
				if (overlapStart && overlapEnd) add(event);
			}
		} else if (event.type === "relative") {
			if (event.rule == null) continue;
			/** @type {ResolveRuleContext} */
			const ctx = { year, calendar, skipOnMissingYear: year == null };
			/** @type {MonthDayPoint[]} */
			const resolved = resolveRule(event.rule, ctx);
			for (const pt of resolved) {
				if (inRange(pt.month, pt.day, startMonth, startDay, endMonth, endDay)) {
					add(event);
					break;
				}
			}
		}
	}

	return results;
}
