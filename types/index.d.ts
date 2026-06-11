export type CalendarType = "jalali" | "gregorian" | "hijri";

export type Category =
	| "national"
	| "religious"
	| "cultural"
	| "international"
	| "memorial"
	| "nature";

export type EventType = "fixed" | "multi-day" | "relative";

export type BilingualTitle = {
	fa: string;
	en: string;
};

export type EventMetadata = {
	importance?: string;
	source?: string;
	note?: string;
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

	isHoliday: boolean;
	isOfficialHolidayInIran: boolean;

	metadata?: EventMetadata;
};

export type Event = {
	id: string;
	title: BilingualTitle;
	categories: Category[];
	isHoliday: boolean;
	isOfficialHolidayInIran: boolean;
	calendar: CalendarType;
	type: EventType;
	metadata?: EventMetadata;
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
