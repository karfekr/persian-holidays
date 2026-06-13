import { beforeAll, describe, expect, test } from "vitest";
import { registerData } from "../src/core/loader.js";
import { getEvents, getMonthEvents, getYearEvents } from "../src/query.js";
import { loaderSample } from "./fixtures/index.js";

beforeAll(() => {
	registerData("jalali", loaderSample);
	registerData("gregorian", loaderSample);
});

describe("getEvents", () => {
	test("returns event on exact day", async () => {
		const res = await getEvents("jalali", 1, 1);
		expect(res.map((e) => e.id)).toContain("fixed-m1d1");
	});

	test("returns empty array when day has no events", async () => {
		const res = await getEvents("jalali", 3, 3);
		expect(res).toHaveLength(0);
	});
});

describe("getMonthEvents", () => {
	test("returns all events in month 1", async () => {
		const res = await getMonthEvents("jalali", 1);
		const ids = res.map((e) => e.id);

		expect(ids).toContain("fixed-m1d1");
		expect(ids).toContain("multi-m1d1-4");
	});

	test("excludes events from other months", async () => {
		const res = await getMonthEvents("jalali", 1);

		expect(res.map((e) => e.id)).not.toContain("fixed-m6d31");
	});

	test("includes day 31 in Jalali month 6", async () => {
		const res = await getMonthEvents("jalali", 6);

		expect(res.map((e) => e.id)).toContain("fixed-m6d31");
	});

	test("deduplicates multi-day events", async () => {
		const res = await getMonthEvents("jalali", 1);
		const ids = res.map((e) => e.id);

		expect(ids.filter((id) => id === "multi-m1d1-4")).toHaveLength(1);
	});
});

describe("getYearEvents", () => {
	test("returns events from all months", async () => {
		const res = await getYearEvents("jalali", 1403);
		const ids = res.map((e) => e.id);

		expect(ids).toContain("fixed-m1d1");
		expect(ids).toContain("fixed-m6d31");
		expect(ids).toContain("multi-m1d1-4");
	});

	test("deduplicates multi-day events", async () => {
		const res = await getYearEvents("jalali", 1403);
		const ids = res.map((e) => e.id);

		expect(ids.filter((id) => id === "multi-m1d1-4")).toHaveLength(1);
	});
});
