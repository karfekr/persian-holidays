import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import { load as parseYaml } from "js-yaml";
import { globSync } from "glob";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_DIR = resolve(ROOT, "data");
const OUT_DIR = resolve(ROOT, "dist", "data");

const CALENDARS = ["jalali", "gregorian", "hijri"];

const VALID_TYPES = new Set(["fixed", "multi-day", "relative"]);
const VALID_CATEGORIES = new Set([
	"government",
	"religious",
	"shia",
	"sunni",
	"ancient",
	"international",
	"historical",
	"united_nations",
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

	if (typeof event.isHolidayInIran !== "boolean")
		throw new Error(`${prefix} "isHolidayInIran" must be boolean`);

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

function loadCalendarFiles(calendar) {
	const pattern = join(DATA_DIR, calendar, "**", "*.yml");
	return globSync(pattern, { windowsPathsNoEscape: true });
}

mkdirSync(OUT_DIR, { recursive: true });

let totalEvents = 0;
const errors = [];

for (const calendar of CALENDARS) {
	const outFile = resolve(OUT_DIR, `${calendar}.json`);

	console.log(`\n📂 Processing ${calendar} ...`);

	const files = loadCalendarFiles(calendar);

	let allEvents = [];

	for (const file of files) {
		let raw;
		try {
			raw = parseYaml(readFileSync(file, "utf8"));
		} catch (e) {
			console.error(`  ✗ YAML error in ${file}: ${e.message}`);
			errors.push(e.message);
			continue;
		}

		const events = raw?.events ?? [];
		if (!Array.isArray(events)) {
			const msg = `"events" must be array in ${file}`;
			console.error(`  ✗ ${msg}`);
			errors.push(msg);
			continue;
		}

		allEvents.push(...events);
	}

	const validated = [];
	for (let i = 0; i < allEvents.length; i++) {
		try {
			validateEvent(allEvents[i], calendar, i);
			validated.push(compact(allEvents[i]));
		} catch (e) {
			console.error(`  ✗ ${e.message}`);
			errors.push(e.message);
		}
	}

	const ids = new Set();
	for (const ev of validated) {
		if (ids.has(ev.id)) {
			const msg = `Duplicate id "${ev.id}" in ${calendar}`;
			console.error(`  ✗ ${msg}`);
			errors.push(msg);
		}
		ids.add(ev.id);
	}

	writeFileSync(outFile, JSON.stringify(validated, null, 0));

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
