//? src/index.js  →  entry: "persian-holidays"

export { getEvents, getMonthEvents, getYearEvents } from "./query.js";
export { setAdapter, clearAdapter } from "./core/adapter.js";
export { registerData } from "./core/loader.js";

import { registerData } from "./core/loader.js";
import jalaliEvents from "../dist/data/jalali.json" with { type: "json" };
import gregorianEvents from "../dist/data/gregorian.json" with { type: "json" };
import hijriEvents from "../dist/data/hijri.json" with { type: "json" };

// @ts-ignore
registerData("jalali", jalaliEvents);
// @ts-ignore
registerData("gregorian", gregorianEvents);
// @ts-ignore
registerData("hijri", hijriEvents);
