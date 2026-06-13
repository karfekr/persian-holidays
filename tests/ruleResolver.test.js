import { afterAll, describe, expect, test } from "vitest";
import { resolveRule } from "../src/core/ruleResolver.js";
import { setAdapter, clearAdapter } from "../src/core/adapter.js";
import { createInternationalizedAdapter } from "./fixtures/adapter.js";
import { beforeAll } from "vitest";

beforeAll(() => setAdapter(createInternationalizedAdapter()));
afterAll(() => clearAdapter());

describe("resolveRule — registry dispatch", () => {
	test("resolves day-candidates without year", () => {
		const pts = resolveRule(
			{ base: "day-candidates", month: 9, candidates: [21, 23] },
			{},
		);

		expect(pts).toEqual([
			{ month: 9, day: 21 },
			{ month: 9, day: 23 },
		]);
	});

	test("day-candidates throws when month is missing", () => {
		expect(() =>
			resolveRule({ base: "day-candidates", candidates: [1] }, {}),
		).toThrow(/rule\.month/);
	});

	test("day-candidates throws when candidates are empty", () => {
		expect(() =>
			resolveRule({ base: "day-candidates", month: 9, candidates: [] }, {}),
		).toThrow(/non-empty/);
	});

	test("computus returns empty result when year is absent", () => {
		// Intentional exception to the fail-fast policy.
		const pts = resolveRule({ base: "computus", offsetDays: 0 }, {});
		expect(pts).toEqual([]);
	});

	test("nth-weekday-of-month requires year", () => {
		expect(() =>
			resolveRule(
				{
					base: "nth-weekday-of-month",
					month: 5,
					weekday: 0,
					occurrence: "second",
				},
				{},
			),
		).toThrow(/requires ctx\.year/);
	});

	test("nth-weekday-of-month requires month", () => {
		expect(() =>
			resolveRule(
				{
					base: "nth-weekday-of-month",
					weekday: 0,
					occurrence: "second",
				},
				{ year: 2024 },
			),
		).toThrow(/rule\.month/);
	});

	test("gregorian: second Sunday of May 2024", () => {
		const pts = resolveRule(
			{
				base: "nth-weekday-of-month",
				month: 5,
				weekday: 0,
				occurrence: "second",
			},
			{ year: 2024, calendar: "gregorian" },
		);

		expect(pts).toEqual([{ month: 5, day: 12 }]);
	});

	test("jalali weekday numbering maps weekday 0 correctly", () => {
		const pts = resolveRule(
			{
				base: "nth-weekday-of-month",
				month: 12,
				weekday: 0,
				occurrence: "last",
				// @ts-ignore
				weekdaySystem: "jalali",
			},
			{ year: 2024 },
		);

		expect(pts[0]).toBeDefined();
		expect(typeof pts[0].day).toBe("number");
	});

	test("calendar controls weekday interpretation", () => {
		const ptsGregorian = resolveRule(
			{
				base: "nth-weekday-of-month",
				month: 5,
				weekday: 0,
				occurrence: "first",
			},
			{ year: 2024, calendar: "gregorian" },
		);

		expect(ptsGregorian).toEqual([{ month: 5, day: 5 }]);

		const ptsHijri = resolveRule(
			{
				base: "nth-weekday-of-month",
				month: 9,
				weekday: 0,
				occurrence: "first",
			},
			{ year: 1445, calendar: "hijri" },
		);

		expect(typeof ptsHijri[0].day).toBe("number");
		expect(ptsHijri[0].month).toBe(9);
		expect(ptsGregorian[0].day).not.toBe(ptsHijri[0].day);
	});

	test("month-weekday alias remains backward compatible", () => {
		const pts = resolveRule(
			{
				base: "month-weekday",
				month: 5,
				weekday: 0,
				occurrence: "second",
			},
			{ year: 2024, calendar: "gregorian" },
		);

		expect(pts).toEqual([{ month: 5, day: 12 }]);
	});

	test("month-end alias resolves to last occurrence", () => {
		const canonical = resolveRule(
			{
				base: "nth-weekday-of-month",
				month: 5,
				weekday: 0,
				occurrence: "last",
			},
			{ year: 2024, calendar: "gregorian" },
		);

		const alias = resolveRule(
			{ base: "month-end", month: 5, weekday: 0 },
			{ year: 2024, calendar: "gregorian" },
		);

		expect(alias).toEqual(canonical);
	});

	test("returns cached reference for identical inputs", () => {
		const rule = {
			base: "nth-weekday-of-month",
			month: 5,
			weekday: 0,
			occurrence: "second",
		};

		const ctx = {
			year: 2024,
			calendar: "gregorian",
		};

		// @ts-ignore
		const first = resolveRule(rule, ctx);
		// @ts-ignore
		const second = resolveRule(rule, ctx);

		expect(first).toBe(second);
	});

	test("different years produce different cache entries", () => {
		const rule = {
			base: "nth-weekday-of-month",
			month: 5,
			weekday: 0,
			occurrence: "second",
		};

		// @ts-ignore
		const r2024 = resolveRule(rule, {
			year: 2024,
			calendar: "gregorian",
		});

		// @ts-ignore
		const r2025 = resolveRule(rule, {
			year: 2025,
			calendar: "gregorian",
		});

		expect(r2024).not.toEqual(r2025);
		expect(r2024).not.toBe(r2025);
	});

	test("jalali: Chaharshanbe Suri in year 1403", () => {
		// Chaharshanbe Suri is the last Wednesday of Esfand.
		const pts = resolveRule(
			{
				base: "nth-weekday-of-month",
				month: 12,
				weekday: 3, // Wednesday in Sun=0 convention
				occurrence: "last",
			},
			{ year: 1403, calendar: "jalali" },
		);

		expect(pts).toEqual([{ month: 12, day: 29 }]);
	});

	test("jalali month 6 resolves against a 31-day month", () => {
		// Jalali months 1–6 always contain 31 days.
		const pts = resolveRule(
			{
				base: "nth-weekday-of-month",
				month: 6,
				weekday: 0,
				occurrence: "last",
			},
			{ year: 1403, calendar: "jalali" },
		);

		expect(pts[0].month).toBe(6);
		expect(pts[0].day).toBeGreaterThanOrEqual(25);
		expect(pts[0].day).toBeLessThanOrEqual(31);
	});

	test("hijri: last Friday of Ramadan 1445", () => {
		const pts = resolveRule(
			{
				base: "nth-weekday-of-month",
				month: 9,
				weekday: 6,
				occurrence: "last",
			},
			{ year: 1445, calendar: "hijri" },
		);

		expect(pts[0].month).toBe(9);
		expect(pts[0].day).toBeGreaterThanOrEqual(24);
		expect(pts[0].day).toBeLessThanOrEqual(30);
	});

	test("jalali: first Saturday of Farvardin 1402", () => {
		const pts = resolveRule(
			{
				base: "nth-weekday-of-month",
				month: 1,
				weekday: 6, // Saturday in Sun=0 convention
				occurrence: "first",
			},
			{ year: 1402, calendar: "jalali" },
		);

		expect(pts).toEqual([{ month: 1, day: 5 }]);
	});
});
