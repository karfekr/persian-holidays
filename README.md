<div dir="rtl">

# پکیج persian-holidays

یک موتور یکپارچه برای مناسبت‌ها و تعطیلات تقویم‌های شمسی، هجری قمری و میلادی — با داده‌های دوزبانه (فارسی و انگلیسی)، دسته‌بندی تعطیلات رسمی، و پشتیبانی از مناسبت‌های ثابت، چند‌روزه، و وابسته به قواعد نامنظم.

## امکانات

- **مناسبات سه تقویم**: در یک پکیج: هجری شمسی(جلالی)، هجری قمری، میلادی
- **شامل مناسبت‌های پیچیده**: مناسبت‌هایی مثل عید پاک میلادی و چهارشنبه‌سوری شمسی
- خروجی مبتنی بر استفاده‌ی کاربر و **Tree-Shaking**
- بدون وابستگی پیشفرض خارجی یا **zero-dependency**
- دارای **Adapter system** که به کاربر اجازه می‌دهد از پکیج تبدیل تاریخ دلخواهش استفاده کند.
- **عنوان دوزبانه برای مناسبت‌ها**
- **فیلترهای دسته‌بندی متنوع و هم‌پوشان**

## نصب پکیج

<div dir="ltr">

```bash
npm install persian-holidays
```

</div>

## نحوه‌ی استفاده

می‌توان تمام مناسبت‌های تقویم را در دو دسته قرار داد:

- **مناسبت‌های ثابت**: مناسبت‌هایی که می‌توان به صورت روز/ماه برای همه‌ی سال‌ها مشخص کرد.
- **مناسبت‌های متغیر**: مناسبت‌هایی مانند چهارشنبه سوری شمسی یا روز شکرگزاری میلادی که نمی‌توان به صورت روز/ماه برای همه‌ی سال‌ها مشخص کرد.

> مناسبت‌های غیر ثابت نیازمند کانفیگ تبدیل تاریخ هستند که با تنظیم یکباره‌ی adapter قابل بهره‌برداری است.

> اگر تنها به مناسبت‌های ثابت نیاز دارید می‌توانید بدون adapter از این پکیج استفاده کنید.

### `getEvents(calendar, month, day, options?)`

تمام مناسبت‌های یک روز از ماه

<div dir="ltr">

```js
const events = await getEvents("jalali", 09, 20);
```

```ts
getEvents(
  calendar: 'jalali' | 'gregorian' | 'hijri',
  month: number,
  day: number,
  options?: {
    year?: number; // برای مناسبت‌های متغیر
    categories?: Category[];
  }
): Promise<Event[]>
```

</div>

### `getMonthEvents(calendar, month, options?)`

تمام مناسبت‌های یک ماه را برمی‌گرداند.

<div dir="ltr">

```js
const events = await getMonthEvents("jalali", 1, { year: 1403 });
```

```ts
getMonthEvents(
  calendar: 'jalali' | 'gregorian' | 'hijri',
  month: number,
  options?: {
    year?: number; // برای مناسبت‌های متغیر
    categories?: Category[];
  }
): Promise<Event[]>
```

</div>

### `getYearEvents(calendar, year, options?)`

تمام مناسبت‌های یک سال را برمی‌گرداند.

<div dir="ltr">

```js
const allOf1403 = await getYearEvents("jalali", 1403);
const religiousOf1403 = await getYearEvents("jalali", 1403, {
	categories: ["religious", "shia"],
});
```

```ts
getYearEvents(
  calendar: 'jalali' | 'gregorian' | 'hijri',
  year: number,
  options?: {
    categories?: Category[];
  }
): Promise<Event[]>
```

</div>

### ساختار مناسبت‌ها

<div dir="ltr">

```ts
type Event = {
	id: string;
	title: {
		fa: string;
		en: string;
	};
	categories: Category[];
	isHolidayInIran: boolean;
	calendar: CalendarType;
	type: "fixed" | "multi-day" | "relative";
};
```

</div>

## کانفیگ Adapter

### چرا adapter؟

موتور پکیج به دو چیز درباره‌ی تقویم نیاز دارد تا مناسبت‌های متغیر را محاسبه کند:

1. اولین روز هفته‌ی هر ماه چیست؟
2. هر ماه چند روز دارد؟

پکیج حاضر به جای اینکه خود را به پکیج تبدیل تاریخ خاصی وابسته کند، این مسئولیت را به کاربر واگذار کرده است.

هر objectای که دو function زیر را داشته باشد یک adapter معتبر است:

<div dir="ltr">

```ts
interface CalendarAdapter {
	// باید اولین روز هفته‌ی ماه را با استاندارد عددی برگرداند(یکشنبه = 0)
	firstWeekdayOfMonth(
		calendar: "jalali" | "gregorian" | "hijri",
		year: number,
		month: number,
	): number;

	// باید تعداد روزهای ماه را برگرداند
	daysInMonth(
		calendar: "jalali" | "gregorian" | "hijri",
		year: number,
		month: number,
	): number;
}
```

</div>

#### مثال: adapter مبتنی بر `moment`

<div dir="ltr">

```js
import { setAdapter } from "persian-holidays";
import moment from "moment";
import "moment-jalaali";
import "moment-hijri";

const calendars = {
	jalali: {
		create: (y, m, d) => moment(`${y}/${m}/${d}`, "jYYYY/jM/jD"),
		daysInMonth: (y, m) => moment.jDaysInMonth(y, m - 1),
	},
	hijri: {
		create: (y, m, d) => moment(`${y}/${m}/${d}`, "iYYYY/iM/iD"),
	},
	gregorian: {
		create: (y, m, d) => moment(new Date(y, m - 1, d)),
	},
};

setAdapter({
	firstWeekdayOfMonth(calendar, year, month) {
		return calendars[calendar].create(year, month, 1).day();
	},
	daysInMonth(calendar, year, month) {
		return calendars[calendar].daysInMonth
			? config.daysInMonth(year, month)
			: config.create(year, month, 1).daysInMonth();
	},
});
```

#### مثال: adapter مبتنی بر `internationalized/date`

```js
import { setAdapter } from "persian-holidays";
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

function normaliseWeekday(rawWeekday, calendar) {
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
		return normaliseWeekday(raw, calendar);
	},

	daysInMonth(calendar, year, month) {
		const cal = CALENDARS[calendar];
		const last = endOfMonth(new CalendarDate(cal, year, month, 1));
		return last.day;
	},
}
```

</div>

## همراهی و مشارکت در پروژه

این افزونه با عشق و با مقاصد غیرتجاری و تحت [این لایسنس](LICENSE) توسعه داده شده است.

شما می‌توانید به شیوه‌های زیر از ادامه‌ی فعالیت‌های ما حمایت کنید:

- مشارکت در توسعه‌ی این پکیج
- با افزودن یک مناسبت ناموجود از طریق Issues یا PR
- گزارش خطا یا پیشنهاد یک ویژگی برای توسعه در Issues
- دنبال کردن سایت و کانال تلگرامی کارفکر

<div align=center>

[![Website](https://img.shields.io/badge/Website-karfekr.ir-orange)](https://karfekr.ir)
[![Telegram Channel](https://img.shields.io/endpoint?color=neon&label=Karfekr&style=flat-square&url=https%3A%2F%2Ftg.sumanjay.workers.dev%2Fkarfekr)](https://t.me/karfekr)
[![Telegram Group](https://img.shields.io/endpoint?label=ObsidianFarsi&style=flat-square&url=https%3A%2F%2Ftg.sumanjay.workers.dev%2FObsidianFarsi&color=blue)](https://t.me/ObsidianFarsi)

</div>

</div>
