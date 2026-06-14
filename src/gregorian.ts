//? src/gregorian  →  entry: "persian-holidays/gregorian"
// Keeps the bundle small

export { clearAdapter, setAdapter } from "./core/adapter";
export { getEvents, getMonthEvents, getYearEvents } from "./core/query";

import gregorianEvents from "data/gregorian.json" with { type: "json" };

import { registerData } from "./core/loader";
import type { RawEvent } from "./types";

registerData("gregorian", gregorianEvents as RawEvent[]);
