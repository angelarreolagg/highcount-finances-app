import { motion, useReducedMotion } from "motion/react";

export type RollDirection = "up" | "down";
export type RollMode = "pachinko" | "smooth";

/** 0–9 twice: reels travel exactly one full cycle between copies. */
const STRIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

interface DigitReelProps {
  digit: number;
  direction: RollDirection;
  mode: RollMode;
  /** Position of this digit among the digit reels (drives the stagger). */
  reelIndex: number;
}

function DigitReel({ digit, direction, mode, reelIndex }: DigitReelProps) {
  // "up": strip travels upward from the first copy to the second;
  // "down": starts at the second copy and travels down to the first.
  const initialIndex = direction === "up" ? digit : 10 + digit;
  const targetIndex = direction === "up" ? 10 + digit : digit;

  const transition =
    mode === "pachinko"
      ? // reels settle one after another, left to right, with a visible bounce
        { type: "spring" as const, bounce: 0.3, duration: 0.9 + reelIndex * 0.18 }
      : { type: "spring" as const, bounce: 0.15, duration: 0.7, delay: reelIndex * 0.05 };

  return (
    <span className="block overflow-hidden" style={{ height: "1em" }}>
      <motion.span
        className="block"
        initial={{ y: `${-initialIndex}em` }}
        animate={{ y: `${-targetIndex}em` }}
        transition={transition}
      >
        {STRIP.map((n, i) => (
          <span key={i} className="block leading-none" style={{ height: "1em" }}>
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

interface RollingNumberProps {
  /** Pre-formatted text, e.g. "$1,503" — digits roll, other characters stay static. */
  text: string;
  direction: RollDirection;
  mode?: RollMode;
  className?: string;
}

/** Slot-machine odometer: each digit of the formatted string is a rolling reel. */
export function RollingNumber({ text, direction, mode = "smooth", className = "" }: RollingNumberProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <span className={`leading-none ${className}`}>{text}</span>;
  }

  const chars = text.split("");
  const cells = chars.map((char, i) => ({
    char,
    // how many digit reels precede this one — drives the left→right stagger
    reelIndex: /\d/.test(char) ? chars.slice(0, i).filter((c) => /\d/.test(c)).length : null,
  }));

  return (
    <span className={`inline-flex leading-none ${className}`} aria-label={text}>
      {cells.map((cell, i) =>
        cell.reelIndex !== null ? (
          <DigitReel
            key={`${i}-${text.length}`}
            digit={Number(cell.char)}
            direction={direction}
            mode={mode}
            reelIndex={cell.reelIndex}
          />
        ) : (
          <span key={`${i}-${text.length}`} className="block leading-none" style={{ height: "1em" }}>
            {cell.char}
          </span>
        ),
      )}
    </span>
  );
}
