import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/gregorian.ts", "src/hijri.ts", "src/jalali.ts"],

  format: ["cjs", "esm"],

  dts: true,

  sourcemap: true,

  clean: true,
});
