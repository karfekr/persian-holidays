import type { RawEvent } from "src/types";

type CalendarName = string;

type CalendarDataMap = Record<CalendarName, RawEvent[]>;
type CalendarCacheMap = Map<CalendarName, RawEvent[]>;

const cache: CalendarCacheMap = new Map();

const staticData: CalendarDataMap = {};

export async function loadCalendar(calendar: CalendarName): Promise<RawEvent[]> {
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
			`Import from "persian-events/${calendar}" or call registerData().`,
	);
}

export function registerData(calendar: CalendarName, events: RawEvent[]): void {
	staticData[calendar] = events;
	cache.delete(calendar);
}

export function getLoadedData(calendar: CalendarName): RawEvent[] {
	const data = staticData[calendar];

	if (!data) {
		throw new Error(`[persian-events] Data for "${calendar}" not loaded.`);
	}

	return data;
}
