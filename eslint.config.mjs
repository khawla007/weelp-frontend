import { includeIgnoreFile } from "@eslint/compat";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

// Import Next.js ESLint configs (ESLint 9 flat format)
import nextConfig from "eslint-config-next";
import nextWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  includeIgnoreFile(gitignorePath),
  ...nextConfig,
  ...nextWebVitals,
  {
    rules: {
      "@next/next/no-img-element": "off",
      "react-hooks/exhaustive-deps": "off",
    },
  },
];

export default eslintConfig;
