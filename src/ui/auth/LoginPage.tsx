import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { useTranslation, Trans } from "react-i18next";
import { AuthForm } from "./AuthForm";
import { Button } from "../components/shared/Button";
import { Modal } from "../components/shared/Modal";
import { LanguageFlag } from "../i18n/LanguageFlag";

/** Background images for the login side panel — add files to public/login/ and list them here. */
const LOGIN_BACKDROPS = [
  "/login/login-bg-beach.png",
  "/login/login-bg-cdmx.png",
  "/login/login-bg-forest.png",
  "/login/login-bg-moon.png",
  "/login/login-bg-newyork.png",
  "/login/login-bg-newzealand.png",
  "/login/login-bg-paris.png",
  "/login/login-bg-piramids.png",
  "/login/login-bg-shibuya.png"
];

/** Dark-glass split-screen sign-in: the landing for new users and the destination after sign-out. */
export function LoginPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [reconsider, setReconsider] = useState(false);
  const lang = i18n.resolvedLanguage ?? "en";
  // Pick a random backdrop once per mount via a lazy initializer (keeps Math.random out of render).
  const [bg] = useState(
    () => LOGIN_BACKDROPS[Math.floor(Math.random() * LOGIN_BACKDROPS.length)],
  );

  return (
    <main className="relative min-h-dvh bg-night text-white">
      {/* Side image on desktop. */}
      <img
        src={bg}
        alt=""
        aria-hidden="true"
        className="absolute inset-y-0 right-0 hidden h-full w-1/2 object-cover lg:block"
      />
      {/* Even dark veil over the side image so the busy pixel-art stays calm. Uniform (no gradient
          asymmetry). Desktop only, non-interactive. */}
      <div
        aria-hidden="true"
        className="absolute inset-y-0 right-0 hidden w-1/2 bg-night/45 lg:block"
      />

      <div className="relative flex min-h-dvh flex-col lg:w-1/2">
        {/* Subtle animated glow behind the form — desktop only, purely decorative. */}
        <div
          className="login-aura pointer-events-none absolute inset-0 -z-0 hidden overflow-hidden lg:block"
          aria-hidden="true"
        />

        {/* Image banner on mobile, fading into the panel. */}
        <div className="relative h-40 shrink-0 lg:hidden">
          <img
            src={bg}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-night" />
        </div>

        <div className="relative z-10 flex flex-1 items-center justify-center px-6 py-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
            className="-mt-24 w-full max-w-sm lg:mt-0"
          >
            <div className="mb-6 text-center">
              <img
                src="/favicon/favicon-128x128.png"
                alt=""
                className="mx-auto size-16 rounded-2xl ring-1 ring-white/10 lg:size-[4.2rem]"
              />
              <h1 className="mt-4 text-2xl font-bold tracking-tight">
                <Trans
                  i18nKey="login.title"
                  components={{ holo: <span className="holo" /> }}
                />
              </h1>
              <p className="mt-1 text-sm text-white/60">
                {t("login.subtitle")}
              </p>
            </div>

            <AuthForm />

            <div className="mt-6 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => setReconsider(true)}
                className="w-full text-center text-sm text-white/60 transition-colors hover:text-white"
              >
                {t("login.continueLocal")}
              </button>
            </div>

            {/* Super-subtle language switch. */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => void i18n.changeLanguage("en")}
                className={`inline-flex items-center gap-1.5 ${lang === "en" ? "font-medium text-white/80" : "text-white/40 hover:text-white/70"}`}
              >
                <LanguageFlag lang="en" />
                English
              </button>
              <span className="text-white/20">·</span>
              <button
                type="button"
                onClick={() => void i18n.changeLanguage("es")}
                className={`inline-flex items-center gap-1.5 ${lang === "es" ? "font-medium text-white/80" : "text-white/40 hover:text-white/70"}`}
              >
                <LanguageFlag lang="es" />
                Español
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <Modal
        open={reconsider}
        title={t("login.reconsiderTitle")}
        onClose={() => setReconsider(false)}
      >
        <div className="space-y-4">
          <p className="text-sm text-white/70">{t("login.reconsiderBody")}</p>
          <div className="flex flex-col gap-2">
            <Button variant="primary" onClick={() => setReconsider(false)}>
              {t("login.reconsiderStay")}
            </Button>
            <Button onClick={() => navigate("/welcome")}>
              {t("login.reconsiderContinue")}
            </Button>
          </div>
        </div>
      </Modal>
    </main>
  );
}
