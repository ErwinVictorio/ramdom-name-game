// One player per mounted game. Playback never controls the reveal timer.
export function createDrumRoll(source, onUnavailable) {
  const audio = new Audio(source);
  audio.preload = "auto";
  audio.loop = true;
  let version = 0;
  let active = false;

  audio.onerror = () => {
    if (active) onUnavailable();
  };

  function stop() {
    version += 1;
    active = false;
    audio.pause();
    audio.currentTime = 0;
  }

  function play(prepare = false) {
    stop();
    active = true;
    audio.muted = prepare;
    const request = version;
    // Preparing from the user's click unlocks playback without an audible roll.
    audio
      .play()
      .then(() => {
        if (prepare && request === version) {
          stop();
          audio.muted = false;
        }
      })
      .catch((error) => {
        if (request === version && error.name !== "AbortError") onUnavailable();
      });
  }

  return {
    prepare: () => play(true),
    play: () => play(),
    stop,
    dispose() {
      stop();
      audio.onerror = null;
    },
  };
}
