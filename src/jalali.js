//? src/jalali.js  →  entry: "persian-holidays/jalali"
// Keeps the bundle small

export { getEvents, getMonthEvents, getYearEvents } from "./query.js";
export { setAdapter, clearAdapter } from "./core/adapter.js";

import { registerData } from "./core/loader.js";
import jalaliEvents from "../lib/data/jalali.json" with { type: "json" };

// @ts-ignore
registerData("jalali", jalaliEvents);
