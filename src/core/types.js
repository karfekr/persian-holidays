/**
 * @typedef {'jalali' | 'gregorian' | 'hijri'} CalendarType
 *
 * @typedef {'government' | 'religious' | 'international' | 'historical' | 'united_nations' | 'ancient' | 'sunni' | 'shia'} Category
 *
 * @typedef {'fixed' | 'multi-day' | 'relative'} EventType
 *
 * @typedef {{ fa: string; en: string }} BilingualTitle
 *
 * @typedef {Object} EventMetadata
 * @property {string} [importance]
 * @property {string} [source]
 * @property {string} [note]
 *
 * @typedef {Object} RelativeRule
 * @property {'nth-weekday-of-month' | 'computus' | 'day-candidates' | 'month-weekday' | 'month-end'} base
 * @property {number} [month]
 * @property {number} [weekday]
 * @property {'first'|'second'|'third'|'fourth'|'last'} [occurrence]
 * @property {number} [offsetDays]
 * @property {number[]} [candidates]
 *
 * @typedef {Object} ResolverContext
 * @property {number} [year]
 * @property {CalendarType} [calendar]
 * @property {boolean} [skipOnMissingYear]
 *
 * @typedef {Object} DatePoint
 * @property {number} month
 * @property {number} day
 *
 * @typedef {Object} RawEvent
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
 * @typedef {Object} Event
 * @property {string} id
 * @property {BilingualTitle} title
 * @property {Category[]} categories
 * @property {boolean} isHolidayInIran
 * @property {CalendarType} calendar
 * @property {EventType} type
 *
 * @typedef {Object} QueryOptions
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
