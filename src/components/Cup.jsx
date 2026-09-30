import {
  AnimatePresence,
  motion as Motion,
  useReducedMotion,
} from "motion/react";
import closedCup from "../assets/images/cup_close.png";
import openCup from "../assets/images/cup_opne.png";

export default function Cup({ position, name, open, shuffling, stopping }) {
  const reduced = useReducedMotion();
  return (
    <Motion.div
      layout={!reduced}
      className={`cup ${open ? "is-open" : ""}`}
      transition={{
        layout: { duration: stopping ? 0.65 : 0.42, ease: "easeInOut" },
      }}
    >
      <div className="cup-image">
        <AnimatePresence mode="wait" initial={false}>
          <Motion.img
            key={open ? "open" : "closed"}
            src={open ? openCup : closedCup}
            alt={open ? "Open cup" : "Closed cup"}
            initial={reduced ? false : { opacity: 0, scale: 0.85, y: -12 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: !reduced && shuffling ? [0, -8, 0] : 0,
              rotate: !reduced && shuffling ? [-5, 5, -5] : 0,
            }}
            exit={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: -24, rotate: 12, scale: 1.08 }
            }
            transition={{
              duration: 0.22,
              y: { repeat: shuffling ? Infinity : 0, duration: 0.48 },
              rotate: { repeat: shuffling ? Infinity : 0, duration: 0.48 },
            }}
          />
        </AnimatePresence>
      </div>
      <span className="cup-number">
        {open ? `Position #${position}` : `Cup ${position}`}
      </span>
      <div className="cup-name">
        {open && (
          <Motion.strong
            initial={{ opacity: 0, y: reduced ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {name}
          </Motion.strong>
        )}
      </div>
    </Motion.div>
  );
}
