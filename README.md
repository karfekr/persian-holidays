<div dir="ltr" align=center>

[**فارسی**](README_FA.md) / [**English**](README.md)

</div>

# 📦 persian-holidays

A unified engine for holidays and events across the Jalali (Persian), Hijri (Islamic), and Gregorian
calendars — with bilingual (Persian & English) data, official holiday categorization, and support
for fixed, multi-day, and rule-based dynamic events.

## ✨ Features

- **Three-calendar support in one package**: Jalali, Hijri, and Gregorian calendars
- **Complex event support**: Includes events like Easter (Gregorian) and Chaharshanbe Suri (Jalali)
- **Tree-shaking friendly output** based on actual usage
- **Zero dependencies**
- **Flexible adapter system** — set a global adapter once, or pass a per-call adapter directly to
  any function
- **Bilingual event titles**
- **Flexible and overlapping category filters**

## 📦 Installation

```bash
npm install persian-holidays
```

## 🚀 Usage

All calendar events are divided into two main types:

- **Fixed events**: Events that can be defined by a specific day/month across all years
- **Dynamic events**: Events like Chaharshanbe Suri (Jalali) or Thanksgiving (Gregorian), which
  cannot be fixed to a single day/month across all years

> Dynamic events require a date conversion configuration via a one-time adapter setup.

> If you only need fixed events, you can use this package without configuring an adapter.

### `getEvents(calendar, month, day, options?)`

Returns all events for a specific day of a month.

```js
const events = getEvents("jalali", 9, 20);
```

```ts
getEvents(
  calendar: 'jalali' | 'gregorian' | 'hijri',
  month: number,
  day: number,
  options?: {
    year?: number; // required for dynamic events
    categories?: CategoryType[];
    adapter?: CalendarAdapter; // overrides the global adapter for this call
  }
): Event[]
```

### `getMonthEvents(calendar, month, options?)`

Returns all events for a given month.

```js
const events = getMonthEvents("jalali", 1, { year: 1403 });
```

```ts
getMonthEvents(
  calendar: 'jalali' | 'gregorian' | 'hijri',
  month: number,
  options?: {
    year?: number;
    categories?: CategoryType[];
    adapter?: CalendarAdapter; // overrides the global adapter for this call
  }
): Event[]
```

### `getYearEvents(calendar, year, options?)`

Returns all events in a given year.

```js
const allOf1403 = getYearEvents("jalali", 1403);

const religiousOf1403 = getYearEvents("jalali", 1403, {
	categories: ["religious", "shia"],
});
```

```ts
getYearEvents(
  calendar: 'jalali' | 'gregorian' | 'hijri',
  year: number,
  options?: {
    categories?: CategoryType[];
    adapter?: CalendarAdapter; // overrides the global adapter for this call
  }
): Event[]
```

## 📘 Event Structure

```ts
type Event = {
	id: string;
	title: {
		fa: string;
		en: string;
	};
	categories: CategoryType[];
	isHolidayInIran: boolean;
	calendar: CalendarType;
	type: "fixed" | "multi-day" | "relative";
};
```

## ⚙️ Adapter Configuration

### Why adapters?

The engine needs two key pieces of calendar information to compute dynamic events:

1. What is the first weekday of a given month?
2. How many days does that month have?

Instead of depending on a specific date library, this package delegates responsibility to the user
via adapters.

Any object implementing the following interface is a valid adapter:

```ts
interface CalendarAdapter {
	firstWeekdayOfMonth(
		calendar: "jalali" | "gregorian" | "hijri",
		year: number,
		month: number,
	): number;

	monthLength(calendar: "jalali" | "gregorian" | "hijri", year: number, month: number): number;
}
```

### 🔢 Adapter Priority

The package resolves the adapter using the following priority order:

| Priority    | Source           | How                                          |
| ----------- | ---------------- | -------------------------------------------- |
| 1 (highest) | Per-call adapter | `getEvents(..., { adapter })`     |
| 2           | Global adapter   | `setAdapter(...)`                      |
| 3 (lowest)  | No adapter       | Only fixed and multi-day events are returned |

This means you can set a global adapter once and override it for specific calls when needed —
without affecting the rest of your application.

### 🔧 Example Adapter using `@internationalized/date`

```ts
import { CalendarType, setAdapter } from "persian-holidays";
import {
	CalendarDate,
	PersianCalendar,
	IslamicUmalquraCalendar,
	GregorianCalendar,
	getDayOfWeek,
	endOfMonth,
	startOfMonth,
} from "@internationalized/date";

const CALENDARS = {
	jalali: new PersianCalendar(),
	hijri: new IslamicUmalquraCalendar(),
	gregorian: new GregorianCalendar(),
};

const LOCALE = {
	jalali: "fa-IR",
	hijri: "fa-IR",
	gregorian: "en-US",
};

function normalizeWeekday(rawWeekday: number, calendar: CalendarType) {
	if (calendar === "jalali" || calendar === "hijri") {
		return (rawWeekday + 6) % 7;
	}
	return rawWeekday;
}

setAdapter({
	firstWeekdayOfMonth(calendar, year, month) {
		const cal = CALENDARS[calendar];
		const firstDay = startOfMonth(new CalendarDate(cal, year, month, 1));
		const raw = getDayOfWeek(firstDay, LOCALE[calendar]);
		return normalizeWeekday(raw, calendar);
	},

	monthLength(calendar, year, month) {
		const cal = CALENDARS[calendar];
		const last = endOfMonth(new CalendarDate(cal, year, month, 1));
		return last.day;
	},
});
```

## 🤝 Contribution & Support

This package is built with love and for non-commercial use under the [LICENSE](LICENSE).

You can support its continued development by:

- Contributing to the project
- Adding missing events via Issues or PRs
- Reporting bugs or suggesting features
- Following the Karfekr website and Telegram channels

<div align="center">

[![Website](https://img.shields.io/badge/Website-karfekr.ir-orange)](https://karfekr.ir)
[![Telegram Channel](https://img.shields.io/endpoint?color=neon&label=Karfekr&style=flat-square&url=https%3A%2F%2Ftg.sumanjay.workers.dev%2Fkarfekr)](https://t.me/karfekr)

</div>
