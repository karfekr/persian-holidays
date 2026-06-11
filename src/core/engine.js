import { resolveRule } from "./ruleResolver.js";

/** @param {number} aM @param {number} aD @param {number} bM @param {number} bD */
function cmpDate(aM, aD, bM, bD) {
	return aM !== bM ? aM - bM : aD - bD;
}

function inRange(month, day, startMonth, startDay, endMonth, endDay) {
	return (
		cmpDate(month, day, startMonth, startDay) >= 0 &&
		cmpDate(month, day, endMonth, endDay) <= 0
	);
}

/**
 * @param {import('./types.js').RawEvent} event
 * @param {import('./types.js').Category[] | undefined} categories
 */
function matchesCategory(event, categories) {
	if (!categories || categories.length === 0) return true;
	return event.categories.some((c) => categories.includes(c));
}

/**
 * @param {import('./types.js').RawEvent} raw
 * @param {import('./types.js').CalendarType} calendar
 * @returns {import('./types.js').Event}
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
 * @param {import('./types.js').RawEvent[]} rawEvents
 * @param {import('./types.js').CalendarType} calendar
 * @param {number} month
 * @param {number} day
 * @param {import('./types.js').Category[] | undefined} categories
 * @param {number | undefined} year
 * @returns {import('./types.js').Event[]}
 */
export function matchDay(rawEvents, calendar, month, day, categories, year) {
	const results = [];

	for (const event of rawEvents) {
		if (!matchesCategory(event, categories)) continue;

		if (event.type === "fixed") {
			if (event.month === month && event.day === day) {
				results.push(toEvent(event, calendar));
			}
		} else if (event.type === "multi-day") {
			if (
				inRange(
					month,
					day,
					event.startMonth,
					event.startDay,
					event.endMonth,
					event.endDay,
				)
			) {
				results.push(toEvent(event, calendar));
			}
		} else if (event.type === "relative") {
			const ctx = { year, calendar, skipOnMissingYear: year == null };
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
 * @param {import('./types.js').RawEvent[]} rawEvents
 * @param {import('./types.js').CalendarType} calendar
 * @param {number} startMonth
 * @param {number} startDay
 * @param {number} endMonth
 * @param {number} endDay
 * @param {import('./types.js').Category[] | undefined} categories
 * @param {number | undefined} year
 * @returns {import('./types.js').Event[]}
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
	const results = [];
	const seen = new Set();

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
				inRange(event.month, event.day, startMonth, startDay, endMonth, endDay)
			) {
				add(event);
			}
		} else if (event.type === "multi-day") {
			const overlapStart =
				cmpDate(event.endMonth, event.endDay, startMonth, startDay) >= 0;
			const overlapEnd =
				cmpDate(event.startMonth, event.startDay, endMonth, endDay) <= 0;
			if (overlapStart && overlapEnd) add(event);
		} else if (event.type === "relative") {
			const ctx = { year, calendar, skipOnMissingYear: year == null };
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
