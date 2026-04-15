module.exports = [
  {
    ignores: ["node_modules/**"]
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: {
        Module: "readonly",
        Log: "readonly",
        moment: "readonly",
        document: "readonly",
        Image: "readonly"
      }
    },
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
      "no-unused-vars": ["error", { "args": "none" }],
      "object-shorthand": "error",
      "prefer-template": "error"
    }
  }
];
