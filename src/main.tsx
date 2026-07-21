import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { MotionConfig } from "motion/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import "./index.css";
import i18n from "./i18n";
import App from "./App.tsx";
import { queryClient } from "./infrastructure/queryClient";
import { bootstrapBackend } from "./ui/auth/bootstrap";
import { AuthProvider } from "./ui/auth/AuthProvider";

// Resolve the active backend (cloud if already signed in, else local) and seed it
// before first render, so there's no local-then-cloud flash.
bootstrapBackend().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <I18nextProvider i18n={i18n}>
          <MotionConfig reducedMotion="user">
            <BrowserRouter>
              {/* AuthProvider sits inside the router so it can navigate on sign in / out. */}
              <AuthProvider>
                <App />
              </AuthProvider>
            </BrowserRouter>
          </MotionConfig>
        </I18nextProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
});
