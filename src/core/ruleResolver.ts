import type { DatePoint, RelativeRule, ResolverContext, RuleResolver } from "src/types";

import { getAdapter } from "./adapter";

function requireCtx(
	ruleName: string,
	ctx: ResolverContext,
	...fields: (keyof ResolverContext)[]
): boolean {
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

function requireRule(
	ruleName: string,
	rule: RelativeRule,
	...fields: (keyof RelativeRule)[]
): void {
	for (const f of fields) {
		if (rule[f] == null) {
			throw new Error(
				`[persian-events] Rule "${ruleName}" requires rule.${String(f)} in the data definition.`,
			);
		}
	}
}

const resolveComputus: RuleResolver = (rule, ctx) => {
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
};

const resolveNthWeekdayOfMonth: RuleResolver = (rule, ctx) => {
	if (requireCtx("nth-weekday-of-month", ctx, "year")) return [];

	requireRule("nth-weekday-of-month", rule, "month", "weekday");

	const { calendar = "gregorian" } = ctx;
	const year = ctx.year;
	const { month, weekday, occurrence = "first" } = rule;

	if (year == null) return [];

	if (month == null) {
		throw new Error(
			`[persian-events] nth-weekday-of-month: rule.month is required and must be a number.`,
		);
	}

	if (weekday == null) {
		throw new Error(
			`[persian-events] nth-weekday-of-month: rule.weekday is required and must be a number.`,
		);
	}

	const SUPPORTED = ["jalali", "hijri", "gregorian"] as const;

	if (!SUPPORTED.includes(calendar)) {
		throw new Error(
			`[persian-events] nth-weekday-of-month: unsupported calendar "${calendar}". ` +
				`Supported: ${SUPPORTED.join(", ")}.`,
		);
	}

	const adapter = ctx.adapter ?? getAdapter("nth-weekday-of-month");

	const firstWeekday = adapter.firstWeekdayOfMonth(calendar, year, month);
	const totalDays = adapter.monthLength(calendar, year, month);

	const matches: number[] = [];

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
};

const resolveDayCandidates: RuleResolver = (rule) => {
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
};

const RULE_REGISTRY: Record<string, RuleResolver> = {
	computus: resolveComputus,
	"nth-weekday-of-month": resolveNthWeekdayOfMonth,
	"day-candidates": resolveDayCandidates,
	"month-weekday": resolveNthWeekdayOfMonth,
	"month-end": (rule, ctx) => resolveNthWeekdayOfMonth({ ...rule, occurrence: "last" }, ctx),
};

const cache = new Map<string, DatePoint[]>();

function ruleKey(rule: RelativeRule): string {
	return JSON.stringify([
		rule.base,
		rule.month ?? null,
		rule.weekday ?? null,
		rule.occurrence ?? null,
		rule.offsetDays ?? null,
		rule.candidates ?? null,
	]);
}

export function resolveRule(rule: RelativeRule, ctx: ResolverContext = {}): DatePoint[] {
	const fn = RULE_REGISTRY[rule.base];

	if (!fn) {
		throw new Error(
			`[persian-events] Unknown rule base: "${rule.base}". ` +
				`Known types: ${Object.keys(RULE_REGISTRY).join(", ")}.`,
		);
	}

	const cacheKey = `${ruleKey(rule)}:${ctx.year ?? "-"}:${ctx.calendar ?? "-"}`;

	const cached = cache.get(cacheKey);

	if (cached !== undefined) {
		return cached;
	}

	const result = fn(rule, ctx);

	cache.set(cacheKey, result);

	return result;
}
