import type { CalendarType, EventType, QueryOptions } from "src/types";

import { getAdapter } from "./adapter";
import { matchDay, matchRange } from "./engine";
import { loadCalendar } from "./loader";

function getMonthLength(calendar: CalendarType, month: number, year?: number): number {
	const adapter = getAdapter("getMonthLength");

	return adapter.monthLength(calendar, year ?? 0, month);
}

export function getEvents(
	calendar: CalendarType,
	month: number,
	day: number,
	options?: QueryOptions,
): EventType[] {
	const raw = loadCalendar(calendar);

	return matchDay(raw, calendar, month, day, options?.categories, options?.year);
}

export function getMonthEvents(
	calendar: CalendarType,
	month: number,
	options?: QueryOptions,
): EventType[] {
	const raw = loadCalendar(calendar);

	const year = options?.year;
	const lastDay = getMonthLength(calendar, month, year);

	return matchRange(raw, calendar, month, 1, month, lastDay, options?.categories, year);
}

export function getYearEvents(
	calendar: CalendarType,
	year: number,
	options?: QueryOptions,
): EventType[] {
	const raw = loadCalendar(calendar);

	const lastDay = getMonthLength(calendar, 12, year);

	return matchRange(raw, calendar, 1, 1, 12, lastDay, options?.categories, year);
}
