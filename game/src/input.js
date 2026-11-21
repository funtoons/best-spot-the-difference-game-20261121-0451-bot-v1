// Keyboard and mouse, in one place. Mouse clicks are reported in logical
// canvas coordinates; the game decides what a click means for its screen.
// Keys: Enter/Space confirm, P or Esc pause, H hint, R retry, M mute,
// 1-5 pick a level on the title screen.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_RETRY = 8;
export const ACTION_MUTE = 16;

export function createInput(canvas) {
  let actions = 0;
  let clicks = [];
  let digit = 0;

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    clicks.push(toLogical(event));
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    if (event.key === 'Enter' || event.key === ' ') {
      actions |= ACTION_CONFIRM;
      event.preventDefault();
    } else if (event.key === 'p' || event.key === 'P' || event.key === 'Escape') {
      actions |= ACTION_PAUSE;
    } else if (event.key === 'h' || event.key === 'H') {
      actions |= ACTION_HINT;
    } else if (event.key === 'r' || event.key === 'R') {
      actions |= ACTION_RETRY;
    } else if (event.key === 'm' || event.key === 'M') {
      actions |= ACTION_MUTE;
    } else if (event.key >= '1' && event.key <= '5') {
      digit = Number.parseInt(event.key, 10);
    }
  });

  return {
    takeActions() {
      const a = actions;
      actions = 0;
      return a;
    },
    takeClicks() {
      const c = clicks;
      clicks = [];
      return c;
    },
    takeDigit() {
      const d = digit;
      digit = 0;
      return d;
    },
  };
}
