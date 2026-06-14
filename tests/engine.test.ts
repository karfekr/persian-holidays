import { clearAdapter, setAdapter } from "src/core/adapter";
import { matchDay, matchRange } from "src/core/engine";
import type { RawEvent } from "src/types";

import { createInternationalizedAdapter } from "./fixtures/adapter";
import { gregorianSample, hijriSample, jalaliSample } from "./fixtures/index";

beforeEach(() => {
	clearAdapter();
	vi.clearAllMocks();
});

describe("matchDay", () => {
	describe("fixed events", () => {
		it("باید رویداد fixed را در روز دقیق برگرداند", () => {
			const result = matchDay(jalaliSample, "jalali", 12, 1);
			expect(result).toHaveLength(1);
			expect(result[0].id).toBe("jalali-12-01-gneby");
		});

		it("نباید رویداد fixed را در روز اشتباه برگرداند", () => {
			const result = matchDay(jalaliSample, "jalali", 12, 2);
			const fixed = result.find((e) => e.id === "jalali-12-01-gneby");
			expect(fixed).toBeUndefined();
		});

		it("باید رویداد fixed gregorian را برگرداند", () => {
			const result = matchDay(gregorianSample, "gregorian", 12, 1);
			expect(result.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(true);
		});
	});

	describe("multi-day events", () => {
		it("باید رویداد multi-day را در روز شروع برگرداند", () => {
			const result = matchDay(jalaliSample, "jalali", 1, 1);
			expect(result.some((e) => e.id === "jalali-nowruz-holidays")).toBe(true);
		});

		it("باید رویداد multi-day را در وسط بازه برگرداند", () => {
			const result = matchDay(jalaliSample, "jalali", 1, 3);
			expect(result.some((e) => e.id === "jalali-nowruz-holidays")).toBe(true);
		});

		it("باید رویداد multi-day را در روز پایان برگرداند", () => {
			const result = matchDay(jalaliSample, "jalali", 1, 4);
			expect(result.some((e) => e.id === "jalali-nowruz-holidays")).toBe(true);
		});

		it("نباید رویداد multi-day را خارج از بازه برگرداند", () => {
			const result = matchDay(jalaliSample, "jalali", 1, 5);
			expect(result.some((e) => e.id === "jalali-nowruz-holidays")).toBe(false);
		});

		it("باید رویداد multi-day که از ماه ۶ به ۷ ادامه دارد (defense week) را صحیح پردازش کند", () => {
			const onStart = matchDay(jalaliSample, "jalali", 6, 31);
			expect(onStart.some((e) => e.id === "jalali-defense-week")).toBe(true);

			const crossMonth = matchDay(jalaliSample, "jalali", 7, 1);
			expect(crossMonth.some((e) => e.id === "jalali-defense-week")).toBe(true);

			const onEnd = matchDay(jalaliSample, "jalali", 7, 6);
			expect(onEnd.some((e) => e.id === "jalali-defense-week")).toBe(true);

			const after = matchDay(jalaliSample, "jalali", 7, 7);
			expect(after.some((e) => e.id === "jalali-defense-week")).toBe(false);
		});

		it("باید رویداد‌های hijri چند روزه را صحیح برگرداند", () => {
			const result = matchDay(hijriSample, "hijri", 10, 2);
			expect(result.some((e) => e.id === "hijri-eid-fitr-holidays")).toBe(true);
		});
	});

	describe("relative events", () => {
		it("باید رویداد day-candidates را در هر روز کاندید برگرداند", () => {
			// laylat-al-qadr candidates: 21, 23, 25, 27, 29 in month 9
			for (const day of [21, 23, 25, 27, 29]) {
				const result = matchDay(hijriSample, "hijri", 9, day);
				expect(result.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(true);
			}
		});

		it("نباید رویداد day-candidates را در روز غیرکاندید برگرداند", () => {
			const result = matchDay(hijriSample, "hijri", 9, 22);
			expect(result.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(false);
		});

		it("باید رویداد nth-weekday-of-month را با adapter پیدا کند", () => {
			setAdapter(createInternationalizedAdapter());
			// gregorian 2024/5: اول ماه = چهارشنبه (3)، دومین یکشنبه (0) = روز 12
			const result = matchDay(gregorianSample, "gregorian", 5, 12, undefined, 2024);
			expect(result.some((e) => e.id === "gregorian-mothers-day")).toBe(true);
		});

		it("نباید رویداد relative را بدون year و بدون adapter برگرداند (skipOnMissingYear)", () => {
			// بدون year و بدون adapter → skip
			const result = matchDay(gregorianSample, "gregorian", 5, 12, undefined, undefined);
			expect(result.some((e) => e.id === "gregorian-mothers-day")).toBe(false);
		});
	});

	describe("category filtering", () => {
		it("باید فقط رویدادهای دسته‌بندی خواسته‌شده را برگرداند", () => {
			const result = matchDay(gregorianSample, "gregorian", 12, 1, ["international"]);
			expect(result.every((e) => e.categories.includes("international"))).toBe(true);
		});

		it("نباید رویداد بدون دسته‌بندی مطابق را برگرداند", () => {
			const result = matchDay(gregorianSample, "gregorian", 12, 1, ["government"]);
			expect(result.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(false);
		});

		it("با آرایه خالی باید همه رویدادها را برگرداند", () => {
			const result = matchDay(jalaliSample, "jalali", 12, 1, []);
			expect(result.some((e) => e.id === "jalali-12-01-gneby")).toBe(true);
		});
	});

	describe("شکل Event خروجی", () => {
		it("باید فیلدهای calendar و type را به‌درستی در خروجی قرار دهد", () => {
			const result = matchDay(jalaliSample, "jalali", 12, 1);
			expect(result[0]).toMatchObject({
				id: "jalali-12-01-gneby",
				calendar: "jalali",
				type: "fixed",
				isHolidayInIran: false,
			});
			expect(result[0].title).toEqual({ fa: "آبسالان", en: "Absalan" });
		});
	});

	describe("edge cases", () => {
		it("با لیست خالی باید آرایه خالی برگرداند", () => {
			expect(matchDay([], "gregorian", 1, 1)).toEqual([]);
		});

		it("رویداد fixed بدون month/day نباید match کند", () => {
			const broken: RawEvent[] = [
				{
					id: "broken",
					type: "fixed",
					title: { fa: "", en: "" },
					categories: [],
					isHolidayInIran: false,
				},
			];
			expect(matchDay(broken, "gregorian", 1, 1)).toEqual([]);
		});

		it("رویداد relative بدون rule نباید match کند", () => {
			const noRule: RawEvent[] = [
				{
					id: "no-rule",
					type: "relative",
					title: { fa: "", en: "" },
					categories: [],
					isHolidayInIran: false,
				},
			];
			expect(matchDay(noRule, "gregorian", 1, 1)).toEqual([]);
		});
	});
});

describe("matchRange", () => {
	describe("fixed events", () => {
		it("باید رویداد fixed را در بازه پیدا کند", () => {
			const result = matchRange(gregorianSample, "gregorian", 11, 1, 12, 31);
			expect(result.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(true);
		});

		it("نباید رویداد خارج از بازه را برگرداند", () => {
			const result = matchRange(gregorianSample, "gregorian", 1, 1, 6, 30);
			expect(result.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(false);
		});
	});

	describe("multi-day events", () => {
		it("باید رویداد multi-day با overlap کامل را برگرداند", () => {
			const result = matchRange(gregorianSample, "gregorian", 12, 1, 12, 31);
			expect(result.some((e) => e.id === "gregorian-christmas-week")).toBe(true);
		});

		it("باید رویداد multi-day که فقط بخشی از آن در بازه است را برگرداند", () => {
			// christmas-week: 12/24-12/26 — query: 12/25-12/31
			const result = matchRange(gregorianSample, "gregorian", 12, 25, 12, 31);
			expect(result.some((e) => e.id === "gregorian-christmas-week")).toBe(true);
		});

		it("نباید رویداد multi-day بدون overlap را برگرداند", () => {
			// christmas-week: 12/24-12/26 — query: 1/1-12/23
			const result = matchRange(gregorianSample, "gregorian", 1, 1, 12, 23);
			expect(result.some((e) => e.id === "gregorian-christmas-week")).toBe(false);
		});

		it("باید رویداد multi-day cross-month را صحیح مدیریت کند", () => {
			// defense-week: 6/31 - 7/6
			const result = matchRange(jalaliSample, "jalali", 6, 1, 7, 31);
			expect(result.some((e) => e.id === "jalali-defense-week")).toBe(true);
		});
	});

	describe("deduplication", () => {
		it("نباید رویداد تکراری در نتیجه باشد حتی اگر چند بار match شود", () => {
			// day-candidates در بازه ماه 9 - تمام candidates در بازه
			const result = matchRange(hijriSample, "hijri", 9, 1, 9, 30);
			const ids = result.map((e) => e.id);
			const unique = new Set(ids);
			expect(ids.length).toBe(unique.size);
		});
	});

	describe("relative events در بازه", () => {
		it("باید رویداد day-candidates را اگر حداقل یک candidate در بازه باشد برگرداند", () => {
			// candidates: 21,23,25,27,29 — query: month 9, days 20-22
			const result = matchRange(hijriSample, "hijri", 9, 20, 9, 22);
			expect(result.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(true);
		});

		it("نباید رویداد day-candidates را اگر هیچ candidate در بازه نباشد برگرداند", () => {
			// candidates: 21,23,25,27,29 — query: month 9, days 10-20 (20 not a candidate)
			const result = matchRange(hijriSample, "hijri", 9, 10, 9, 20);
			expect(result.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(false);
		});
	});

	describe("category filtering", () => {
		it("باید فیلتر category روی matchRange هم اعمال شود", () => {
			const result = matchRange(gregorianSample, "gregorian", 1, 1, 12, 31, ["government"]);
			expect(result.every((e) => e.categories.includes("government"))).toBe(true);
		});

		it("باید رویدادهای چند دسته‌بندی را صحیح فیلتر کند", () => {
			const result = matchRange(gregorianSample, "gregorian", 1, 1, 12, 31, [
				"religious",
				"international",
			]);
			expect(
				result.every(
					(e) => e.categories.includes("religious") || e.categories.includes("international"),
				),
			).toBe(true);
		});
	});

	describe("edge cases", () => {
		it("با لیست خالی باید آرایه خالی برگرداند", () => {
			expect(matchRange([], "gregorian", 1, 1, 12, 31)).toEqual([]);
		});

		it("بازه تک‌روزه باید مثل matchDay عمل کند", () => {
			const rangeResult = matchRange(gregorianSample, "gregorian", 12, 1, 12, 1);
			const dayResult = matchDay(gregorianSample, "gregorian", 12, 1);
			expect(rangeResult.map((e) => e.id).sort()).toEqual(dayResult.map((e) => e.id).sort());
		});
	});
});
