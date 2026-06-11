//? src/index.js  →  entry: "persian-events"
// register all calendar data

export { getEvents, getEventsInRange } from "./query.js";

import { registerData } from "./core/loader.js";
import jalaliEvents from "../dist/data/jalali.json" assert { type: "json" };
import gregorianEvents from "../dist/data/gregorian.json" assert { type: "json" };
import hijriEvents from "../dist/data/hijri.json" assert { type: "json" };

registerData("jalali", jalaliEvents);
registerData("gregorian", gregorianEvents);
registerData("hijri", hijriEvents);
