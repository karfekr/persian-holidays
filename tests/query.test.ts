import { clearAdapter, setAdapter } from "src/core/adapter";
import { registerData } from "src/core/loader";
import { getEvents, getMonthEvents, getYearEvents } from "src/core/query";

import { createInternationalizedAdapter } from "./fixtures/adapter";
import { gregorianSample, hijriSample, jalaliSample } from "./fixtures/index";

beforeEach(() => {
	clearAdapter();
	vi.clearAllMocks();
	registerData("jalali", jalaliSample);
	registerData("gregorian", gregorianSample);
	registerData("hijri", hijriSample);
});

describe("getEvents", () => {
	describe("رویدادهای fixed", () => {
		it("باید رویداد jalali/fixed را در روز درست برگرداند", async () => {
			const events = await getEvents("jalali", 12, 1);
			expect(events.some((e) => e.id === "jalali-12-01-gneby")).toBe(true);
		});

		it("نباید رویداد jalali/fixed را در روز اشتباه برگرداند", async () => {
			const events = await getEvents("jalali", 12, 2);
			expect(events.some((e) => e.id === "jalali-12-01-gneby")).toBe(false);
		});

		it("باید رویداد gregorian/fixed را در روز درست برگرداند", async () => {
			const events = await getEvents("gregorian", 12, 1);
			expect(events.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(true);
		});

		it("باید رویداد hijri/fixed را در روز درست برگرداند", async () => {
			const events = await getEvents("hijri", 12, 1);
			expect(events.some((e) => e.id === "hijri-12-01-p59bj6")).toBe(true);
		});
	});

	describe("رویدادهای multi-day", () => {
		it("باید نوروز را در روز اول برگرداند", async () => {
			const events = await getEvents("jalali", 1, 1);
			expect(events.some((e) => e.id === "jalali-nowruz-holidays")).toBe(true);
		});

		it("باید نوروز را در روز چهارم برگرداند", async () => {
			const events = await getEvents("jalali", 1, 4);
			expect(events.some((e) => e.id === "jalali-nowruz-holidays")).toBe(true);
		});

		it("نباید نوروز را در روز پنجم برگرداند", async () => {
			const events = await getEvents("jalali", 1, 5);
			expect(events.some((e) => e.id === "jalali-nowruz-holidays")).toBe(false);
		});

		it("باید رمضان را در روز ۱۵ ماه ۹ برگرداند", async () => {
			const events = await getEvents("hijri", 9, 15);
			expect(events.some((e) => e.id === "hijri-ramadan")).toBe(true);
		});
	});

	describe("رویدادهای relative", () => {
		it("باید day-candidates را در روزهای کاندید برگرداند", async () => {
			for (const day of [21, 23, 25, 27, 29]) {
				const events = await getEvents("hijri", 9, day);
				expect(events.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(true);
			}
		});

		it("نباید day-candidates را در روز غیرکاندید برگرداند", async () => {
			const events = await getEvents("hijri", 9, 22);
			expect(events.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(false);
		});

		it("باید nth-weekday را با adapter و year پیدا کند", async () => {
			setAdapter(createInternationalizedAdapter());
			// gregorian 2024/5 — اول ماه = چهارشنبه(3) → دومین یکشنبه(0) = روز 12
			const events = await getEvents("gregorian", 5, 12, { year: 2024 });
			expect(events.some((e) => e.id === "gregorian-mothers-day")).toBe(true);
		});
	});

	describe("فیلتر category", () => {
		it("باید فقط رویدادهای دسته خواسته‌شده را برگرداند", async () => {
			const events = await getEvents("gregorian", 12, 1, { categories: ["government"] });
			expect(events.every((e) => e.categories.includes("government"))).toBe(true);
			expect(events.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(false);
		});

		it("بدون category باید همه رویدادها را برگرداند", async () => {
			const events = await getEvents("gregorian", 12, 1);
			expect(events.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(true);
		});
	});

	describe("فیلد calendar در خروجی", () => {
		it("باید calendar درست را در Event برگرداند", async () => {
			const events = await getEvents("jalali", 12, 1);
			expect(events[0].calendar).toBe("jalali");
		});
	});

	describe("خطاها", () => {
		it("باید خطا بدهد اگر calendar ناشناخته باشد", async () => {
			await expect(getEvents("unknown" as never, 1, 1)).rejects.toThrow(
				/No data registered for calendar/,
			);
		});

		it("باید Promise‌ای با آرایه خالی برگرداند اگر هیچ رویدادی در آن روز نباشد", async () => {
			const events = await getEvents("gregorian", 6, 15);
			expect(Array.isArray(events)).toBe(true);
		});
	});
});

describe("getMonthEvents", () => {
	beforeEach(() => {
		setAdapter(createInternationalizedAdapter());
	});

	it("باید تمام رویدادهای ماه ۱ جلالی (نوروز) را برگرداند", async () => {
		const events = await getMonthEvents("jalali", 1, { year: 1403 });
		expect(events.some((e) => e.id === "jalali-nowruz-holidays")).toBe(true);
	});

	it("باید رویداد fixed ماه ۱۲ جلالی را برگرداند", async () => {
		const events = await getMonthEvents("jalali", 12, { year: 1403 });
		expect(events.some((e) => e.id === "jalali-12-01-gneby")).toBe(true);
	});

	it("باید defense-week که از ماه ۶ به ۷ می‌رود را در هر دو ماه برگرداند", async () => {
		const month6 = await getMonthEvents("jalali", 6, { year: 1403 });
		const month7 = await getMonthEvents("jalali", 7, { year: 1403 });
		expect(month6.some((e) => e.id === "jalali-defense-week")).toBe(true);
		expect(month7.some((e) => e.id === "jalali-defense-week")).toBe(true);
	});

	it("باید رویدادهای ماه ۵ میلادی را درست برگرداند", async () => {
		const events = await getMonthEvents("gregorian", 5, { year: 2024 });
		expect(events.some((e) => e.id === "gregorian-mothers-day")).toBe(true);
	});

	it("باید رویدادهای کریسمس را در ماه ۱۲ برگرداند", async () => {
		const events = await getMonthEvents("gregorian", 12, { year: 2024 });
		expect(events.some((e) => e.id === "gregorian-christmas-week")).toBe(true);
	});

	it("باید رویدادهای رمضان را در ماه ۹ هجری برگرداند", async () => {
		const events = await getMonthEvents("hijri", 9, { year: 1445 });
		expect(events.some((e) => e.id === "hijri-ramadan")).toBe(true);
	});

	it("باید day-candidates شب قدر را در ماه ۹ برگرداند", async () => {
		const events = await getMonthEvents("hijri", 9, { year: 1445 });
		expect(events.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(true);
	});

	it("فیلتر category باید روی getMonthEvents هم کار کند", async () => {
		const events = await getMonthEvents("gregorian", 12, {
			year: 2024,
			categories: ["government"],
		});
		expect(events.every((e) => e.categories.includes("government"))).toBe(true);
	});

	it("نباید event تکراری در خروجی باشد", async () => {
		const events = await getMonthEvents("hijri", 9, { year: 1445 });
		const ids = events.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe("getYearEvents", () => {
	beforeEach(() => {
		setAdapter(createInternationalizedAdapter());
	});

	it("باید تمام رویدادهای jalali را در یک سال برگرداند", async () => {
		const events = await getYearEvents("jalali", 1403);
		const ids = events.map((e) => e.id);
		expect(ids).toContain("jalali-nowruz-holidays");
		expect(ids).toContain("jalali-defense-week");
		expect(ids).toContain("jalali-12-01-gneby");
		// رویداد relative هم باید باشد
		expect(ids).toContain("jalali-last-wednesday");
	});

	it("باید تمام رویدادهای gregorian را در یک سال برگرداند", async () => {
		const events = await getYearEvents("gregorian", 2024);
		const ids = events.map((e) => e.id);
		expect(ids).toContain("gregorian-christmas-week");
		expect(ids).toContain("gregorian-earth-week");
		expect(ids).toContain("gregorian-12-01-14uslvu");
		expect(ids).toContain("gregorian-mothers-day");
		expect(ids).toContain("gregorian-thanksgiving");
	});

	it("باید تمام رویدادهای hijri را در یک سال برگرداند", async () => {
		const events = await getYearEvents("hijri", 1445);
		const ids = events.map((e) => e.id);
		expect(ids).toContain("hijri-ramadan");
		expect(ids).toContain("hijri-eid-fitr-holidays");
		expect(ids).toContain("hijri-laylat-al-qadr");
		expect(ids).toContain("hijri-12-01-p59bj6");
	});

	it("فیلتر category باید روی getYearEvents کار کند", async () => {
		const events = await getYearEvents("gregorian", 2024, { categories: ["religious"] });
		expect(events.every((e) => e.categories.includes("religious"))).toBe(true);
		expect(events.some((e) => e.id === "gregorian-easter")).toBe(true);
	});

	it("نباید event تکراری در خروجی سالانه باشد", async () => {
		const events = await getYearEvents("jalali", 1403);
		const ids = events.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("باید calendar درست را در همه Event‌های خروجی قرار دهد", async () => {
		const events = await getYearEvents("gregorian", 2024);
		expect(events.every((e) => e.calendar === "gregorian")).toBe(true);
	});
});
