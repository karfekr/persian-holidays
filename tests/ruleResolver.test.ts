import { clearAdapter, getAdapter, setAdapter } from "src/core/adapter";
import { resolveRule } from "src/core/ruleResolver";

describe("adapter", () => {
	beforeEach(() => {
		clearAdapter();
	});

	it("getAdapter بدون setAdapter باید خطا بدهد", () => {
		expect(() => getAdapter()).toThrow(/no adapter has been registered/);
	});

	it("getAdapter با callerHint باید نام caller را در خطا بگنجاند", () => {
		expect(() => getAdapter("nth-weekday-of-month")).toThrow(/nth-weekday-of-month/);
	});

	it("setAdapter با شیء معتبر باید getAdapter را موفق کند", () => {
		const mock = {
			firstWeekdayOfMonth: vi.fn(() => 0),
			daysInMonth: vi.fn(() => 30),
		};
		setAdapter(mock);
		expect(() => getAdapter()).not.toThrow();
		expect(getAdapter()).toBe(mock);
	});

	it("setAdapter با شیء ناقص باید TypeError بدهد", () => {
		expect(() => setAdapter({ firstWeekdayOfMonth: vi.fn() } as never)).toThrow(TypeError);
		expect(() => setAdapter({ daysInMonth: vi.fn() } as never)).toThrow(TypeError);
		expect(() => setAdapter(null as never)).toThrow(TypeError);
	});

	it("clearAdapter باید adapter را پاک کند", () => {
		setAdapter({ firstWeekdayOfMonth: vi.fn(() => 0), daysInMonth: vi.fn(() => 30) });
		clearAdapter();
		expect(() => getAdapter()).toThrow();
	});
});

describe("resolveRule", () => {
	const mockAdapter = {
		firstWeekdayOfMonth: vi.fn(),
		daysInMonth: vi.fn(),
	};

	beforeEach(() => {
		clearAdapter();
		vi.clearAllMocks();
	});

	describe("day-candidates", () => {
		it("باید تمام candidateها را به DatePoint تبدیل کند", () => {
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

		it("با candidates خالی باید خطا بدهد", () => {
			expect(() => resolveRule({ base: "day-candidates", month: 9, candidates: [] })).toThrow(
				/non-empty/,
			);
		});

		it("بدون month باید خطا بدهد", () => {
			expect(() => resolveRule({ base: "day-candidates", candidates: [1] } as never)).toThrow(
				/month/,
			);
		});
	});

	describe("computus", () => {
		it("باید عید پاک ۲۰۲۴ را صحیح محاسبه کند (۳۱ مارس = ماه ۳ روز ۳۱)", () => {
			const result = resolveRule({ base: "computus" }, { year: 2024 });
			expect(result).toEqual([{ month: 3, day: 31 }]);
		});

		it("باید عید پاک ۲۰۲۵ را صحیح محاسبه کند (۲۰ آوریل = ماه ۴ روز ۲۰)", () => {
			const result = resolveRule({ base: "computus" }, { year: 2025 });
			expect(result).toEqual([{ month: 4, day: 20 }]);
		});

		it("باید offsetDays را اعمال کند", () => {
			// Good Friday = Easter - 2
			const result = resolveRule({ base: "computus", offsetDays: -2 }, { year: 2024 });
			expect(result).toEqual([{ month: 3, day: 29 }]);
		});

		it("بدون year باید آرایه خالی برگرداند", () => {
			const result = resolveRule({ base: "computus" }, {});
			expect(result).toEqual([]);
		});
	});

	describe("nth-weekday-of-month", () => {
		beforeEach(() => {
			setAdapter(mockAdapter);
		});

		it("باید اولین یکشنبه را پیدا کند", () => {
			// gregorian 2024/5: اول ماه = چهارشنبه (3)، اولین یکشنبه (0) = روز 5
			mockAdapter.firstWeekdayOfMonth.mockReturnValue(3);
			mockAdapter.daysInMonth.mockReturnValue(31);

			const result = resolveRule(
				{ base: "nth-weekday-of-month", month: 5, weekday: 0, occurrence: "first" },
				{ year: 2024, calendar: "gregorian" },
			);
			expect(result).toEqual([{ month: 5, day: 5 }]);
		});

		it("باید دومین یکشنبه را پیدا کند (Mother's Day 2024)", () => {
			mockAdapter.firstWeekdayOfMonth.mockReturnValue(3);
			mockAdapter.daysInMonth.mockReturnValue(31);

			const result = resolveRule(
				{ base: "nth-weekday-of-month", month: 5, weekday: 0, occurrence: "second" },
				{ year: 2024, calendar: "gregorian" },
			);
			expect(result).toEqual([{ month: 5, day: 12 }]);
		});

		it("باید آخرین چهارشنبه (3) ماه ۱۲ جلالی را پیدا کند", () => {
			// فرض: اول ماه ۱۲ جلالی = شنبه (6)، ماه ۲۹ روز
			mockAdapter.firstWeekdayOfMonth.mockReturnValue(6);
			mockAdapter.daysInMonth.mockReturnValue(29);

			const result = resolveRule(
				{ base: "nth-weekday-of-month", month: 12, weekday: 3, occurrence: "last" },
				{ year: 1402, calendar: "jalali" },
			);
			// چهارشنبه‌های ماه: روزهایی که (6 + d - 1) % 7 === 3
			// d=4: (6+3)%7=2 ✗  d=5: (6+4)%7=3 ✓ → 5, 12, 19, 26
			expect(result[0].day).toBe(26);
		});

		it("بدون year باید آرایه خالی برگرداند (skipOnMissingYear)", () => {
			const result = resolveRule(
				{ base: "nth-weekday-of-month", month: 5, weekday: 0, occurrence: "first" },
				{ skipOnMissingYear: true, calendar: "gregorian" },
			);
			expect(result).toEqual([]);
		});

		it("بدون adapter باید خطا بدهد", () => {
			clearAdapter();
			expect(() =>
				resolveRule(
					{ base: "nth-weekday-of-month", month: 5, weekday: 0 },
					{ year: 2024, calendar: "gregorian" },
				),
			).toThrow(/no adapter has been registered/);
		});
	});

	// ── month-end ─────────────────────────────────────────────
	describe("month-end", () => {
		it("باید آخرین روز هفته ماه را برگرداند (alias of last)", () => {
			setAdapter(mockAdapter);
			mockAdapter.firstWeekdayOfMonth.mockReturnValue(0); // شنبه
			mockAdapter.daysInMonth.mockReturnValue(30);

			const result = resolveRule(
				{ base: "month-end", month: 3, weekday: 5 },
				{ year: 2024, calendar: "gregorian" },
			);
			// آخرین جمعه (5) در ماه ۳۰ روزه با اول شنبه (0):
			// روزهایی که (0+d-1)%7===5 → d=6,13,20,27 → آخری: 27
			expect(result[0].day).toBe(27);
		});
	});

	describe("caching", () => {
		it("باید نتیجه یکسان بدون فراخوانی دوباره adapter برگرداند", () => {
			setAdapter(mockAdapter);
			mockAdapter.firstWeekdayOfMonth.mockReturnValue(2);
			mockAdapter.daysInMonth.mockReturnValue(28);

			// از year منحصربه‌فرد استفاده می‌کنیم تا کش قبلی تداخل نداشته باشد
			const rule = {
				base: "nth-weekday-of-month" as const,
				month: 7,
				weekday: 2,
				occurrence: "third" as const,
			};
			const ctx = { year: 9999, calendar: "gregorian" as const };

			const r1 = resolveRule(rule, ctx);
			// فراخوانی دوم باید از کش بیاید
			const r2 = resolveRule(rule, ctx);

			expect(r1).toEqual(r2);
			// adapter باید دقیقاً یک‌بار (در فراخوانی اول) صدا زده شده باشد
			expect(mockAdapter.firstWeekdayOfMonth).toHaveBeenCalledTimes(1);
			expect(mockAdapter.daysInMonth).toHaveBeenCalledTimes(1);
		});
	});

	describe("unknown rule", () => {
		it("باید خطا بدهد اگر base ناشناخته باشد", () => {
			expect(() => resolveRule({ base: "unknown-base" as never }, {})).toThrow(/Unknown rule base/);
		});
	});
});
