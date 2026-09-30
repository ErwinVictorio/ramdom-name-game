import { useEffect } from "react";
import confetti from "canvas-confetti";

export function useCompletionConfetti(finished) {
  useEffect(() => {
    if (!finished) return;

    // Let the last cup finish opening before celebrating the complete order.
    const timer = setTimeout(() => {
      confetti({
        particleCount: window.innerWidth < 700 ? 85 : 140,
        spread: 100,
        startVelocity: 42,
        origin: { x: 0.5, y: 0.65 },
        colors: ["#ef233c", "#ffb703", "#22c55e", "#38bdf8", "#a855f7"],
        ticks: 220,
        disableForReducedMotion: true,
      });
    }, 600);

    return () => {
      clearTimeout(timer);
      confetti.reset();
    };
  }, [finished]);
}
