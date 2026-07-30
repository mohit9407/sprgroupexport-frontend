import next from "@next/eslint-plugin-next"
import prettier from "eslint-config-prettier"

export default [
  // JSX is also used inside .js files (app router pages, shared components)
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true }
      }
    }
  },

  // Next.js ESLint config
  {
    plugins: {
      "@next/next": next
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules
    }
  },
  
  // Prettier config (must be last)
  {
    ...prettier,
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts"
    ]
  }
]
