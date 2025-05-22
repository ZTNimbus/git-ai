import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [".next"],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {}, // no rules at all
    extends: [], // remove all inherited configs
  },
  {
    linterOptions: {
      reportUnusedDisableDirectives: false, // optional
    },
    languageOptions: {
      parserOptions: {
        projectService: true, // optional depending on your setup
      },
    },
  },
);
