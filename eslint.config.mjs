import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Standalone Node scripts — they are CommonJS and never bundled into the
    // app, so the browser/React rules in the Next config don't apply to them.
    "prisma/seeds/**",
    "scripts/**",
    "deploy/**",
  ]),
]);

export default eslintConfig;
