// eslint.config.mjs
import { defineConfig, globalIgnores } from "eslint/config"
import next from "eslint-config-next"
import prettier from "eslint-config-prettier"

export default defineConfig([
  // Next.js ESLint config (DO NOT CALL IT AS A FUNCTION)
  next,

  // Disable ESLint rules that conflict with Prettier
  prettier,

  // Your ignores
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts"
  ]),
])
