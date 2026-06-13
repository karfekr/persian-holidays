export const jalaliSample = [
	{
		id: "jalali-nowruz-day1",
		type: "fixed",
		month: 1,
		day: 1,
		title: { fa: "نوروز", en: "Nowruz" },
		categories: ["government"],
		isHolidayInIran: true,
	},
	{
		id: "jalali-nowruz-holidays",
		type: "multi-day",
		startMonth: 1,
		startDay: 1,
		endMonth: 1,
		endDay: 4,
		title: { fa: "تعطیلات نوروز", en: "Nowruz Holidays" },
		categories: ["government"],
		isHolidayInIran: true,
	},
	{
		id: "jalali-teachers-day",
		type: "fixed",
		month: 2,
		day: 12,
		title: { fa: "روز معلم", en: "Teacher's Day" },
		categories: ["government", "historical"],
		isHolidayInIran: false,
	},
];

export const gregorianSample = [
	{
		id: "gregorian-mothers-day",
		type: "relative",
		rule: { base: "month-weekday", month: 5, weekday: 0, occurrence: "second" },
		title: { fa: "روز مادر", en: "Mother's Day" },
		categories: ["international"],
		isHolidayInIran: false,
	},
	{
		id: "gregorian-christmas",
		type: "fixed",
		month: 12,
		day: 25,
		title: { fa: "کریسمس", en: "Christmas Day" },
		categories: ["international", "religious"],
		isHolidayInIran: false,
	},
];

/** @type {import('../../src/core/types.js').RawEvent[]} */
export const loaderSample = [
	{
		id: "fixed-m1d1",
		type: "fixed",
		month: 1,
		day: 1,
		title: { fa: "روز اول", en: "Day One" },
		categories: ["government"],
		isHolidayInIran: true,
	},
	{
		id: "fixed-m6d31",
		type: "fixed",
		month: 6,
		day: 31,
		title: { fa: "روز پایان شهریور", en: "End of Shahrivar" },
		categories: ["government"],
		isHolidayInIran: false,
	},
	{
		id: "multi-m1d1-4",
		type: "multi-day",
		startMonth: 1,
		startDay: 1,
		endMonth: 1,
		endDay: 4,
		title: { fa: "هفته نوروز", en: "Nowruz Week" },
		categories: ["government"],
		isHolidayInIran: true,
	},
];
