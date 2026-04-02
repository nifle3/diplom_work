import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

const cwd = process.cwd();
const packageJson = JSON.parse(
	readFileSync(resolve(cwd, "package.json"), "utf8"),
) as { name?: string };

const isWebPackage = packageJson.name === "web";

export default defineConfig({
	root: cwd,
	resolve: {
		alias: isWebPackage
			? [
					{
						find: /^@\//,
						replacement: `${resolve(cwd, "src")}/`,
					},
				]
			: [],
	},
	test: {
		environment: "node",
		include: ["src/**/*.test.{ts,tsx}"],
		passWithNoTests: true,
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "lcov", "json-summary"],
			reportsDirectory: "coverage",
			include: ["src/**/*.{ts,tsx}"],
			exclude: [
				"src/**/*.test.{ts,tsx}",
				"src/**/*.spec.{ts,tsx}",
				"src/**/*.d.ts",
				"dist/**",
				"coverage/**",
				".next/**",
				"node_modules/**",
			],
		},
	},
});
