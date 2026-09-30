import { useEffect, useRef, useState } from "react";
import { shuffleArray } from "../utils/game";
import { createDrumRoll } from "../utils/drumRoll";
import drumRollSource from "../assets/Sound/Drum roll sound effect.mp3";

export function useGame() {
  const [game, setGame] = useState({
    phase: "setup",
    order: [],
    display: [],
    revealed: 0,
    remaining: 0,
  });
  const timers = useRef(new Set());
  const sound = useRef(null);
  const [soundUnavailable, setSoundUnavailable] = useState(false);
  const locked = useRef(false);
  function clearTimers() {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }
  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      sound.current?.dispose();
      sound.current = null;
    };
  }, []);
  function later(callback, delay) {
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      callback();
    }, delay);
    timers.current.add(timer);
  }
  function reset() {
    clearTimers();
    sound.current?.stop();
    setSoundUnavailable(false);
    locked.current = false;
    setGame({
      phase: "setup",
      order: [],
      display: [],
      revealed: 0,
      remaining: 0,
    });
  }
  function start(names, duration) {
    if (locked.current) return;
    clearTimers();
    setSoundUnavailable(false);
    if (!sound.current) {
      sound.current = createDrumRoll(drumRollSource, () =>
        setSoundUnavailable(true),
      );
    }
    sound.current.prepare();
    locked.current = true;
    // Generate the ranking once; visual shuffling only changes the cup IDs.
    const order = shuffleArray(names);
    const ids = order.map((_, i) => i);
    const end = performance.now() + duration * 1000;
    setGame({
      phase: "shuffling",
      order,
      display: ids,
      revealed: 0,
      remaining: duration,
    });
    function reveal(count) {
      const finished = count === order.length;
      setGame((previous) => ({
        ...previous,
        phase: finished ? "finished" : "revealing",
        revealed: count,
      }));
      if (finished) locked.current = false;
      else {
        later(() => reveal(count + 1), 3000);
      }
    }
    function settle(step = 0) {
      if (step === 3) {
        setGame((previous) => ({
          ...previous,
          display: ids,
        }));
        later(() => {
          setGame((previous) => ({ ...previous, phase: "drumroll" }));
          sound.current.play(() => reveal(1));
        }, 650);
        return;
      }
      setGame((previous) => ({
        ...previous,
        display: shuffleArray(previous.display),
      }));
      later(() => settle(step + 1), 400 + step * 200);
    }
    function tick() {
      const remaining = Math.max(
        0,
        Math.ceil((end - performance.now()) / 1000),
      );
      if (remaining === 0) {
        setGame((previous) => ({
          ...previous,
          phase: "stopping",
          remaining: 0,
        }));
        settle();
        return;
      }
      setGame((previous) => ({
        ...previous,
        remaining,
        display: shuffleArray(previous.display),
      }));
      later(tick, Math.min(480, Math.max(1, end - performance.now())));
    }
    later(tick, 480);
  }
  return { game, start, reset, soundUnavailable };
}
