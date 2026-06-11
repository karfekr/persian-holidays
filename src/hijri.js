//? src/hijri.js  →  entry: "persian-events/hijri"
// Keeps the bundle small

export { getEvents, getEventsInRange } from "./query.js";

import { registerData } from "./core/loader.js";
import hijriEvents from "../dist/data/hijri.json" assert { type: "json" };

registerData("hijri", hijriEvents);
