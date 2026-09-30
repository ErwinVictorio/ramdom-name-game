// Resume the audio context directly from Start Game's click/tap. The decoded
// clip can then play after the shuffle without relying on muted-media autoplay.
export function createDrumRoll(source, onUnavailable) {
  let context;
  let buffer;
  let loading;
  let loadController;
  let loadTimer;
  let node;
  let version = 0;
  let watchdog;
  let ready = Promise.resolve(false);
  let disposed = false;

  function stop() {
    version += 1;
    clearTimeout(watchdog);
    if (node) {
      node.onended = null;
      try {
        node.stop();
      } catch {
        /* A failed start leaves no active playback. */
      }
      node.disconnect();
      node = null;
    }
  }

  function loadClip() {
    if (buffer) return Promise.resolve(buffer);
    if (!loading) {
      loadController = new AbortController();
      loadTimer = setTimeout(() => loadController.abort(), 15000);
      loading = fetch(source, { signal: loadController.signal })
        .then((response) => {
          if (!response.ok) throw new Error("Unable to load sound effect");
          return response.arrayBuffer();
        })
        .then((data) => context.decodeAudioData(data))
        .then((decoded) => {
          buffer = decoded;
          return decoded;
        })
        .finally(() => {
          clearTimeout(loadTimer);
          loading = null;
        });
    }
    return loading;
  }

  function prepare() {
    stop();
    const request = version;
    try {
      const AudioContext =
        globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!context) context = new AudioContext();
      // No await before resume: it must execute within the user's gesture.
      const resumed = context.resume();
      ready = Promise.all([resumed, loadClip()])
        .then(() => context.state === "running")
        .catch(() => false);
    } catch {
      ready = Promise.resolve(false);
    }
    ready.then((available) => {
      if (!available && !disposed && request === version) onUnavailable();
    });
  }

  function play(onComplete) {
    stop();
    const request = version;
    function finish(failed = false) {
      if (disposed || request !== version) return;
      stop();
      if (failed) onUnavailable();
      onComplete?.();
    }
    // Also handles a resume promise that never resolves on a restricted browser.
    watchdog = setTimeout(() => finish(true), 15000);
    ready.then((available) => {
      if (disposed || request !== version) return;
      if (!available || context.state !== "running") {
        finish(true);
        return;
      }
      try {
        clearTimeout(watchdog);
        node = context.createBufferSource();
        node.buffer = buffer;
        node.loop = false;
        node.connect(context.destination);
        node.onended = () => finish();
        node.start();
        let lastTime = context.currentTime;
        let lastProgress = Date.now();
        function checkProgress() {
          if (disposed || request !== version) return;
          if (context.currentTime > lastTime) {
            lastTime = context.currentTime;
            lastProgress = Date.now();
          }
          if (Date.now() - lastProgress >= 15000) {
            finish(true);
            return;
          }
          watchdog = setTimeout(checkProgress, 1000);
        }
        watchdog = setTimeout(checkProgress, 1000);
      } catch {
        finish(true);
      }
    });
  }

  return {
    prepare,
    play,
    stop,
    dispose() {
      disposed = true;
      stop();
      clearTimeout(loadTimer);
      loadController?.abort();
      if (context && context.state !== "closed")
        context.close().catch(() => {});
    },
  };
}
