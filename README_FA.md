<div dir="ltr" align=center>

[**فارسی**](README_FA.md) / [**English**](README.md)

</div>

<div dir="rtl">

# 📦 پکیج persian-holidays

موتور یکپارچه‌ی مناسبت‌ها و تعطیلات برای تقویم‌های جلالی (شمسی)، هجری قمری و میلادی؛ همراه با
داده‌های دوزبانه(فارسی و انگلیسی)، دسته‌بندی رسمی تعطیلات و پشتیبانی از مناسبت‌های ثابت، چندروزه و
پویا (قاعده‌محور).

## ✨ ویژگی‌ها

- **پشتیبانی از سه تقویم در یک پکیج**: جلالی، هجری قمری و میلادی
- **پشتیبانی از مناسبت‌های پیچیده**: شامل مناسبت‌هایی مانند عید پاک (میلادی) و چهارشنبه‌سوری (جلالی)
- **خروجی سازگار با Tree Shaking** بر اساس میزان استفاده‌ی واقعی
- **بدون هیچ وابستگی(Zero Dependencies)**
- **سیستم Adapter منعطف**: یک Adapter سراسری تعریف کنید یا برای هر فراخوانی Adapter اختصاصی ارسال
  کنید
- **عناوین دوزبانه برای رویدادها**
- **فیلترهای دسته‌بندی منعطف و هم‌پوشان**

## 📦 نصب

<div dir="ltr">

```bash
npm install persian-holidays
```

</div>

## 🚀 نحوه استفاده

تمام مناسبت‌ها در سه تقویم به دو دسته‌ی اصلی تقسیم می‌شوند:

- **مناسبت‌های ثابت (Fixed & Multi-Days Events):** مناسبت‌هایی که در تمام سال‌ها با یک روز و ماه
  مشخص تعریف می‌شوند.
- **مناسبت‌های پویا (Dynamic Events):** مناسبت‌هایی مانند چهارشنبه‌سوری (جلالی) یا روز شکرگزاری
  (میلادی) که در همه‌ی سال‌ها روی یک روز و ماه ثابت قرار نمی‌گیرند.

> مناسبت‌های پویا نیازمند تنظیم یک Adapter برای تبدیل و محاسبات تاریخ هستند.

> اگر فقط به مناسبت‌های ثابت نیاز دارید، می‌توانید بدون پیکربندی Adapter از این پکیج استفاده کنید.

### `getEvents(calendar, month, day, options?)`

تمام مناسبت‌های یک روز مشخص از ماه را برمی‌گرداند.

<div dir="ltr">

```js
const events = getEvents("jalali", 9, 20);
```

```ts
getEvents(
  calendar: 'jalali' | 'gregorian' | 'hijri',
  month: number,
  day: number,
  options?: {
    year?: number; // برای مناسبت‌های پویا الزامی است
    categories?: CategoryType[];
    adapter?: CalendarAdapter; // آداپتر را برای این فراخوانی بازنویسی می‌کند
  }
): Event[]
```

</div>

### `getMonthEvents(calendar, month, options?)`

تمام مناسبت‌های یک ماه را برمی‌گرداند.

<div dir="ltr">

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
    adapter?: CalendarAdapter; // آداپتر را برای این فراخوانی بازنویسی می‌کند
  }
): Event[]
```

</div>

### `getYearEvents(calendar, year, options?)`

تمام مناسبت‌های یک سال را برمی‌گرداند.

<div dir="ltr">

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
    adapter?: CalendarAdapter; // آداپتر را برای این فراخوانی بازنویسی می‌کند
  }
): Event[]
```

</div>

## 📘 ساختار مناسبت‌ها

<div dir="ltr">

```ts
type Events = {
	id: string;
	title: {
		fa: string;
		en: string;
	};
	categories: CategoryType[];
	isHolidayInIran: boolean;
	calendar: CalendarType;
	type: "fixed" | "multi-day" | "relative";
}[];
```

</div>

## ⚙️ پیکربندی Adapter

### چرا Adapter؟

برای محاسبه‌ی مناسبت‌های پویا، موتور به دو اطلاعات اساسی نیاز دارد:

1. اولین روز هفته‌ی یک ماه مشخص چیست؟
2. آن ماه چند روز دارد؟

به‌جای وابسته شدن به یک کتابخانه‌ی خاص برای مدیریت تاریخ، این مسئولیت از طریق Adapter به کاربر
واگذار شده است.

هر شیئی که رابط زیر را پیاده‌سازی کند، یک Adapter معتبر محسوب می‌شود:

<div dir="ltr">

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

</div>

### 🔢 اولویت Adapterها

پکیج Adapter مورد استفاده را با ترتیب زیر انتخاب می‌کند:

<div align="center" dir="ltr">

| اولویت | منبع           | نحوه استفاده                  |
| ------ | -------------- | ----------------------------- |
| 1      | آداپتر اختصاصی | `getEvents(..., { adapter })` |
| 2      | آداپتر سراسری  | `setAdapter(...)`             |
| 3      | بدون آداپتر    | فقط مناسبت‌های ثابت و چندروزه |

</div>

این ساختار به شما اجازه می‌دهد یک Adapter سراسری تعریف کنید و در صورت نیاز، برای فراخوانی‌های خاص آن
را موقتاً جایگزین کنید؛ بدون اینکه سایر بخش‌های برنامه تحت تأثیر قرار بگیرند.

### 🔧 نمونه Adapter با استفاده از `@internationalized/date`

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

</div>

## 🤝 مشارکت و حمایت

این پکیج با عشق توسعه داده شده و تحت مجوز موجود در فایل LICENSE برای استفاده‌های غیرتجاری منتشر شده
است.

شما می‌توانید از ادامه‌ی توسعه‌ی این پروژه با روش‌های زیر حمایت کنید:

- مشارکت مستقیم در توسعه‌ی پروژه
- افزودن مناسبت‌های جدید از طریق Issue یا Pull Request
- گزارش باگ‌ها یا پیشنهاد قابلیت‌های جدید
- دنبال کردن وب‌سایت و کانال‌های تلگرام کرفکر

<div align=center>

[![Website](https://img.shields.io/badge/Website-karfekr.ir-orange)](https://karfekr.ir)
[![Telegram Channel](https://img.shields.io/endpoint?color=neon&label=Karfekr&style=flat-square&url=https%3A%2F%2Ftg.sumanjay.workers.dev%2Fkarfekr)](https://t.me/karfekr)

</div>

</div>
