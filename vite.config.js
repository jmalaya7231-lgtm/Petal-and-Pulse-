import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Must match your GitHub repository name exactly (same spelling and capitals).
const REPO_NAME = "Petal-and-Pulse";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === "build" ? `/${REPO_NAME}/` : "/",
}));
