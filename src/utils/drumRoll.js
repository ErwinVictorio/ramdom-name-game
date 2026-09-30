// One full drum roll gates the first reveal. Reset invalidates all callbacks.
export function createDrumRoll(source, onUnavailable) {
  const audio = new Audio(source);
  audio.preload = "auto";
  audio.loop = false;
  let version = 0;
  let watchdog;

  function stop() {
    version += 1;
    clearTimeout(watchdog);
    audio.onended = null;
    audio.onerror = null;
    audio.ontimeupdate = null;
    audio.pause();
    audio.currentTime = 0;
  }

  function play(prepare = false, onComplete) {
    stop();
    audio.muted = prepare;
    const request = version;
    function finish(failed = false) {
      if (request !== version) return;
      stop();
      if (failed) onUnavailable();
      onComplete?.();
    }
    audio.onerror = () => finish(true);
    audio.onended = () => finish();
    // A blocked/stalled load must not leave the game locked forever.
    // Actual progress extends this timeout, so a playing clip is never cut short.
    let lastPosition = -1;
    function checkProgress() {
      if (audio.currentTime > lastPosition) {
        lastPosition = audio.currentTime;
        clearTimeout(watchdog);
        watchdog = setTimeout(() => finish(true), 15000);
      }
    }
    checkProgress();
    audio.ontimeupdate = checkProgress;
    // Preparing from the user's click unlocks playback without an audible roll.
    audio
      .play()
      .then(() => {
        if (prepare && request === version) {
          stop();
          audio.muted = false;
        }
      })
      .catch(() => {
        if (request === version) finish(true);
      });
  }

  return {
    prepare: () => play(true),
    play: (onComplete) => play(false, onComplete),
    stop,
    dispose() {
      stop();
      audio.onerror = null;
    },
  };
}
