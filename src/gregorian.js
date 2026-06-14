//? src/gregorian.js  →  entry: "persian-holidays/gregorian"
// Keeps the bundle small

export { getEvents, getMonthEvents, getYearEvents } from "./query.js";
export { setAdapter, clearAdapter } from "./core/adapter.js";

import { registerData } from "./core/loader.js";
import gregorianEvents from "../lib/data/gregorian.json" with { type: "json" };

// @ts-ignore
registerData("gregorian", gregorianEvents);
