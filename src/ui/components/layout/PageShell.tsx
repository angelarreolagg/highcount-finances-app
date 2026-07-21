import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";
import { AddTransactionModal } from "../modals/AddTransactionModal";
import { CardsManagerModal } from "../modals/CardsManagerModal";
import { DeleteConfirmModal } from "../modals/DeleteConfirmModal";
import { LogSavingsModal } from "../modals/LogSavingsModal";
import { RegisterMsiModal } from "../modals/RegisterMsiModal";
import { SignInModal } from "../modals/SignInModal";
import { ActionDock } from "../shared/ActionDock";
import { ProfileMenu } from "../shared/ProfileMenu";
import { riseIn } from "../shared/motionPresets";

const NAV_ITEMS = [
  { to: "/", labelKey: "nav.home" },
  { to: "/expenses", labelKey: "nav.expenses" },
  { to: "/savings", labelKey: "nav.savings" },
];

interface PageShellProps {
  /** Rendered inside the shared hero zone (usually a RouteHero). */
  hero: ReactNode;
  /** Home locks the desktop viewport (no page scroll, full-bleed grid). */
  lockDesktop?: boolean;
  children: ReactNode;
}

export function PageShell({ hero, lockDesktop = false, children }: PageShellProps) {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <div className={`min-h-screen ${lockDesktop ? "xl:h-dvh xl:overflow-hidden" : ""}`}>
      <div className="app-backdrop" aria-hidden="true">
        <div className="hero-blob hero-blob-a -top-24 left-[8%] size-72" />
        <div className="hero-blob hero-blob-b top-28 right-[6%] size-80" />
      </div>

      <motion.main
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
        className={`pb-28 ${lockDesktop ? "xl:flex xl:h-full xl:flex-col" : ""}`}
      >
        {/* The header renders statically — it must not animate on route changes.
            3-column grid so the nav pills sit dead-center regardless of the
            wordmark/avatar widths on either side. */}
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 pt-5 lg:px-8">
          <NavLink
            to="/"
            aria-label="High Count — home"
            className="flex min-w-0 items-center gap-2 rounded-lg transition-opacity hover:opacity-80"
          >
            <img
              src="/favicon/favicon-128x128.png"
              alt=""
              className="size-7 shrink-0 rounded-lg ring-1 ring-white/10"
            />
            {/* Hidden on the narrowest screens so the centered nav never squeezes it into a wrap. */}
            <h1 className="hidden truncate text-lg font-bold tracking-tight sm:block">High Count</h1>
          </NavLink>
          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/10 p-1 text-xs backdrop-blur">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1 font-medium transition-colors ${
                    isActive ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                  }`
                }
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
          <div className="justify-self-end">
            <ProfileMenu year={year} />
          </div>
        </header>

        <motion.div variants={riseIn} className="px-5 lg:px-8">
          {hero}
        </motion.div>

        {/* Every route goes full-bleed at xl+ (no width cap); lockDesktop only adds
            the vertical viewport-lock so Home's grid fills the height too. The
            horizontal gutter matches the header/hero (px-5 lg:px-8) so content aligns
            with the logo/avatar at the screen edge. */}
        <div
          className={`mx-auto w-full max-w-md px-5 md:max-w-3xl lg:px-8 xl:max-w-none ${
            lockDesktop ? "xl:flex xl:min-h-0 xl:flex-1 xl:flex-col" : ""
          }`}
        >
          {children}
        </div>
      </motion.main>

      <ActionDock />
      <AddTransactionModal />
      <RegisterMsiModal />
      <LogSavingsModal />
      <CardsManagerModal />
      <SignInModal />
      {/* Rendered last so the confirmation stacks above any modal that triggered it. */}
      <DeleteConfirmModal />
    </div>
  );
}
