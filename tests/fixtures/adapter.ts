import {
	CalendarDate,
	endOfMonth,
	getDayOfWeek,
	GregorianCalendar,
	IslamicCivilCalendar,
	PersianCalendar,
	startOfMonth,
} from "@internationalized/date";
import type { CalendarType } from "src/types";

export type InternationalizedAdapter = {
	firstWeekdayOfMonth: (calendar: CalendarType, year: number, month: number) => number;

	monthLength: (calendar: CalendarType, year: number, month: number) => number;
};

const CALENDARS: Record<CalendarType, unknown> = {
	jalali: new PersianCalendar(),
	hijri: new IslamicCivilCalendar(),
	gregorian: new GregorianCalendar(),
};

const LOCALE: Record<CalendarType, string> = {
	jalali: "fa-IR",
	hijri: "fa-IR",
	gregorian: "en-US",
};

function normaliseWeekday(rawWeekday: number, calendar: CalendarType): number {
	if (calendar === "jalali" || calendar === "hijri") {
		return (rawWeekday + 6) % 7;
	}

	return rawWeekday;
}

export function createInternationalizedAdapter(): InternationalizedAdapter {
	return {
		firstWeekdayOfMonth(calendar, year, month) {
			const cal = CALENDARS[calendar];

			if (!cal) {
				throw new Error(
					`[persian-holidays] createInternationalizedAdapter: unknown calendar "${calendar}".`,
				);
			}

			const firstDay = startOfMonth(new CalendarDate(cal as CalendarType, year, month, 1));

			const raw = getDayOfWeek(firstDay, LOCALE[calendar]);

			return normaliseWeekday(raw, calendar);
		},

		monthLength(calendar, year, month) {
			const cal = CALENDARS[calendar];

			if (!cal) {
				throw new Error(
					`[persian-holidays] createInternationalizedAdapter: unknown calendar "${calendar}".`,
				);
			}

			const last = endOfMonth(new CalendarDate(cal as CalendarType, year, month, 1));

			return last.day;
		},
	};
}
