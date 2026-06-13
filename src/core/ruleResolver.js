/**
 * @typedef {import('./types.js').RelativeRule} RelativeRule
 * @typedef {import('./types.js').ResolverContext} ResolverContext
 * @typedef {import('./types.js').DatePoint} DatePoint
 * @typedef {(rule: RelativeRule, ctx: ResolverContext) => DatePoint[]} RuleResolver
 */

import { getAdapter } from "./adapter.js";

/**
 * @param {string} ruleName
 * @param {ResolverContext} ctx
 * @param {...(keyof ResolverContext)} fields
 * @returns {boolean}
 */
function requireCtx(ruleName, ctx, ...fields) {
	for (const f of fields) {
		if (ctx[f] == null) {
			if (ctx.skipOnMissingYear) return true;
			throw new Error(
				`[persian-events] Rule "${ruleName}" requires ctx.${f}. ` +
					`Pass { ${f}: <value> } as the context argument to getEvents() / resolveRule().`,
			);
		}
	}
	return false;
}

/**
 * @param {string} ruleName
 * @param {RelativeRule} rule
 * @param {...(keyof RelativeRule)} fields
 */
function requireRule(ruleName, rule, ...fields) {
	for (const f of fields) {
		if (rule[f] == null) {
			throw new Error(
				`[persian-events] Rule "${ruleName}" requires rule.${f} in the data definition.`,
			);
		}
	}
}

/**
 * @type {RuleResolver}
 */
function resolveComputus(rule, ctx) {
	if (ctx.year == null) return [];

	const y = ctx.year;
	const a = y % 19;
	const b = Math.floor(y / 100);
	const c = y % 100;
	const d = Math.floor(b / 4);
	const e = b % 4;
	const f = Math.floor((b + 8) / 25);
	const g = Math.floor((b - f + 1) / 3);
	const h = (19 * a + b - d - g + 15) % 30;
	const i = Math.floor(c / 4);
	const k = c % 4;
	const l = (32 + 2 * e + 2 * i - h - k) % 7;
	const m = Math.floor((a + 11 * h + 22 * l) / 451);
	const month = Math.floor((h + l - 7 * m + 114) / 31);
	const day = ((h + l - 7 * m + 114) % 31) + 1 + (rule.offsetDays ?? 0);

	return [{ month, day }];
}

/**
 * @type {RuleResolver}
 */
function resolveNthWeekdayOfMonth(rule, ctx) {
	if (requireCtx("nth-weekday-of-month", ctx, "year")) return [];
	requireRule("nth-weekday-of-month", rule, "month", "weekday");

	const { calendar = "gregorian" } = ctx;
	const year = ctx.year;
	const { month, weekday, occurrence = "first" } = rule;

	if (year == null) return [];

	if (month == null) {
		// Defensive runtime check to satisfy static type systems
		throw new Error(
			`[persian-events] nth-weekday-of-month: rule.month is required and must be a number.`,
		);
	}

	const monthNumber = /** @type {number} */ (month);

	const SUPPORTED = ["jalali", "hijri", "gregorian"];
	if (!SUPPORTED.includes(calendar)) {
		throw new Error(
			`[persian-events] nth-weekday-of-month: unsupported calendar "${calendar}". ` +
				`Supported: ${SUPPORTED.join(", ")}.`,
		);
	}

	const adapter = getAdapter("nth-weekday-of-month");

	const firstWeekday = adapter.firstWeekdayOfMonth(calendar, year, monthNumber);
	const totalDays = adapter.daysInMonth(calendar, year, monthNumber);
	const matches = [];
	for (let d = 1; d <= totalDays; d++) {
		if ((firstWeekday + d - 1) % 7 === weekday) {
			matches.push(d);
		}
	}

	if (matches.length === 0) {
		throw new Error(
			`[persian-events] nth-weekday-of-month: weekday ${weekday} not found in ` +
				`${calendar} ${year}/${month}. Verify rule.weekday convention (0=Sun … 6=Sat).`,
		);
	}

	const occurrenceIndex =
		occurrence === "last"
			? matches.length - 1
			: ({ first: 0, second: 1, third: 2, fourth: 3 }[occurrence] ?? 0);

	if (matches[occurrenceIndex] == null) {
		throw new Error(
			`[persian-events] nth-weekday-of-month: occurrence "${occurrence}" out of range ` +
				`(found ${matches.length} matching days) for ${calendar} ${year}/${month} weekday=${weekday}.`,
		);
	}

	return [{ month, day: matches[occurrenceIndex] }];
}

/**
 * @type {RuleResolver}
 */
function resolveDayCandidates(rule, _ctx) {
	requireRule("day-candidates", rule, "month");

	if (!Array.isArray(rule.candidates) || rule.candidates.length === 0) {
		throw new Error(
			`[persian-events] Rule "day-candidates" requires a non-empty rule.candidates array.`,
		);
	}

	const month = rule.month;
	if (month == null) {
		throw new Error(
			`[persian-events] Rule "day-candidates" requires rule.month in the data definition.`,
		);
	}

	return rule.candidates.map((day) => ({ month, day }));
}

/** @type {Record<string, RuleResolver>} */
const RULE_REGISTRY = {
	computus: resolveComputus,
	"nth-weekday-of-month": resolveNthWeekdayOfMonth,
	"day-candidates": resolveDayCandidates,
	"month-weekday": resolveNthWeekdayOfMonth,
	"month-end": (rule, ctx) =>
		resolveNthWeekdayOfMonth({ ...rule, occurrence: "last" }, ctx),
};

/** @type {Map<string, DatePoint[]>} */
const _cache = new Map();

/**
 * @param {RelativeRule} rule
 * @returns {string}
 */
function _ruleKey(rule) {
	return JSON.stringify([
		rule.base,
		rule.month ?? null,
		rule.weekday ?? null,
		rule.occurrence ?? null,
		rule.offsetDays ?? null,
		rule.candidates ?? null,
	]);
}

/**
 * @param {RelativeRule} rule
 * @param {ResolverContext} [ctx]
 * @returns {DatePoint[]}
 */
export function resolveRule(rule, ctx = {}) {
	const fn = RULE_REGISTRY[rule.base];

	if (!fn) {
		throw new Error(
			`[persian-events] Unknown rule base: "${rule.base}". ` +
				`Known types: ${Object.keys(RULE_REGISTRY).join(", ")}. `,
		);
	}

	const cacheKey = `${_ruleKey(rule)}:${ctx.year ?? "-"}:${ctx.calendar ?? "-"}`;

	if (_cache.has(cacheKey)) {
		const cached = _cache.get(cacheKey);
		if (cached !== undefined) {
			return cached;
		}
	}

	const result = fn(rule, ctx);
	_cache.set(cacheKey, result);
	return result;
}
