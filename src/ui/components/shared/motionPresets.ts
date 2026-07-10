/** Entrance used by staggered sections; parents set initial="hidden" animate="visible". */
export const riseIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, bounce: 0.2 } },
};
