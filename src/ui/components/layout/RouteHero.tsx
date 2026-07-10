import { motion } from "motion/react";
import type { ReactNode } from "react";
import type { Money } from "../../../domain/value-objects/Money";
import { splitFormattedMoney } from "../../utils/money";
import { RollingNumber } from "../shared/RollingNumber";
import type { RollDirection, RollMode } from "../shared/RollingNumber";

export type HeroRoll = "pachinko" | "down" | "up";

const ROLL_CONFIG: Record<HeroRoll, { direction: RollDirection; mode: RollMode }> = {
  pachinko: { direction: "up", mode: "pachinko" },
  down: { direction: "down", mode: "smooth" },
  up: { direction: "up", mode: "smooth" },
};

interface RouteHeroProps {
  /** Small muted line above the number, e.g. "Total money · all accounts". */
  label: string;
  amount: Money;
  /** Digit-roll style for the big number (per docs/DESIGN.md: home pachinko, expenses down, savings up). */
  roll: HeroRoll;
  /** Sub-lines and chips rendered under the number. */
  children?: ReactNode;
}

/** The shared hero: centered label + big rolling number + route-specific lines. */
export function RouteHero({ label, amount, roll, children }: RouteHeroProps) {
  const split = splitFormattedMoney(amount);
  const { direction, mode } = ROLL_CONFIG[roll];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", bounce: 0.2, delay: 0.1 }}
      className="pt-10 pb-8 text-center lg:pt-14 lg:pb-10"
    >
      <p className="text-sm text-white/70">{label}</p>
      <div className="mt-2 flex items-end justify-center font-bold tabular-nums">
        <RollingNumber
          text={split.main}
          direction={direction}
          mode={mode}
          className="text-5xl lg:text-6xl"
        />
        {split.cents !== null && (
          <RollingNumber
            text={`.${split.cents}`}
            direction={direction}
            mode={mode}
            className="text-3xl text-white/80 lg:text-4xl"
          />
        )}
      </div>
      {children}
    </motion.div>
  );
}
