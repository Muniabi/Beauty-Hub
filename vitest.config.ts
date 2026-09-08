import { defineConfig } from "vitest/config";
import path from "node:path";
import { loadEnv } from "vite";

const env = loadEnv("development", process.cwd(), "");
if (env.MONGODB_URI && !process.env.MONGODB_URI) {
  process.env.MONGODB_URI = env.MONGODB_URI;
}

export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});
