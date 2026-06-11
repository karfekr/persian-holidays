export type CalendarType = "jalali" | "gregorian" | "hijri";

export type Category =
	| "government"
	| "religious"
	| "shia"
	| "sunni"
	| "ancient"
	| "international"
	| "historical"
	| "united_nations";

export type EventType = "fixed" | "multi-day" | "relative";

export type BilingualTitle = {
	fa: string;
	en: string;
};

export type RelativeRule =
	| {
			base: "nth-weekday-of-month";
			month: number;
			weekday: number;
			weekdaySystem?: "iso" | "jalali";
			occurrence?: "first" | "second" | "third" | "fourth" | "last";
	  }
	| {
			base: "computus";
			offsetDays?: number;
	  }
	| {
			base: "day-candidates";
			month: number;
			candidates: number[];
	  }
	| {
			base: "month-weekday";
			month: number;
			weekday: number;
			weekdaySystem?: "iso" | "jalali";
			occurrence?: "first" | "second" | "third" | "fourth";
	  }
	| {
			base: "month-end";
			month: number;
			weekday: number;
			weekdaySystem?: "iso" | "jalali";
	  };

export type ResolverContext = {
	year?: number;
	calendar?: CalendarType;
	weekdaySystem?: "iso" | "jalali";
};

export type DatePoint = {
	month: number;
	day: number;
};

export type RawEvent = {
	id: string;
	type: EventType;

	// fixed
	month?: number;
	day?: number;

	// multi-day
	startMonth?: number;
	startDay?: number;
	endMonth?: number;
	endDay?: number;

	// relative
	rule?: RelativeRule;

	title: BilingualTitle;
	categories: Category[];

	isHolidayInIran: boolean;
};

export type Event = {
	id: string;
	title: BilingualTitle;
	categories: Category[];
	isHolidayInIran: boolean;
	calendar: CalendarType;
	type: EventType;
};

export type QueryOptions = {
	categories?: Category[];
	year?: number;
};

export type GetEvents = (
	calendar: CalendarType,
	month: number,
	day: number,
	options?: QueryOptions,
) => Promise<Event[]>;

export type GetMonthEvents = (
	calendar: CalendarType,
	month: number,
	options?: QueryOptions,
) => Promise<Event[]>;

export type GetYearEvents = (
	calendar: CalendarType,
	year: number,
	options?: Omit<QueryOptions, "year">,
) => Promise<Event[]>;
