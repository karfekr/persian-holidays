import type { CalendarType, RawEvent } from "src/types";

type CalendarDataMap = Record<CalendarType, RawEvent[]>;
type CalendarCacheMap = Map<CalendarType, RawEvent[]>;

const cache: CalendarCacheMap = new Map();

const staticData = {} as CalendarDataMap;

export function loadCalendar(calendar: CalendarType): RawEvent[] {
	const cached = cache.get(calendar);

	if (cached) {
		return cached;
	}

	const events = staticData[calendar];

	if (events) {
		cache.set(calendar, events);
		return events;
	}

	throw new Error(
		`[persian-events] No data registered for calendar "${calendar}". ` +
			`Import from "persian-events/${calendar}"`,
	);
}

export function registerData(calendar: CalendarType, events: RawEvent[]): void {
	staticData[calendar] = events;
	cache.delete(calendar);
}

export function getLoadedData(calendar: CalendarType): RawEvent[] {
	const data = staticData[calendar];

	if (!data) {
		throw new Error(`[persian-events] Data for "${calendar}" not loaded.`);
	}

	return data;
}
