/**
 * @typedef {'jalali' | 'gregorian' | 'hijri'} CalendarType
 *
 * @typedef {'government' | 'religious' | 'international' | 'historical' | 'united_nations' | 'ancient' | 'sunni' | 'shia'} Category
 *
 * @typedef {'fixed' | 'multi-day' | 'relative'} EventType
 *
 * @typedef {{ fa: string; en: string }} BilingualTitle
 *
 * @typedef {object} EventMetadata
 * @property {string} [importance]
 * @property {string} [source]
 * @property {string} [note]
 *
 * @typedef {object} RelativeRule
 * @property {'nth-weekday-of-month' | 'computus' | 'day-candidates' | 'month-weekday' | 'month-end'} base
 * @property {number} [month]
 * @property {number} [weekday]
 * @property {'first'|'second'|'third'|'fourth'|'last'} [occurrence]
 * @property {number} [offsetDays]
 * @property {number[]} [candidates]
 *
 * @typedef {object} ResolverContext
 * @property {number|undefined} [year]
 * @property {CalendarType} [calendar]
 * @property {boolean} [skipOnMissingYear]
 *
 * @typedef {object} DatePoint
 * @property {number} month
 * @property {number} day
 *
 * @typedef {object} RawEvent
 * @property {string} id
 * @property {EventType} type
 * @property {number} [month]
 * @property {number} [day]
 * @property {number} [startMonth]
 * @property {number} [startDay]
 * @property {number} [endMonth]
 * @property {number} [endDay]
 * @property {RelativeRule} [rule]
 * @property {BilingualTitle} title
 * @property {Category[]} categories
 * @property {boolean} isHolidayInIran
 *
 * @typedef {object} Event
 * @property {string} id
 * @property {BilingualTitle} title
 * @property {Category[]} categories
 * @property {boolean} isHolidayInIran
 * @property {CalendarType} calendar
 * @property {EventType} type
 *
 * @typedef {object} QueryOptions
 * @property {Category[]} [categories]
 * @property {number} [year]
 */

export const CALENDAR_TYPES = /** @type {const} */ ([
	"jalali",
	"gregorian",
	"hijri",
]);

export const CATEGORIES = /** @type {const} */ ([
	"government",
	"religious",
	"shia",
	"sunni",
	"ancient",
	"international",
	"historical",
	"united_nations",
]);
