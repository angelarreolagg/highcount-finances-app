import { motion } from "motion/react";
import { PencilIcon, TrashIcon } from "./icons";

interface RowActionsProps {
  /** Human name of the row's entity, used in the buttons' aria-labels. */
  label: string;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Hover-reveal edit/delete icons for list rows. The parent row needs the
 * `group` class: faintly visible on touch, revealed on hover/focus on desktop.
 */
export function RowActions({ label, onEdit, onDelete }: RowActionsProps) {
  return (
    <span className="flex shrink-0 items-center gap-1 opacity-60 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={onEdit}
        aria-label={`Edit ${label}`}
        className="flex size-7 items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
      >
        <PencilIcon size={14} />
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.9 }}
        onClick={onDelete}
        aria-label={`Delete ${label}`}
        className="flex size-7 items-center justify-center rounded-full bg-white/10 text-coral/80 hover:bg-coral/20 hover:text-coral"
      >
        <TrashIcon size={14} />
      </motion.button>
    </span>
  );
}
