//? src/gregorian  →  entry: "persian-holidays/gregorian"
// Keeps the bundle small

export { clearAdapter, setAdapter } from "./core/adapter";
export { getEvents, getMonthEvents, getYearEvents } from "./core/query";

import { registerData } from "./core/loader";
import gregorianEvents from "./data/gregorian.json" with { type: "json" };
import type { RawEvent } from "./types";

registerData("gregorian", gregorianEvents as RawEvent[]);
