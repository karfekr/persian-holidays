import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/gregorian.ts", "src/hijri.ts", "src/jalali.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
});
