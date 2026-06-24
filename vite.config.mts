import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		coverage: {
			exclude: ["**/node_modules/**", "**/index.ts, ", "vite.config.mts"],
		},
		globals: true,
		restoreMocks: true,
		env: {
			NODE_ENV: "test",
		},
		setupFiles: ["./src/__tests__/setup.ts"],
	},
	plugins: [tsconfigPaths()],
});
