// Short WebAudio blips, synthesised at run time: no audio files, no network.
// Every sound is guarded, so a browser without audio still plays silently.
export function createAudio() {
  let ctx = null;
  let muted = false;

  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch {
      ctx = null;
    }
    return ctx;
  }

  function tone(freq, start, dur, type, gain) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain, ac.currentTime + start);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
      osc.connect(g);
      g.connect(ac.destination);
      osc.start(ac.currentTime + start);
      osc.stop(ac.currentTime + start + dur + 0.02);
    } catch {
      // Sound is garnish; a failure never stops the game.
    }
  }

  return {
    found() { tone(880, 0, 0.12, 'sine', 0.12); tone(1318, 0.08, 0.18, 'sine', 0.1); },
    wrong() { tone(180, 0, 0.18, 'sawtooth', 0.06); },
    hint() { tone(660, 0, 0.1, 'triangle', 0.08); tone(990, 0.08, 0.12, 'triangle', 0.07); },
    level() { tone(523, 0, 0.12, 'sine', 0.1); tone(659, 0.1, 0.12, 'sine', 0.1); tone(784, 0.2, 0.2, 'sine', 0.1); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.22, 'sine', 0.1)); },
    toggleMute() { muted = !muted; return muted; },
    isMuted() { return muted; },
  };
}
