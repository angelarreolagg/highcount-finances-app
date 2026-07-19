import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { MotionConfig } from "motion/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import "./index.css";
import i18n from "./i18n";
import App from "./App.tsx";
import { initializeApp } from "./infrastructure/di/container";

const queryClient = new QueryClient();

// Seed reference data (categories, default cash account) before first render.
initializeApp().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <MotionConfig reducedMotion="user">
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </MotionConfig>
        </I18nextProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
});
