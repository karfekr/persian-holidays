import type { AdapterType } from "src/types";

let adapter: AdapterType | undefined = undefined;

export function setAdapter(next: AdapterType): void {
  if (typeof next?.firstWeekdayOfMonth !== "function" || typeof next?.monthLength !== "function") {
    throw new TypeError(
      "[persian-holidays] setAdapter() requires an object with " +
        "firstWeekdayOfMonth(calendar, year, month) and " +
        "monthLength(calendar, year, month) methods.",
    );
  }

  adapter = next;
}

export function getAdapter(callerHint?: string): AdapterType {
  if (!adapter) {
    const who = callerHint ? `Rule "${callerHint}" ` : "A relative rule ";

    throw new Error(
      `[persian-holidays] ${who}requires calendar arithmetic but no adapter has been registered.\n` +
        `Call setAdapter() once at startup.`,
    );
  }

  return adapter;
}

export function resolveAdapter(override?: AdapterType): AdapterType | undefined {
  return override ?? adapter ?? undefined;
}

export function clearAdapter(): void {
  adapter = undefined;
}
