import vinext from "vinext";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load all .env vars (empty prefix = no filter)
  const env = loadEnv(mode, process.cwd(), "");

  // Inject into server environments via static replacement
  // (Vite module runner doesn't share process.env with config)
  const serverEnv = JSON.stringify(env);

  return {
    plugins: [vinext()],
    optimizeDeps: {
      include: [
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "react-dom/client",
      ],
    },
    environments: {
      rsc: { define: { "process.env": serverEnv } },
      ssr: { define: { "process.env": serverEnv } },
    },
  };
});
