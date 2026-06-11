/**
 * @typedef {import('./types.js').RelativeRule} RelativeRule
 * @typedef {import('./types.js').ResolverContext} ResolverContext
 * @typedef {import('./types.js').DatePoint} DatePoint
 * @typedef {(rule: RelativeRule, ctx: ResolverContext) => DatePoint[]} RuleResolver
 */

/**
 * @param {string} ruleName
 * @param {ResolverContext} ctx
 * @param {...string} fields
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
 * @param {...string} fields
 */
function requireRule(ruleName, rule, ...fields) {
	for (const f of fields) {
		if (rule[f] == null) {
			throw new Error(
				`[persian-events] Rule "${ruleName}" requires rule.${f} in the YAML definition.`,
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

import {
	CalendarDate,
	PersianCalendar,
	IslamicCivilCalendar,
	GregorianCalendar,
	getDayOfWeek,
	endOfMonth,
	startOfMonth,
} from "@internationalized/date";

const _CAL = {
	jalali: new PersianCalendar(),
	hijri: new IslamicCivilCalendar(),
	gregorian: new GregorianCalendar(),
};

const _LOCALE = {
	jalali: "fa-IR",
	hijri: "fa-IR",
	gregorian: "en-US",
};

/**
 * @type {RuleResolver}
 */
function resolveNthWeekdayOfMonth(rule, ctx) {
	if (requireCtx("nth-weekday-of-month", ctx, "year")) return [];
	requireRule("nth-weekday-of-month", rule, "month", "weekday");

	const { year, calendar = "gregorian" } = ctx;
	const { month, weekday, occurrence = "first" } = rule;

	const cal = _CAL[calendar];
	const locale = _LOCALE[calendar];

	if (!cal) {
		throw new Error(
			`[persian-events] nth-weekday-of-month: unsupported calendar "${calendar}". ` +
				`Supported: jalali, hijri, gregorian.`,
		);
	}

	const monthStart = startOfMonth(new CalendarDate(cal, year, month, 1));
	const monthEnd = endOfMonth(monthStart);

	const matches = [];
	let cur = monthStart;

	while (cur.compare(monthEnd) <= 0) {
		if (getDayOfWeek(cur, locale) === weekday) {
			matches.push(cur.day);
		}
		cur = cur.add({ days: 1 });
	}

	if (matches.length === 0) {
		throw new Error(
			`[persian-events] nth-weekday-of-month: weekday ${weekday} not found in ` +
				`${calendar} ${year}/${month}. Check rule.weekday convention.`,
		);
	}

	const idx =
		occurrence === "last"
			? matches.length - 1
			: ({ first: 0, second: 1, third: 2, fourth: 3 }[occurrence] ?? 0);

	if (matches[idx] == null) {
		throw new Error(
			`[persian-events] nth-weekday-of-month: occurrence "${occurrence}" out of range ` +
				`(found ${matches.length} matching days) for ${calendar} ${year}/${month} weekday=${weekday}.`,
		);
	}

	return [{ month, day: matches[idx] }];
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

	return rule.candidates.map((day) => ({
		month: rule.month,
		day,
	}));
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
 * @param {string} base
 * @param {RuleResolver} fn
 */
export function registerRuleResolver(base, fn) {
	if (typeof fn !== "function") {
		throw new TypeError(
			`[persian-events] Resolver for "${base}" must be a function.`,
		);
	}

	RULE_REGISTRY[base] = fn;
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
				`Known types: ${Object.keys(RULE_REGISTRY).join(", ")}. ` +
				`Use registerRuleResolver() to add custom types.`,
		);
	}

	const cacheKey = `${_ruleKey(rule)}:${ctx.year ?? "-"}:${ctx.calendar ?? "-"}`;

	if (_cache.has(cacheKey)) {
		return _cache.get(cacheKey);
	}

	const result = fn(rule, ctx);

	_cache.set(cacheKey, result);

	return result;
}

export function clearRuleCache() {
	_cache.clear();
}
