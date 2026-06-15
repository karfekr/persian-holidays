//? src/index  →  entry: "persian-holidays"

export { clearAdapter, setAdapter } from "./core/adapter";
export { getEvents, getMonthEvents, getYearEvents } from "./core/query";
export type { AdapterType, CalendarType, CategoryType, EventType } from "./types";

import { registerData } from "./core/loader";
import gregorianEvents from "./data/gregorian.json" with { type: "json" };
import hijriEvents from "./data/hijri.json" with { type: "json" };
import jalaliEvents from "./data/jalali.json" with { type: "json" };
import type { RawEvent } from "./types";

registerData("jalali", jalaliEvents as RawEvent[]);
registerData("gregorian", gregorianEvents as RawEvent[]);
registerData("hijri", hijriEvents as RawEvent[]);
