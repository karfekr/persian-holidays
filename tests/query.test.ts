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
	describe("fixed events", () => {
		it("should return jalali/fixed event on correct day", async () => {
			const events = await getEvents("jalali", 12, 1);
			expect(events.some((e) => e.id === "jalali-12-01-gneby")).toBe(true);
		});

		it("should not return jalali/fixed event on wrong day", async () => {
			const events = await getEvents("jalali", 12, 2);
			expect(events.some((e) => e.id === "jalali-12-01-gneby")).toBe(false);
		});

		it("should return gregorian/fixed event on correct day", async () => {
			const events = await getEvents("gregorian", 12, 1);
			expect(events.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(true);
		});

		it("should return hijri/fixed event on correct day", async () => {
			const events = await getEvents("hijri", 12, 1);
			expect(events.some((e) => e.id === "hijri-12-01-p59bj6")).toBe(true);
		});
	});

	describe("multi-day events", () => {
		it("should return Nowruz on first day", async () => {
			const events = await getEvents("jalali", 1, 1);
			expect(events.some((e) => e.id === "jalali-nowruz-holidays")).toBe(true);
		});

		it("should return Nowruz on fourth day", async () => {
			const events = await getEvents("jalali", 1, 4);
			expect(events.some((e) => e.id === "jalali-nowruz-holidays")).toBe(true);
		});

		it("should not return Nowruz on fifth day", async () => {
			const events = await getEvents("jalali", 1, 5);
			expect(events.some((e) => e.id === "jalali-nowruz-holidays")).toBe(false);
		});

		it("should return Ramadan on day 15 of month 9", async () => {
			const events = await getEvents("hijri", 9, 15);
			expect(events.some((e) => e.id === "hijri-ramadan")).toBe(true);
		});
	});

	describe("relative events", () => {
		it("should return day-candidates on candidate days", async () => {
			for (const day of [21, 23, 25, 27, 29]) {
				const events = await getEvents("hijri", 9, day);
				expect(events.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(true);
			}
		});

		it("should not return day-candidates on non-candidate day", async () => {
			const events = await getEvents("hijri", 9, 22);
			expect(events.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(false);
		});

		it("should find nth-weekday using adapter and year", async () => {
			setAdapter(createInternationalizedAdapter());
			// gregorian 2024/5 — first day = Wednesday(3) → second Sunday(0) = day 12
			const events = await getEvents("gregorian", 5, 12, { year: 2024 });
			expect(events.some((e) => e.id === "gregorian-mothers-day")).toBe(true);
		});
	});

	describe("category filtering", () => {
		it("should return only requested category events", async () => {
			const events = await getEvents("gregorian", 12, 1, { categories: ["government"] });
			expect(events.every((e) => e.categories.includes("government"))).toBe(true);
			expect(events.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(false);
		});

		it("without category should return all events", async () => {
			const events = await getEvents("gregorian", 12, 1);
			expect(events.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(true);
		});
	});

	describe("calendar field in output", () => {
		it("should return correct calendar in Event", async () => {
			const events = await getEvents("jalali", 12, 1);
			expect(events[0].calendar).toBe("jalali");
		});
	});

	describe("errors", () => {
		it("should throw if calendar is unknown", async () => {
			await expect(getEvents("unknown" as never, 1, 1)).rejects.toThrow(
				/No data registered for calendar/,
			);
		});

		it("should return empty array if no events exist", async () => {
			const events = await getEvents("gregorian", 6, 15);
			expect(Array.isArray(events)).toBe(true);
		});
	});
});

describe("getMonthEvents", () => {
	beforeEach(() => {
		setAdapter(createInternationalizedAdapter());
	});

	it("should return all jalali month 1 events (Nowruz)", async () => {
		const events = await getMonthEvents("jalali", 1, { year: 1403 });
		expect(events.some((e) => e.id === "jalali-nowruz-holidays")).toBe(true);
	});

	it("should return jalali fixed month 12 event", async () => {
		const events = await getMonthEvents("jalali", 12, { year: 1403 });
		expect(events.some((e) => e.id === "jalali-12-01-gneby")).toBe(true);
	});

	it("should return defense-week in both months it spans", async () => {
		const month6 = await getMonthEvents("jalali", 6, { year: 1403 });
		const month7 = await getMonthEvents("jalali", 7, { year: 1403 });
		expect(month6.some((e) => e.id === "jalali-defense-week")).toBe(true);
		expect(month7.some((e) => e.id === "jalali-defense-week")).toBe(true);
	});

	it("should return correct gregorian month 5 events", async () => {
		const events = await getMonthEvents("gregorian", 5, { year: 2024 });
		expect(events.some((e) => e.id === "gregorian-mothers-day")).toBe(true);
	});

	it("should return christmas events in month 12", async () => {
		const events = await getMonthEvents("gregorian", 12, { year: 2024 });
		expect(events.some((e) => e.id === "gregorian-christmas-week")).toBe(true);
	});

	it("should return Ramadan events in hijri month 9", async () => {
		const events = await getMonthEvents("hijri", 9, { year: 1445 });
		expect(events.some((e) => e.id === "hijri-ramadan")).toBe(true);
	});

	it("should return day-candidates in month 9", async () => {
		const events = await getMonthEvents("hijri", 9, { year: 1445 });
		expect(events.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(true);
	});

	it("category filter should work on getMonthEvents", async () => {
		const events = await getMonthEvents("gregorian", 12, {
			year: 2024,
			categories: ["government"],
		});
		expect(events.every((e) => e.categories.includes("government"))).toBe(true);
	});

	it("should not return duplicate events", async () => {
		const events = await getMonthEvents("hijri", 9, { year: 1445 });
		const ids = events.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe("getYearEvents", () => {
	beforeEach(() => {
		setAdapter(createInternationalizedAdapter());
	});

	it("should return all jalali events in a year", async () => {
		const events = await getYearEvents("jalali", 1403);
		const ids = events.map((e) => e.id);
		expect(ids).toContain("jalali-nowruz-holidays");
		expect(ids).toContain("jalali-defense-week");
		expect(ids).toContain("jalali-12-01-gneby");
		expect(ids).toContain("jalali-last-wednesday");
	});

	it("should return all gregorian events in a year", async () => {
		const events = await getYearEvents("gregorian", 2024);
		const ids = events.map((e) => e.id);
		expect(ids).toContain("gregorian-christmas-week");
		expect(ids).toContain("gregorian-earth-week");
		expect(ids).toContain("gregorian-12-01-14uslvu");
		expect(ids).toContain("gregorian-mothers-day");
		expect(ids).toContain("gregorian-thanksgiving");
	});

	it("should return all hijri events in a year", async () => {
		const events = await getYearEvents("hijri", 1445);
		const ids = events.map((e) => e.id);
		expect(ids).toContain("hijri-ramadan");
		expect(ids).toContain("hijri-eid-fitr-holidays");
		expect(ids).toContain("hijri-laylat-al-qadr");
		expect(ids).toContain("hijri-12-01-p59bj6");
	});

	it("category filter should work on getYearEvents", async () => {
		const events = await getYearEvents("gregorian", 2024, { categories: ["religious"] });
		expect(events.every((e) => e.categories.includes("religious"))).toBe(true);
		expect(events.some((e) => e.id === "gregorian-easter")).toBe(true);
	});

	it("should not return duplicate events in yearly output", async () => {
		const events = await getYearEvents("jalali", 1403);
		const ids = events.map((e) => e.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("should set correct calendar on all output events", async () => {
		const events = await getYearEvents("gregorian", 2024);
		expect(events.every((e) => e.calendar === "gregorian")).toBe(true);
	});
});
