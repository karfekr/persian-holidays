import { clearAdapter, getAdapter, setAdapter } from "src/core/adapter";
import { resolveRule } from "src/core/ruleResolver";

describe("adapter", () => {
	beforeEach(() => {
		clearAdapter();
	});

	it("getAdapter without setAdapter should throw an error", () => {
		expect(() => getAdapter()).toThrow(/no adapter has been registered/);
	});

	it("getAdapter with callerHint should include caller name in error", () => {
		expect(() => getAdapter("nth-weekday-of-month")).toThrow(/nth-weekday-of-month/);
	});

	it("setAdapter with valid object should make getAdapter succeed", () => {
		const mock = {
			firstWeekdayOfMonth: vi.fn(() => 0),
			monthLength: vi.fn(() => 30),
		};
		setAdapter(mock);
		expect(() => getAdapter()).not.toThrow();
		expect(getAdapter()).toBe(mock);
	});

	it("setAdapter with incomplete object should throw TypeError", () => {
		expect(() => setAdapter({ firstWeekdayOfMonth: vi.fn() } as never)).toThrow(TypeError);
		expect(() => setAdapter({ monthLength: vi.fn() } as never)).toThrow(TypeError);
		expect(() => setAdapter(null as never)).toThrow(TypeError);
	});

	it("clearAdapter should remove adapter", () => {
		setAdapter({ firstWeekdayOfMonth: vi.fn(() => 0), monthLength: vi.fn(() => 30) });
		clearAdapter();
		expect(() => getAdapter()).toThrow();
	});
});

describe("resolveRule", () => {
	const mockAdapter = {
		firstWeekdayOfMonth: vi.fn(),
		monthLength: vi.fn(),
	};

	beforeEach(() => {
		clearAdapter();
		vi.clearAllMocks();
	});

	describe("day-candidates", () => {
		it("should convert all candidates to DatePoint", () => {
			const result = resolveRule({
				base: "day-candidates",
				month: 9,
				candidates: [21, 23, 25],
			});
			expect(result).toEqual([
				{ month: 9, day: 21 },
				{ month: 9, day: 23 },
				{ month: 9, day: 25 },
			]);
		});

		it("should throw error with empty candidates", () => {
			expect(() => resolveRule({ base: "day-candidates", month: 9, candidates: [] })).toThrow(
				/non-empty/,
			);
		});

		it("should throw error without month", () => {
			expect(() => resolveRule({ base: "day-candidates", candidates: [1] } as never)).toThrow(
				/month/,
			);
		});
	});

	describe("computus", () => {
		it("should correctly compute Easter 2024 (March 31)", () => {
			const result = resolveRule({ base: "computus" }, { year: 2024 });
			expect(result).toEqual([{ month: 3, day: 31 }]);
		});

		it("should correctly compute Easter 2025 (April 20)", () => {
			const result = resolveRule({ base: "computus" }, { year: 2025 });
			expect(result).toEqual([{ month: 4, day: 20 }]);
		});

		it("should apply offsetDays", () => {
			// Good Friday = Easter - 2
			const result = resolveRule({ base: "computus", offsetDays: -2 }, { year: 2024 });
			expect(result).toEqual([{ month: 3, day: 29 }]);
		});

		it("should return empty array without year", () => {
			const result = resolveRule({ base: "computus" }, {});
			expect(result).toEqual([]);
		});
	});

	describe("nth-weekday-of-month", () => {
		beforeEach(() => {
			setAdapter(mockAdapter);
		});

		it("should find first Sunday", () => {
			// gregorian 2024/5: first day = Wednesday (3), first Sunday (0) = day 5
			mockAdapter.firstWeekdayOfMonth.mockReturnValue(3);
			mockAdapter.monthLength.mockReturnValue(31);

			const result = resolveRule(
				{ base: "nth-weekday-of-month", month: 5, weekday: 0, occurrence: "first" },
				{ year: 2024, calendar: "gregorian" },
			);
			expect(result).toEqual([{ month: 5, day: 5 }]);
		});

		it("should find second Sunday (Mother's Day 2024)", () => {
			mockAdapter.firstWeekdayOfMonth.mockReturnValue(3);
			mockAdapter.monthLength.mockReturnValue(31);

			const result = resolveRule(
				{ base: "nth-weekday-of-month", month: 5, weekday: 0, occurrence: "second" },
				{ year: 2024, calendar: "gregorian" },
			);
			expect(result).toEqual([{ month: 5, day: 12 }]);
		});

		it("should find last Wednesday (3) of jalali month 12", () => {
			// assumption: first day of month 12 jalali = Saturday (6), 29-day month
			mockAdapter.firstWeekdayOfMonth.mockReturnValue(6);
			mockAdapter.monthLength.mockReturnValue(29);

			const result = resolveRule(
				{ base: "nth-weekday-of-month", month: 12, weekday: 3, occurrence: "last" },
				{ year: 1402, calendar: "jalali" },
			);

			// Wednesdays in month: days where (6 + d - 1) % 7 === 3
			// d=5 → first valid match for last sequence → 5, 12, 19, 26
			expect(result[0].day).toBe(26);
		});

		it("should return empty array without year (skipOnMissingYear)", () => {
			const result = resolveRule(
				{ base: "nth-weekday-of-month", month: 5, weekday: 0, occurrence: "first" },
				{ skipOnMissingYear: true, calendar: "gregorian" },
			);
			expect(result).toEqual([]);
		});

		it("should throw error without adapter", () => {
			clearAdapter();
			expect(() =>
				resolveRule(
					{ base: "nth-weekday-of-month", month: 5, weekday: 0 },
					{ year: 2024, calendar: "gregorian" },
				),
			).toThrow(/no adapter has been registered/);
		});
	});

	describe("month-end", () => {
		it("should return last weekday of month (alias of last)", () => {
			setAdapter(mockAdapter);
			mockAdapter.firstWeekdayOfMonth.mockReturnValue(0); // Saturday
			mockAdapter.monthLength.mockReturnValue(30);

			const result = resolveRule(
				{ base: "month-end", month: 3, weekday: 5 },
				{ year: 2024, calendar: "gregorian" },
			);

			// last Friday (5) in 30-day month starting Saturday (0):
			// days where (0 + d - 1) % 7 === 5 → 6, 13, 20, 27 → last: 27
			expect(result[0].day).toBe(27);
		});
	});

	describe("caching", () => {
		it("should return same result without calling adapter again", () => {
			setAdapter(mockAdapter);
			mockAdapter.firstWeekdayOfMonth.mockReturnValue(2);
			mockAdapter.monthLength.mockReturnValue(28);

			const rule = {
				base: "nth-weekday-of-month" as const,
				month: 7,
				weekday: 2,
				occurrence: "third" as const,
			};
			const ctx = { year: 9999, calendar: "gregorian" as const };

			const r1 = resolveRule(rule, ctx);
			const r2 = resolveRule(rule, ctx);

			expect(r1).toEqual(r2);
			expect(mockAdapter.firstWeekdayOfMonth).toHaveBeenCalledTimes(1);
			expect(mockAdapter.monthLength).toHaveBeenCalledTimes(1);
		});
	});

	describe("unknown rule", () => {
		it("should throw error if base is unknown", () => {
			expect(() => resolveRule({ base: "unknown-base" as never }, {})).toThrow(/Unknown rule base/);
		});
	});
});
