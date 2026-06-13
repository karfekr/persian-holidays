import { matchDay, matchRange } from "../src/core/engine.js";
import { jalaliSample, gregorianSample } from "./fixtures.js";
import { setAdapter, clearAdapter } from "../src/core/adapter.js";

afterAll(() => clearAdapter());

describe("matchDay — fixed events", () => {
	test("returns event on exact date", () => {
		const res = matchDay(jalaliSample, "jalali", 1, 1);
		const ids = res.map((e) => e.id);
		expect(ids).toContain("jalali-nowruz-day1");
	});

	test("does not return event on wrong date", () => {
		const res = matchDay(jalaliSample, "jalali", 1, 5);
		const ids = res.map((e) => e.id);
		expect(ids).not.toContain("jalali-nowruz-day1");
	});

	test("attaches correct calendar type", () => {
		const [event] = matchDay(jalaliSample, "jalali", 1, 1);
		expect(event.calendar).toBe("jalali");
	});
});

describe("matchDay — multi-day events", () => {
	test("returns multi-day event on start date", () => {
		const res = matchDay(jalaliSample, "jalali", 1, 1);
		expect(res.map((e) => e.id)).toContain("jalali-nowruz-holidays");
	});

	test("returns multi-day event on middle date", () => {
		const res = matchDay(jalaliSample, "jalali", 1, 2);
		expect(res.map((e) => e.id)).toContain("jalali-nowruz-holidays");
	});

	test("returns multi-day event on end date", () => {
		const res = matchDay(jalaliSample, "jalali", 1, 4);
		expect(res.map((e) => e.id)).toContain("jalali-nowruz-holidays");
	});

	test("does not return multi-day event outside range", () => {
		const res = matchDay(jalaliSample, "jalali", 1, 5);
		expect(res.map((e) => e.id)).not.toContain("jalali-nowruz-holidays");
	});
});

describe("matchDay — category filter", () => {
	test("returns only matching category", () => {
		// Nowruz day 1 is in month 1 day 1 — categories: government
		const res = matchDay(
			jalaliSample,
			"jalali",
			2,
			12,
			["historical"],
			undefined,
		);
		expect(res.map((e) => e.id)).toContain("jalali-teachers-day");
	});

	test("excludes non-matching category", () => {
		const res = matchDay(
			jalaliSample,
			"jalali",
			2,
			12,
			["religious"],
			undefined,
		);
		expect(res).toHaveLength(0);
	});
});

describe("matchDay — relative events", () => {
	// In 2024, Mother's Day (2nd Sunday of May) is May 12
	test("resolves relative event correctly for year 2024", () => {
		const res = matchDay(gregorianSample, "gregorian", 5, 12, undefined, 2024);
		expect(res.map((e) => e.id)).toContain("gregorian-mothers-day");
	});

	test("does not match relative event on wrong date", () => {
		const res = matchDay(gregorianSample, "gregorian", 5, 13, undefined, 2024);
		expect(res.map((e) => e.id)).not.toContain("gregorian-mothers-day");
	});
});

describe("matchRange", () => {
	test("returns all events in full Farvardin range", () => {
		const res = matchRange(jalaliSample, "jalali", 1, 1, 1, 30);
		const ids = res.map((e) => e.id);
		expect(ids).toContain("jalali-nowruz-day1");
		expect(ids).toContain("jalali-nowruz-holidays");
		expect(ids).not.toContain("jalali-teachers-day"); // month 2
	});

	test("returns teacher day in correct month range", () => {
		const res = matchRange(jalaliSample, "jalali", 2, 1, 2, 30);
		expect(res.map((e) => e.id)).toContain("jalali-teachers-day");
	});

	test("deduplicates events that span the range", () => {
		const res = matchRange(jalaliSample, "jalali", 1, 1, 1, 4);
		const ids = res.map((e) => e.id);
		const unique = [...new Set(ids)];
		expect(ids).toEqual(unique);
	});

	test("returns empty array for empty range", () => {
		const res = matchRange(jalaliSample, "jalali", 6, 1, 6, 30);
		expect(res).toHaveLength(0);
	});
});
