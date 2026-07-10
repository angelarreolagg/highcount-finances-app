import { motion } from "motion/react";
import type { ReactNode } from "react";
import { NavLink } from "react-router";
import { AddTransactionModal } from "../modals/AddTransactionModal";
import { CardsManagerModal } from "../modals/CardsManagerModal";
import { LogSavingsModal } from "../modals/LogSavingsModal";
import { RegisterMsiModal } from "../modals/RegisterMsiModal";
import { ActionDock } from "../shared/ActionDock";
import { ProfileMenu } from "../shared/ProfileMenu";
import { riseIn } from "../shared/motionPresets";

const NAV_ITEMS = [
  { to: "/", label: "Home" },
  { to: "/expenses", label: "Expenses" },
  { to: "/savings", label: "Savings" },
];

interface PageShellProps {
  /** Rendered inside the shared hero zone (usually a RouteHero). */
  hero: ReactNode;
  /** Home locks the desktop viewport (no page scroll, full-bleed grid). */
  lockDesktop?: boolean;
  children: ReactNode;
}

export function PageShell({ hero, lockDesktop = false, children }: PageShellProps) {
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
        {/* The header renders statically — it must not animate on route changes. */}
        <header className="flex items-center justify-between gap-3 px-5 pt-5 lg:px-8">
          <h1 className="text-lg font-bold tracking-tight">High Count</h1>
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
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ProfileMenu year={year} />
        </header>

        <motion.div variants={riseIn} className="px-5 lg:px-8">
          {hero}
        </motion.div>

        <div
          className={`mx-auto w-full max-w-md md:max-w-3xl ${
            lockDesktop
              ? "xl:flex xl:min-h-0 xl:max-w-none xl:flex-1 xl:flex-col"
              : "xl:max-w-5xl"
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
    </div>
  );
}
