import { motion } from "motion/react";
import type { ChipColor } from "../../../domain/entities/ChipColor";
import { CHIP_COLOR_OPTIONS } from "../../utils/chips";

interface ColorSwatchPickerProps {
  /** Selected palette key; undefined = automatic hue. */
  value?: ChipColor;
  /** Called with the tapped color, or undefined when the selected swatch is tapped again (clears back to automatic). */
  onChange: (color?: ChipColor) => void;
}

/** Row of curated color dots; the selected one gets a springy peri ring. Optional — tap again to clear. */
export function ColorSwatchPicker({ value, onChange }: ColorSwatchPickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5" role="radiogroup" aria-label="Color">
      {CHIP_COLOR_OPTIONS.map(({ color, className }) => {
        const selected = value === color;
        return (
          <motion.button
            key={color}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={color}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.2 }}
            onClick={() => onChange(selected ? undefined : color)}
            className={`relative size-7 rounded-full ${className}`}
          >
            {selected && (
              <motion.span
                layoutId="swatchRing"
                transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                className="absolute -inset-1 rounded-full border-2 border-peri"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
