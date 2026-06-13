//? src/hijri.js  →  entry: "persian-holidays/hijri"
// Keeps the bundle small

export { getEvents, getMonthEvents, getYearEvents } from "./query.js";
export { setAdapter, clearAdapter } from "./core/adapter.js";

import { registerData } from "./core/loader.js";
import hijriEvents from "../dist/data/hijri.json" with { type: "json" };

// @ts-ignore
registerData("hijri", hijriEvents);
