//? Converts data/*.yml => dist/data/*.json

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { load as parseYaml } from "js-yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT, "data");
const OUT_DIR = resolve(ROOT, "dist", "data");

const CALENDARS = ["jalali", "gregorian", "hijri"];

const VALID_TYPES = new Set(["fixed", "multi-day", "relative"]);
const VALID_CATEGORIES = new Set([
	"national",
	"religious",
	"cultural",
	"international",
	"memorial",
	"nature",
]);

function validateEvent(event, calendar, idx) {
	const prefix = `[${calendar}][${idx}]`;

	if (!event.id) throw new Error(`${prefix} Missing "id"`);
	if (!event.type) throw new Error(`${prefix} Missing "type"`);
	if (!VALID_TYPES.has(event.type))
		throw new Error(`${prefix} Invalid type "${event.type}"`);
	if (!event.title?.fa || !event.title?.en)
		throw new Error(`${prefix} Missing title.fa or title.en`);
	if (!Array.isArray(event.categories) || event.categories.length === 0)
		throw new Error(`${prefix} "categories" must be a non-empty array`);

	for (const cat of event.categories) {
		if (!VALID_CATEGORIES.has(cat))
			throw new Error(`${prefix} Unknown category "${cat}"`);
	}

	if (typeof event.isHoliday !== "boolean")
		throw new Error(`${prefix} "isHoliday" must be boolean`);
	if (typeof event.isOfficialHolidayInIran !== "boolean")
		throw new Error(`${prefix} "isOfficialHolidayInIran" must be boolean`);

	if (event.type === "fixed") {
		if (event.month == null || event.day == null)
			throw new Error(`${prefix} Fixed event must have month and day`);
	}
	if (event.type === "multi-day") {
		const required = ["startMonth", "startDay", "endMonth", "endDay"];
		for (const f of required) {
			if (event[f] == null)
				throw new Error(`${prefix} Multi-day event missing "${f}"`);
		}
	}
	if (event.type === "relative") {
		if (!event.rule?.base)
			throw new Error(`${prefix} Relative event must have rule.base`);
	}
}

function compact(obj) {
	return JSON.parse(JSON.stringify(obj, (_, v) => (v == null ? undefined : v)));
}

mkdirSync(OUT_DIR, { recursive: true });

let totalEvents = 0;
const errors = [];

for (const calendar of CALENDARS) {
	const inFile = resolve(DATA_DIR, `${calendar}.yml`);
	const outFile = resolve(OUT_DIR, `${calendar}.json`);

	console.log(`\n📂 Processing ${calendar}.yml …`);

	let raw;
	try {
		raw = parseYaml(readFileSync(inFile, "utf8"));
	} catch (e) {
		console.error(`  ✗ Failed to parse YAML: ${e.message}`);
		errors.push(e.message);
		continue;
	}

	const events = raw?.events ?? [];
	if (!Array.isArray(events)) {
		const msg = `${calendar}.yml root "events" must be an array`;
		console.error(`  ✗ ${msg}`);
		errors.push(msg);
		continue;
	}

	// Validate and collect
	const validated = [];
	for (let i = 0; i < events.length; i++) {
		try {
			validateEvent(events[i], calendar, i);
			validated.push(compact(events[i]));
		} catch (e) {
			console.error(`  ✗ ${e.message}`);
			errors.push(e.message);
		}
	}

	// Check for duplicate IDs
	const ids = new Set();
	for (const ev of validated) {
		if (ids.has(ev.id)) {
			const msg = `Duplicate id "${ev.id}" in ${calendar}.yml`;
			console.error(`  ✗ ${msg}`);
			errors.push(msg);
		}
		ids.add(ev.id);
	}

	writeFileSync(outFile, JSON.stringify(validated, null, 0)); // minified
	console.log(`  ✓ ${validated.length} events → ${outFile}`);
	totalEvents += validated.length;
}

console.log(`\n────────────────────────────────`);
if (errors.length) {
	console.error(`\n❌ Build failed with ${errors.length} error(s):`);
	for (const e of errors) console.error(`   • ${e}`);
	process.exit(1);
} else {
	console.log(`✓ Build complete — ${totalEvents} total events compiled.`);
}
