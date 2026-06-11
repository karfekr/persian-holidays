//? CJS fallback wrapper to support require() consumers by re-exporting from ESM via dynamic import

import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CJS_DIR = resolve(ROOT, "dist", "cjs");

mkdirSync(CJS_DIR, { recursive: true });

const ENTRIES = ["index", "jalali", "gregorian", "hijri"];

const shim = (entry) => `\
'use strict';
// Auto-generated CJS shim for persian-events/${entry}
// This is a thin wrapper — bundlers like esbuild/webpack will inline ESM directly.

let _module;

async function _load() {
  if (!_module) {
    _module = await import('../../src/${entry}.js');
  }
  return _module;
}

module.exports.getEvents = async function (...args) {
  const m = await _load();
  return m.getEvents(...args);
};

module.exports.getEventsInRange = async function (...args) {
  const m = await _load();
  return m.getEventsInRange(...args);
};
`;

for (const entry of ENTRIES) {
	const outFile = resolve(CJS_DIR, `${entry}.cjs`);
	writeFileSync(outFile, shim(entry));
	console.log(`✓ CJS shim → ${outFile}`);
}

console.log("\n✓ CJS shims generated.");
