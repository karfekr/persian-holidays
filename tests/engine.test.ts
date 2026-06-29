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
    it("should return fixed event on exact day", () => {
      const result = matchDay(jalaliSample, "jalali", 12, 1);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("jalali-12-01-gneby");
    });

    it("should not return fixed event on wrong day", () => {
      const result = matchDay(jalaliSample, "jalali", 12, 2);
      const fixed = result.find((e) => e.id === "jalali-12-01-gneby");
      expect(fixed).toBeUndefined();
    });

    it("should return gregorian fixed event", () => {
      const result = matchDay(gregorianSample, "gregorian", 12, 1);
      expect(result.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(true);
    });
  });

  describe("relative events", () => {
    it("should return day-candidates event on all candidate days", () => {
      for (const day of [19, 21, 23]) {
        const result = matchDay(hijriSample, "hijri", 9, day);
        expect(result.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(true);
      }
    });

    it("should find nth-weekday-of-month event using adapter", () => {
      setAdapter(createInternationalizedAdapter());
      // gregorian 2024/5: first day = Wednesday (3), second Sunday (0) = day 12
      const result = matchDay(gregorianSample, "gregorian", 5, 12, undefined, 2024);
      expect(result.some((e) => e.id === "gregorian-mothers-day")).toBe(true);
    });

    it("should not return relative event without year and without adapter (skipOnMissingYear)", () => {
      // without year and without adapter → skip
      const result = matchDay(gregorianSample, "gregorian", 5, 12, undefined, undefined);
      expect(result.some((e) => e.id === "gregorian-mothers-day")).toBe(false);
    });
  });

  describe("category filtering", () => {
    it("should return only requested category events", () => {
      const result = matchDay(gregorianSample, "gregorian", 12, 1, ["international"]);
      expect(result.every((e) => e.categories.includes("international"))).toBe(true);
    });

    it("should not return event without matching category", () => {
      const result = matchDay(gregorianSample, "gregorian", 12, 1, ["government"]);
      expect(result.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(false);
    });

    it("with empty array should return all events", () => {
      const result = matchDay(jalaliSample, "jalali", 12, 1, []);
      expect(result.some((e) => e.id === "jalali-12-01-gneby")).toBe(true);
    });
  });

  describe("output Event shape", () => {
    it("should correctly include calendar and type fields in output", () => {
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
    it("with empty list should return empty array", () => {
      expect(matchDay([], "gregorian", 1, 1)).toEqual([]);
    });

    it("fixed event without month/day should not match", () => {
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

    it("relative event without rule should not match", () => {
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
    it("should find fixed event in range", () => {
      const result = matchRange(gregorianSample, "gregorian", 11, 1, 12, 31);
      expect(result.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(true);
    });

    it("should not return event outside range", () => {
      const result = matchRange(gregorianSample, "gregorian", 1, 1, 6, 30);
      expect(result.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(false);
    });
  });

  describe("deduplication", () => {
    it("should not include duplicate events in result even if matched multiple times", () => {
      // day-candidates in month 9 range - all candidates in range
      const result = matchRange(hijriSample, "hijri", 9, 1, 9, 30);
      const ids = result.map((e) => e.id);
      const unique = new Set(ids);
      expect(ids.length).toBe(unique.size);
    });
  });

  describe("relative events in range", () => {
    it("should return day-candidates event if at least one candidate is in range", () => {
      // candidates: 21,23,25,27,29 — query: month 9, days 20-22
      const result = matchRange(hijriSample, "hijri", 9, 20, 9, 22);
      expect(result.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(true);
    });

    it("should not return day-candidates event if no candidate is in range", () => {
      // candidates: 21,23,25,27,29 — query: month 9, days 10-20 (20 not a candidate)
      const result = matchRange(hijriSample, "hijri", 9, 10, 9, 18);
      expect(result.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(false);
    });
  });

  describe("category filtering", () => {
    it("should apply category filtering on matchRange as well", () => {
      const result = matchRange(gregorianSample, "gregorian", 1, 1, 12, 31, ["government"]);
      expect(result.every((e) => e.categories.includes("government"))).toBe(true);
    });

    it("should correctly filter multi-category events", () => {
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
    it("with empty list should return empty array", () => {
      expect(matchRange([], "gregorian", 1, 1, 12, 31)).toEqual([]);
    });

    it("single-day range should behave like matchDay", () => {
      const rangeResult = matchRange(gregorianSample, "gregorian", 12, 1, 12, 1);
      const dayResult = matchDay(gregorianSample, "gregorian", 12, 1);
      expect(rangeResult.map((e) => e.id).sort()).toEqual(dayResult.map((e) => e.id).sort());
    });
  });
});
