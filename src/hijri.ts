//? src/hijri  →  entry: "persian-holidays/hijri"
// Keeps the bundle small

export { clearAdapter, setAdapter } from "./core/adapter";
export { getEvents, getMonthEvents, getYearEvents } from "./core/query";

import hijriEvents from "data/hijri.json" with { type: "json" };

import { registerData } from "./core/loader";
import type { RawEvent } from "./types";

registerData("hijri", hijriEvents as RawEvent[]);
