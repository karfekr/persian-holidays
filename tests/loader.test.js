import { registerData } from "../src/core/loader.js";
import { getEvents, getMonthEvents, getYearEvents } from "../src/query.js";
import { loaderSample } from "./fixtures.js";

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

	test("filters by category", async () => {
		const res = await getEvents("jalali", 1, 1, {
			categories: ["cultural"],
		});

		expect(res.map((e) => e.id)).not.toContain("fixed-m1d1");
		expect(res.map((e) => e.id)).toContain("multi-m1d1-4");
	});

	test("resolves Mother's Day 2024", async () => {
		const res = await getEvents("gregorian", 5, 12, {
			year: 2024,
		});

		expect(res.map((e) => e.id)).toContain("relative-mothers-day");
	});
});

describe("getMonthEvents", () => {
	test("returns all events in month 1", async () => {
		const res = await getMonthEvents("jalali", 1);
		const ids = res.map((e) => e.id);

		expect(ids).toContain("fixed-m1d1");
		expect(ids).toContain("fixed-m1d15");
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

	test("applies category filtering", async () => {
		const res = await getMonthEvents("jalali", 1, {
			categories: ["government"],
		});

		expect(res.map((e) => e.id)).not.toContain("fixed-m1d15");
	});

	test("includes relative events when year is provided", async () => {
		const res = await getMonthEvents("gregorian", 5, {
			year: 2024,
		});

		expect(res.map((e) => e.id)).toContain("relative-mothers-day");
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
		expect(ids).toContain("fixed-m1d15");
		expect(ids).toContain("fixed-m6d31");
		expect(ids).toContain("multi-m1d1-4");
	});

	test("filters by category across a year", async () => {
		const res = await getYearEvents("jalali", 1403, {
			categories: ["cultural"],
		});

		expect(res.map((e) => e.id)).not.toContain("fixed-m1d1");
		expect(res.map((e) => e.id)).toContain("fixed-m1d15");
	});

	test("includes relative events in resolved year", async () => {
		const res = await getYearEvents("gregorian", 2024);

		expect(res.map((e) => e.id)).toContain("relative-mothers-day");
	});

	test("deduplicates multi-day events", async () => {
		const res = await getYearEvents("jalali", 1403);
		const ids = res.map((e) => e.id);

		expect(ids.filter((id) => id === "multi-m1d1-4")).toHaveLength(1);
	});
});
