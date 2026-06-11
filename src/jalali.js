//? src/jalali.js  →  entry: "persian-events/jalali"
// Keeps the bundle small

export { getEvents, getEventsInRange } from "./query.js";

import { registerData } from "./core/loader.js";
import jalaliEvents from "../dist/data/jalali.json" assert { type: "json" };

registerData("jalali", jalaliEvents);
