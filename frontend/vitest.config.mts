import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      // Stub out the Firebase singleton so importing modules that transitively
      // depend on it does not initialise a real Firebase app during tests.
      "@/lib/firebase": fileURLToPath(
        new URL("./src/test/firebaseStub.ts", import.meta.url)
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: true,
  },
});
