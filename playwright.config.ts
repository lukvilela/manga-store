import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config — fluxo E2E da loja Akira Mangas.
 *
 * Roda contra `npm run build && npm start` pra cobrir o ambiente
 * de producao (mais estavel que dev — sem HMR/turbopack ruido).
 *
 * Deterministico: fullyParallel desligado, 1 worker. O fluxo de
 * compra mexe em localStorage e ordena estado entre paginas, entao
 * paralelizar quebraria os asserts.
 *
 * Porta 3002 (e nao a default 3000): a maquina de dev do Lucas costuma
 * ter outros projetos Next ocupando 3000/3001 — fixar aqui evita
 * conflito sem precisar matar o que ja estiver rodando.
 */
const isCI = !!process.env.CI;
const PORT = Number(process.env.PORT ?? 3002);
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: BASE_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: "pt-BR",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  webServer: {
    command: `npm run build && npm start -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
  },
});
