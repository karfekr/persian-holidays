import type { CalendarType } from "src/types";

export type CalendarAdapter = {
	firstWeekdayOfMonth: (calendar: CalendarType, year: number, month: number) => number;
	daysInMonth: (calendar: CalendarType, year: number, month: number) => number;
};

let adapter: CalendarAdapter | null = null;

export function setAdapter(next: CalendarAdapter): void {
	if (typeof next?.firstWeekdayOfMonth !== "function" || typeof next?.daysInMonth !== "function") {
		throw new TypeError(
			"[persian-holidays] setAdapter() requires an object with " +
				"firstWeekdayOfMonth(calendar, year, month) and " +
				"daysInMonth(calendar, year, month) methods.",
		);
	}

	adapter = next;
}

export function getAdapter(callerHint?: string): CalendarAdapter {
	if (adapter === null) {
		const who = callerHint ? `Rule "${callerHint}" ` : "A relative rule ";

		throw new Error(
			`[persian-holidays] ${who}requires calendar arithmetic but no adapter has been registered.\n` +
				`Call setAdapter() once at startup.`,
		);
	}

	return adapter;
}

export function clearAdapter(): void {
	adapter = null;
}
