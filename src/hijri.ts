//? src/hijri  →  entry: "persian-holidays/hijri"
// Keeps the bundle small

export { clearAdapter, setAdapter } from "./core/adapter";
export { getEvents, getMonthEvents, getYearEvents } from "./core/query";
export type { AdapterType, CalendarType, CategoryType, EventType } from "./types";

import { registerData } from "./core/loader";
import hijriEvents from "./data/hijri.json" with { type: "json" };
import type { RawEvent } from "./types";

registerData("hijri", hijriEvents as RawEvent[]);
