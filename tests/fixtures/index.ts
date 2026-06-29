import type { RawEvent } from "src/types";

export const jalaliSample: RawEvent[] = [
  {
    id: "jalali-nowruz-holidays",
    type: "fixed",
    month: 1,
    day: 1,
    title: { fa: "تعطیلات نوروز", en: "Nowruz Holidays" },
    categories: ["government"],
    isHolidayInIran: true,
  },
  {
    id: "jalali-last-wednesday",
    type: "relative",
    rule: {
      base: "nth-weekday-of-month",
      month: 12,
      weekday: 3,
      occurrence: "last",
    },
    title: {
      fa: "چهارشنبه‌سوری",
      en: "Chaharshanbe Suri(Fire Wednesday)",
    },
    categories: ["government"],
    isHolidayInIran: false,
  },
  {
    id: "jalali-12-01-gneby",
    type: "fixed",
    month: 12,
    day: 1,
    title: { fa: "آبسالان", en: "Absalan" },
    categories: ["ancient"],
    isHolidayInIran: false,
  },
];

export const gregorianSample: RawEvent[] = [
  {
    id: "gregorian-mothers-day",
    type: "relative",
    rule: {
      base: "nth-weekday-of-month",
      month: 5,
      weekday: 0,
      occurrence: "second",
    },
    title: {
      fa: "روز مادر (جهانی)",
      en: "Mother's Day (International)",
    },
    categories: ["international"],
    isHolidayInIran: false,
  },
  {
    id: "gregorian-thanksgiving",
    type: "relative",
    rule: {
      base: "nth-weekday-of-month",
      month: 11,
      weekday: 4,
      occurrence: "fourth",
    },
    title: { fa: "روز شکرگزاری", en: "Thanksgiving Day" },
    categories: ["international"],
    isHolidayInIran: false,
  },
  {
    id: "gregorian-easter",
    type: "relative",
    rule: { base: "computus", offsetDays: 0 },
    title: { fa: "عید پاک", en: "Easter Sunday" },
    categories: ["international", "religious"],
    isHolidayInIran: false,
  },
  {
    id: "gregorian-12-01-14uslvu",
    type: "fixed",
    month: 12,
    day: 1,
    title: { fa: "روز جهانی ایدز", en: "World AIDS Day" },
    categories: ["international", "united_nations"],
    isHolidayInIran: false,
  },
];

export const hijriSample: RawEvent[] = [
  {
    id: "hijri-eid-fitr-holidays",
    type: "fixed",
    month: 12,
    day: 10,
    title: { fa: "عید سعید قربان", en: "Eid al-Adha" },
    categories: ["shia", "religious", "government"],
    isHolidayInIran: true,
  },
  {
    id: "hijri-laylat-al-qadr",
    type: "relative",
    rule: {
      base: "day-candidates",
      month: 9,
      candidates: [19, 21, 23],
    },
    title: { fa: "شب قدر", en: "Laylat al-Qadr (Night of Power)" },
    categories: ["religious"],
    isHolidayInIran: false,
  },
  {
    id: "hijri-12-01-p59bj6",
    type: "fixed",
    month: 12,
    day: 1,
    title: {
      fa: "سالروز ازدواج امام علی(ع) و حضرت فاطمه(س)",
      en: "Anniversary of Marriage of Imam Ali & Hazrat Fatimah",
    },
    categories: ["shia", "religious"],
    isHolidayInIran: false,
  },
];
