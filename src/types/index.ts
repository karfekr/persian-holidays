export const CALENDAR_TYPES = ["jalali", "gregorian", "hijri"] as const;

export type CalendarType = (typeof CALENDAR_TYPES)[number];

export const CATEGORIES = [
	"government",
	"religious",
	"shia",
	"sunni",
	"ancient",
	"international",
	"historical",
	"united_nations",
] as const;

export type CategoryType = (typeof CATEGORIES)[number];

export type OccasionType = "fixed" | "multi-day" | "relative";

export type BilingualTitle = {
	fa: string;
	en: string;
};

export type EventMetadata = {
	importance?: string;
	source?: string;
	note?: string;
};

export type RelativeRule = {
	base: "nth-weekday-of-month" | "computus" | "day-candidates" | "month-weekday" | "month-end";

	month?: number;
	weekday?: number;
	occurrence?: "first" | "second" | "third" | "fourth" | "last";

	offsetDays?: number;
	candidates?: number[];
};

export type ResolverContext = {
	year?: number;
	calendar?: CalendarType;
	skipOnMissingYear?: boolean;
	adapter?: AdapterType;
};

export type DatePoint = {
	month: number;
	day: number;
};

export type RawEvent = {
	id: string;

	type: OccasionType;

	month?: number;
	day?: number;

	startMonth?: number;
	startDay?: number;

	endMonth?: number;
	endDay?: number;

	rule?: RelativeRule;

	title: BilingualTitle;

	categories: CategoryType[];

	isHolidayInIran: boolean;
};

export type EventType = {
	id: string;

	title: BilingualTitle;

	categories: CategoryType[];

	isHolidayInIran: boolean;

	calendar: CalendarType;

	type: OccasionType;
};

export type AdapterType = {
	firstWeekdayOfMonth: (calendar: CalendarType, year: number, month: number) => number;
	monthLength: (calendar: CalendarType, year: number, month: number) => number;
};

export type QueryOptions = {
	categories?: CategoryType[];
	year?: number;
	adapter?: AdapterType;
	trueHolidays?: boolean;
};

export type RuleResolver = (rule: RelativeRule, ctx: ResolverContext) => DatePoint[];

export type EventRule =
	| {
			base: "nth-weekday-of-month";
			month: number;
			weekday: number;
			occurrence: "first" | "second" | "third" | "fourth" | "last";
	  }
	| {
			base: "computus";
			offsetDays?: number;
	  }
	| {
			base: "day-candidates";
			month: number;
			candidates: number[];
	  };
