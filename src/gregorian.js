//? src/gregorian.js  →  entry: "persian-events/gregorian"
// Keeps the bundle small

export { getEvents, getEventsInRange } from "./query.js";

import { registerData } from "./core/loader.js";
import gregorianEvents from "../dist/data/gregorian.json" assert { type: "json" };

registerData("gregorian", gregorianEvents);
