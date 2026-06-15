import type { CalendarType, EventType, QueryOptions } from "src/types";

import { resolveAdapter } from "./adapter";
import { matchDay, matchRange } from "./engine";
import { loadCalendar } from "./loader";

export function getEvents(
	calendar: CalendarType,
	month: number,
	day: number,
	options?: QueryOptions,
): EventType[] {
	const raw = loadCalendar(calendar);
	const adapter = resolveAdapter(options?.adapter) ?? undefined;

	return matchDay(raw, calendar, month, day, options?.categories, options?.year, adapter);
}

export function getMonthEvents(
	calendar: CalendarType,
	month: number,
	options?: QueryOptions,
): EventType[] {
	const raw = loadCalendar(calendar);
	const adapter = resolveAdapter(options?.adapter);
	const year = options?.year;
	const lastDay = adapter ? adapter.monthLength(calendar, year ?? 0, month) : 31;

	return matchRange(
		raw,
		calendar,
		month,
		1,
		month,
		lastDay,
		options?.categories,
		year,
		adapter ?? undefined,
	);
}

export function getYearEvents(
	calendar: CalendarType,
	year: number,
	options?: QueryOptions,
): EventType[] {
	const raw = loadCalendar(calendar);
	const adapter = resolveAdapter(options?.adapter);
	const lastDay = adapter ? adapter.monthLength(calendar, year, 12) : 31;

	return matchRange(
		raw,
		calendar,
		1,
		1,
		12,
		lastDay,
		options?.categories,
		year,
		adapter ?? undefined,
	);
}
