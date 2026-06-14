//? src/jalali  →  entry: "persian-holidays/jalali"
// Keeps the bundle small

export { clearAdapter, setAdapter } from "./core/adapter";
export { getEvents, getMonthEvents, getYearEvents } from "./core/query";

import { registerData } from "./core/loader";
import jalaliEvents from "./data/jalali.json" with { type: "json" };
import type { RawEvent } from "./types/index";

registerData("jalali", jalaliEvents as RawEvent[]);
