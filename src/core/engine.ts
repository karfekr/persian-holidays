import type {
	AdapterType,
	CalendarType,
	CategoryType,
	DatePoint,
	EventType,
	RawEvent,
	ResolverContext,
} from "src/types";

import { resolveRule } from "./ruleResolver";

type MonthDayPoint = DatePoint;

function cmpDate(aM: number, aD: number, bM: number, bD: number): number {
	return aM !== bM ? aM - bM : aD - bD;
}

function inRange(
	month: number,
	day: number,
	startMonth: number,
	startDay: number,
	endMonth: number,
	endDay: number,
): boolean {
	return (
		cmpDate(month, day, startMonth, startDay) >= 0 && cmpDate(month, day, endMonth, endDay) <= 0
	);
}

function matchesCategory(event: RawEvent, categories?: CategoryType[]): boolean {
	if (!categories || categories.length === 0) {
		return true;
	}

	return event.categories.some((c) => categories.includes(c));
}

function toEvent(raw: RawEvent, calendar: CalendarType): EventType {
	return {
		id: raw.id,
		title: raw.title,
		categories: raw.categories,
		isHolidayInIran: raw.isHolidayInIran,
		calendar,
		type: raw.type,
	};
}

export function matchDay(
	rawEvents: RawEvent[],
	calendar: CalendarType,
	month: number,
	day: number,
	categories?: CategoryType[],
	year?: number,
	resolveAdapter?: AdapterType,
): EventType[] {
	const results: EventType[] = [];

	for (const event of rawEvents) {
		if (!matchesCategory(event, categories)) continue;

		if (event.type === "fixed") {
			if (event.month != null && event.day != null && event.month === month && event.day === day) {
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

			const ctx: ResolverContext = {
				year,
				calendar,
				skipOnMissingYear: year == null,
				adapter: resolveAdapter,
			};

			const resolved: MonthDayPoint[] = resolveRule(event.rule, ctx);

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

export function matchRange(
	rawEvents: RawEvent[],
	calendar: CalendarType,
	startMonth: number,
	startDay: number,
	endMonth: number,
	endDay: number,
	categories?: CategoryType[],
	year?: number,
	resolveAdapter?: AdapterType,
): EventType[] {
	const results: EventType[] = [];
	const seen = new Set<string>();

	const add = (event: RawEvent): void => {
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

			if (evStartMonth != null && evStartDay != null && evEndMonth != null && evEndDay != null) {
				const overlapStart = cmpDate(evEndMonth, evEndDay, startMonth, startDay) >= 0;

				const overlapEnd = cmpDate(evStartMonth, evStartDay, endMonth, endDay) <= 0;

				if (overlapStart && overlapEnd) {
					add(event);
				}
			}
		} else if (event.type === "relative") {
			if (event.rule == null) continue;

			const ctx: ResolverContext = {
				year,
				calendar,
				skipOnMissingYear: year == null,
				adapter: resolveAdapter,
			};

			const resolved: MonthDayPoint[] = resolveRule(event.rule, ctx);

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
