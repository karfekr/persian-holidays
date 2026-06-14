import js from "@eslint/js";
import globals from "globals";
import jsdoc from "eslint-plugin-jsdoc";
import prettier from "eslint-config-prettier";

export default [
	{
		ignores: ["build/**", "lib/**", "data/**", "node_modules/**", ".github/**"],
	},

	js.configs.recommended,

	{
		files: ["**/*.js"],

		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				...globals.node,
				...globals.es2022,
			},
		},

		plugins: {
			jsdoc,
		},

		rules: {
			"no-console": "warn",
			"no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
			"jsdoc/check-types": "error",
			"jsdoc/check-param-names": "error",
			"jsdoc/require-param": "warn",
			"jsdoc/require-returns": "warn",
			"jsdoc/require-jsdoc": "off",
			"jsdoc/no-undefined-types": "error",
			"jsdoc/require-param-type": "error",
			"jsdoc/require-returns-type": "error",
		},
	},

	prettier,
];
