// @ts-check
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Shared ESLint flat config for every workspace package.
 *
 * Module-boundary rules:
 *  - Workspace packages may only be imported through their public `exports`
 *    (no `@olnktr/<pkg>/src/...` deep imports).
 *  - Inside `packages/core/src/modules/*`, a module may import another module
 *    only through that module's `index.ts` (enforced by `coreModuleBoundaries`).
 */
export const ignores = {
  ignores: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/coverage/**",
    "**/migrations/**",
    "**/playwright-report/**",
    "**/test-results/**",
    "**/next-env.d.ts",
  ],
};

export const base = tseslint.config(
  ignores,
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
      globals: { ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksVoidReturn: { attributes: false } },
      ],
      "@typescript-eslint/only-throw-error": "error",
      // Async is used deliberately to guarantee promise-returning contracts
      // (e.g. adapter methods); TypeScript already enforces return types.
      "@typescript-eslint/require-await": "off",
      "no-console": ["error", { allow: ["warn", "error"] }],
      eqeqeq: ["error", "always"],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@olnktr/*/src", "@olnktr/*/src/*"],
              message: "Import workspace packages through their public exports only.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts", "**/test/**/*.ts", "**/e2e/**/*.ts"],
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/unbound-method": "off",
      // Vitest asymmetric matchers (expect.any, objectContaining, ...) are typed as any.
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
);

/** Restricts cross-module imports inside the core domain package. */
export const coreModuleBoundaries = {
  files: ["src/modules/**/*.ts"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            // "../<module>/<file>" (anything but the module's index) is forbidden;
            // "../../shared/*" (the shared kernel) is allowed.
            regex: "^\\.\\./(?!\\.\\.)[^/]+/(?!index$).+",
            message: "Domain modules must import other modules only through their public index.ts.",
          },
          {
            group: ["@olnktr/*/src", "@olnktr/*/src/*"],
            message: "Import workspace packages through their public exports only.",
          },
        ],
      },
    ],
  },
};

export default base;
