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
    it("should return jalali/fixed event on correct day", () => {
      const events = getEvents("jalali", 12, 1);
      expect(events.some((e) => e.id === "jalali-12-01-gneby")).toBe(true);
    });

    it("should not return jalali/fixed event on wrong day", () => {
      const events = getEvents("jalali", 12, 2);
      expect(events.some((e) => e.id === "jalali-12-01-gneby")).toBe(false);
    });

    it("should return gregorian/fixed event on correct day", () => {
      const events = getEvents("gregorian", 12, 1);
      expect(events.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(true);
    });

    it("should return hijri/fixed event on correct day", () => {
      const events = getEvents("hijri", 12, 1);
      expect(events.some((e) => e.id === "hijri-12-01-p59bj6")).toBe(true);
    });
  });

  describe("relative events", () => {
    it("should return day-candidates on candidate days", () => {
      for (const day of [19, 21, 23]) {
        const events = getEvents("hijri", 9, day);
        expect(events.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(true);
      }
    });

    it("should not return day-candidates on non-candidate day", () => {
      const events = getEvents("hijri", 9, 22);
      expect(events.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(false);
    });

    it("should find nth-weekday using adapter and year", () => {
      setAdapter(createInternationalizedAdapter());
      // gregorian 2024/5 — first day = Wednesday(3) → second Sunday(0) = day 12
      const events = getEvents("gregorian", 5, 12, { year: 2024 });
      expect(events.some((e) => e.id === "gregorian-mothers-day")).toBe(true);
    });
  });

  describe("category filtering", () => {
    it("should return only requested category events", () => {
      const events = getEvents("gregorian", 12, 1, { categories: ["government"] });
      expect(events.every((e) => e.categories.includes("government"))).toBe(true);
      expect(events.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(false);
    });

    it("without category should return all events", () => {
      const events = getEvents("gregorian", 12, 1);
      expect(events.some((e) => e.id === "gregorian-12-01-14uslvu")).toBe(true);
    });
  });

  describe("holidays option", () => {
    it("should return isHolidayInIran as-is when holidays is true (default)", () => {
      const events = getEvents("jalali", 1, 1);
      const nowruz = events.find((e) => e.id === "jalali-nowruz-holidays");
      expect(nowruz?.isHolidayInIran).toBe(true);
    });

    it("should return isHolidayInIran as false for all events when holidays is false", () => {
      const events = getEvents("jalali", 1, 1, { trueHolidays: false });
      expect(events.every((e) => e.isHolidayInIran === false)).toBe(true);
    });

    it("should override isHolidayInIran:true to false when holidays is false", () => {
      const events = getEvents("jalali", 1, 1, { trueHolidays: false });
      const nowruz = events.find((e) => e.id === "jalali-nowruz-holidays");
      expect(nowruz?.isHolidayInIran).toBe(false);
    });
  });

  describe("calendar field in output", () => {
    it("should return correct calendar in Event", () => {
      const events = getEvents("jalali", 12, 1);
      expect(events[0].calendar).toBe("jalali");
    });
  });

  describe("errors", () => {
    it("should return empty array if no events exist", () => {
      const events = getEvents("gregorian", 6, 15);
      expect(Array.isArray(events)).toBe(true);
    });
  });
});

describe("getMonthEvents", () => {
  beforeEach(() => {
    setAdapter(createInternationalizedAdapter());
  });

  it("should return all jalali month 1 events (Nowruz)", () => {
    const events = getMonthEvents("jalali", 1, { year: 1403 });
    expect(events.some((e) => e.id === "jalali-nowruz-holidays")).toBe(true);
  });

  it("should return jalali fixed month 12 event", () => {
    const events = getMonthEvents("jalali", 12, { year: 1403 });
    expect(events.some((e) => e.id === "jalali-12-01-gneby")).toBe(true);
  });

  it("should return correct gregorian month 5 events", () => {
    const events = getMonthEvents("gregorian", 5, { year: 2024 });
    expect(events.some((e) => e.id === "gregorian-mothers-day")).toBe(true);
  });

  it("should return day-candidates in month 9", () => {
    const events = getMonthEvents("hijri", 9, { year: 1445 });
    expect(events.some((e) => e.id === "hijri-laylat-al-qadr")).toBe(true);
  });

  describe("holidays option", () => {
    it("should return isHolidayInIran as-is when holidays is true (default)", () => {
      const events = getMonthEvents("hijri", 12, { year: 1445 });
      const eid = events.find((e) => e.id === "hijri-eid-fitr-holidays");
      expect(eid?.isHolidayInIran).toBe(true);
    });

    it("should set isHolidayInIran to false for all events when holidays is false", () => {
      const events = getMonthEvents("jalali", 1, { year: 1403, trueHolidays: false });
      expect(events.every((e) => e.isHolidayInIran === false)).toBe(true);
    });

    it("should override isHolidayInIran:true to false when holidays is false", () => {
      const events = getMonthEvents("hijri", 12, { year: 1445, trueHolidays: false });
      const eid = events.find((e) => e.id === "hijri-eid-fitr-holidays");
      expect(eid?.isHolidayInIran).toBe(false);
    });
  });

  it("category filter should work on getMonthEvents", () => {
    const events = getMonthEvents("gregorian", 12, {
      year: 2024,
      categories: ["government"],
    });
    expect(events.every((e) => e.categories.includes("government"))).toBe(true);
  });

  it("should not return duplicate events", () => {
    const events = getMonthEvents("hijri", 9, { year: 1445 });
    const ids = events.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("getYearEvents", () => {
  beforeEach(() => {
    setAdapter(createInternationalizedAdapter());
  });

  it("should return all jalali events in a year", () => {
    const events = getYearEvents("jalali", 1403);
    const ids = events.map((e) => e.id);
    expect(ids).toContain("jalali-nowruz-holidays");
    expect(ids).toContain("jalali-last-wednesday");
    expect(ids).toContain("jalali-12-01-gneby");
  });

  it("should return all gregorian events in a year", () => {
    const events = getYearEvents("gregorian", 2024);
    const ids = events.map((e) => e.id);
    expect(ids).toContain("gregorian-mothers-day");
    expect(ids).toContain("gregorian-thanksgiving");
    expect(ids).toContain("gregorian-easter");
    expect(ids).toContain("gregorian-12-01-14uslvu");
  });

  it("should return all hijri events in a year", () => {
    const events = getYearEvents("hijri", 1445);
    const ids = events.map((e) => e.id);
    expect(ids).toContain("hijri-eid-fitr-holidays");
    expect(ids).toContain("hijri-laylat-al-qadr");
    expect(ids).toContain("hijri-12-01-p59bj6");
  });

  describe("holidays option", () => {
    it("should return isHolidayInIran as-is when holidays is true (default)", () => {
      const events = getYearEvents("jalali", 1403);
      const nowruz = events.find((e) => e.id === "jalali-nowruz-holidays");
      expect(nowruz?.isHolidayInIran).toBe(true);
    });

    it("should set isHolidayInIran to false for all events when holidays is false", () => {
      const events = getYearEvents("jalali", 1403, { trueHolidays: false });
      expect(events.every((e) => e.isHolidayInIran === false)).toBe(true);
    });

    it("should override isHolidayInIran:true to false when holidays is false", () => {
      const events = getYearEvents("hijri", 1445, { trueHolidays: false });
      const eid = events.find((e) => e.id === "hijri-eid-fitr-holidays");
      expect(eid?.isHolidayInIran).toBe(false);
    });
  });

  it("category filter should work on getYearEvents", () => {
    const events = getYearEvents("gregorian", 2024, { categories: ["religious"] });
    expect(events.every((e) => e.categories.includes("religious"))).toBe(true);
    expect(events.some((e) => e.id === "gregorian-easter")).toBe(true);
  });

  it("should not return duplicate events in yearly output", () => {
    const events = getYearEvents("jalali", 1403);
    const ids = events.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("should set correct calendar on all output events", () => {
    const events = getYearEvents("gregorian", 2024);
    expect(events.every((e) => e.calendar === "gregorian")).toBe(true);
  });
});
