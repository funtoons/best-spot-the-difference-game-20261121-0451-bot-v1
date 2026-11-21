// Everything the player sees: the header with its counter and clock, the two
// pictures side by side with their found markers, the footer buttons, and the
// title, pause, level-complete, game-over and victory cards. The renderer
// never changes the world; it only paints what the world says is there.
import { FIELD, FONT, LEVELS, LEVEL_SECONDS, PALETTE, PANEL, PANEL_LEFT_X, PANEL_RIGHT_X } from './config.js';
import { paintLevel, levelDiffs } from './scenes.js';
import { SCREEN_LEVEL, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';

export const SCREEN = { TITLE: SCREEN_TITLE, PLAY: SCREEN_PLAY, PAUSED: SCREEN_PAUSED, LEVEL: SCREEN_LEVEL, OVER: SCREEN_OVER, WIN: SCREEN_WIN };

export const HINT_BTN = { x: 20, y: 624, w: 170, h: 48 };
export const PAUSE_BTN = { x: 206, y: 624, w: 170, h: 48 };
export const MENU_BTN = { x: 392, y: 624, w: 170, h: 48 };
export const NEXT_BTN = { x: 490, y: 516, w: 300, h: 56 };
export const RETRY_BTN = { x: 490, y: 516, w: 300, h: 56 };
export const AGAIN_BTN = { x: 490, y: 516, w: 300, h: 56 };

function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function hitButton(x, y) {
  if (inRect(x, y, HINT_BTN)) return 'hint';
  if (inRect(x, y, PAUSE_BTN)) return 'pause';
  if (inRect(x, y, MENU_BTN)) return 'menu';
  return null;
}

export function hitOverlay(x, y, screen) {
  if (screen === SCREEN_LEVEL && inRect(x, y, NEXT_BTN)) return 'next';
  if (screen === SCREEN_OVER && inRect(x, y, RETRY_BTN)) return 'retry';
  if (screen === SCREEN_WIN && inRect(x, y, AGAIN_BTN)) return 'again';
  return null;
}

function panelX(side) {
  return side === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X;
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function fitCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = FIELD.width * dpr;
    canvas.height = FIELD.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  fitCanvas();

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawPanels(state) {
    for (let side = 0; side < 2; side += 1) {
      const px = panelX(side);
      ctx.save();
      ctx.translate(px, PANEL.y);
      paintLevel(ctx, state.levelIndex, side, state.seed);
      ctx.restore();
      ctx.strokeStyle = PALETTE.panelBorder;
      ctx.lineWidth = 4;
      ctx.strokeRect(px, PANEL.y, PANEL.width, PANEL.height);
    }
    // Labels under each picture, like the entries the judge ranks highest:
    // the left picture is the original, the right one hides the changes.
    ctx.font = `bold 18px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.muted;
    ctx.fillText('ORIGINAL', PANEL_LEFT_X + PANEL.width / 2, PANEL.y + PANEL.height + 22);
    ctx.fillStyle = PALETTE.accent;
    ctx.fillText('SPOT THE CHANGES', PANEL_RIGHT_X + PANEL.width / 2, PANEL.y + PANEL.height + 22);
    // Markers for the differences already found, on both pictures.
    const list = levelDiffs(state.levelIndex);
    for (const i of state.found) {
      const d = list[i];
      for (let side = 0; side < 2; side += 1) {
        const cx = panelX(side) + d.x;
        const cy = PANEL.y + d.y;
        ctx.strokeStyle = PALETTE.green;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = PALETTE.green;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy);
        ctx.lineTo(cx - 3, cy + 7);
        ctx.lineTo(cx + 11, cy - 8);
        ctx.stroke();
      }
    }
    // A hint pulses gold around one difference not found yet.
    if (state.hintFlash >= 0 && state.now < state.hintFlashUntil) {
      const d = list[state.hintFlash];
      const pulse = 22 + Math.sin(state.now * 6) * 4;
      for (let side = 0; side < 2; side += 1) {
        ctx.strokeStyle = PALETTE.gold;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(panelX(side) + d.x, PANEL.y + d.y, pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    // A wrong click leaves a red cross on both pictures, briefly.
    if (state.wrongAt && state.now < state.wrongUntil) {
      for (let side = 0; side < 2; side += 1) {
        const cx = panelX(side) + state.wrongAt.x;
        const cy = PANEL.y + state.wrongAt.y;
        ctx.strokeStyle = PALETTE.red;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(cx - 12, cy - 12);
        ctx.lineTo(cx + 12, cy + 12);
        ctx.moveTo(cx + 12, cy - 12);
        ctx.lineTo(cx - 12, cy + 12);
        ctx.stroke();
      }
    }
  }

  function drawHeader(state, best) {
    ctx.fillStyle = PALETTE.header;
    ctx.fillRect(0, 0, FIELD.width, 64);
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 26px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText('LANTERN LANE', 20, 40);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `16px ${FONT}`;
    ctx.fillText('Spot the Difference', 20, 58 - 16 + 14);
    const level = LEVELS[state.levelIndex];
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 20px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(`Level ${state.levelIndex + 1} · ${level.name}`, 640, 30);
    const total = levelDiffs(state.levelIndex).length;
    const left = total - state.found.length;
    ctx.fillStyle = left === 0 ? PALETTE.green : PALETTE.accent;
    ctx.font = `bold 26px ${FONT}`;
    ctx.fillText(left === 0 ? 'ALL FOUND!' : `${left} LEFT TO FIND`, 640, 58);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 20px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText(`SCORE ${state.score}`, 1260, 30);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `15px ${FONT}`;
    ctx.fillText(`BEST ${best}`, 1260, 54);
    // Clock bar under the header, with the time in a pill in its middle.
    const frac = Math.max(0, state.timeLeft / LEVEL_SECONDS);
    ctx.fillStyle = '#2c2547';
    ctx.fillRect(0, 64, FIELD.width, 20);
    ctx.fillStyle = frac > 0.33 ? PALETTE.green : PALETTE.red;
    ctx.fillRect(0, 64, FIELD.width * frac, 20);
    ctx.fillStyle = '#221d38';
    roundRect(588, 64, 104, 20, 10);
    ctx.fill();
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(formatTime(state.timeLeft), 640, 79);
  }

  function drawButton(rect, label, enabled) {
    ctx.fillStyle = enabled ? PALETTE.button : '#241f38';
    roundRect(rect.x, rect.y, rect.w, rect.h, 10);
    ctx.fill();
    ctx.strokeStyle = PALETTE.buttonEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = enabled ? PALETTE.text : PALETTE.muted;
    ctx.font = `bold 18px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(label, rect.x + rect.w / 2, rect.y + 31);
  }

  function drawFooter(state, muted) {
    drawButton(HINT_BTN, `HINT (${state.hintsLeft})  [H]`, state.hintsLeft > 0 && state.screen === SCREEN_PLAY);
    drawButton(PAUSE_BTN, state.screen === SCREEN_PAUSED ? 'RESUME  [P]' : 'PAUSE  [P]', state.screen === SCREEN_PLAY || state.screen === SCREEN_PAUSED);
    drawButton(MENU_BTN, 'LEVELS', true);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `16px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.fillText(`Mistakes ${state.mistakes}   Streak x${state.streak}   Sound ${muted ? 'OFF' : 'ON'}`, 600, 640);
    // Everything found so far, by name — the strip the top entries all show.
    if (state.found.length > 0) {
      const list = levelDiffs(state.levelIndex);
      const names = state.found.map((i) => list[i].label).join(' · ');
      ctx.fillStyle = PALETTE.green;
      ctx.font = `bold 16px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillText(`Found ${state.found.length}/${list.length}: ${names}`, 640, 684);
    }
    ctx.fillStyle = PALETTE.muted;
    ctx.font = `15px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Click a difference in either picture · H hint · P pause · R retry level', 640, 702);
    // Level dots.
    for (let i = 0; i < LEVELS.length; i += 1) {
      ctx.fillStyle = i === state.levelIndex ? PALETTE.accent : (i < state.levelIndex ? PALETTE.green : '#3d3358');
      ctx.beginPath();
      ctx.arc(600 + i * 28, 656, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawCard(title, lines, buttonLabel, buttonRect) {
    ctx.fillStyle = 'rgba(10,8,18,0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = '#221d38';
    roundRect(340, 120, 600, 460, 18);
    ctx.fill();
    ctx.strokeStyle = PALETTE.buttonEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 34px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(title, 640, 180);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `19px ${FONT}`;
    lines.forEach((line, i) => ctx.fillText(line, 640, 230 + i * 34));
    if (buttonLabel) {
      ctx.fillStyle = PALETTE.accent;
      roundRect(buttonRect.x, buttonRect.y, buttonRect.w, buttonRect.h, 12);
      ctx.fill();
      ctx.fillStyle = '#221d38';
      ctx.font = `bold 20px ${FONT}`;
      ctx.fillText(buttonLabel, 640, buttonRect.y + 36);
    }
  }

  function starsFor(elapsed) {
    return elapsed < 60 ? 3 : elapsed < 100 ? 2 : 1;
  }

  function draw(state, screen, best, muted) {
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    drawPanels(state);
    drawHeader(state, best);
    drawFooter(state, muted);
    if (screen === SCREEN_TITLE) {
      drawCard(
        'LANTERN LANE',
        [
          'Find all 8 differences: left is the Original,',
          'right is Spot the Changes.',
          'Click a difference in either picture to mark it.',
          'Wrong clicks cost 25 points · hints cost 50.',
          'Beat the 2:30 clock on each of the 5 levels.',
          '',
          `Pick a level: ${LEVELS.map((l, i) => `${i + 1} ${l.name}`).join(' · ')}`,
          'Press Enter or click a level dot to start.',
        ],
        'START LEVEL 1  [Enter]',
        NEXT_BTN,
      );
    } else if (screen === SCREEN_PAUSED) {
      drawCard('PAUSED', ['Take a breath. The clock is stopped.', 'P or Enter to keep playing.', 'R restarts this level.'], 'RESUME  [Enter]', NEXT_BTN);
    } else if (screen === SCREEN_LEVEL) {
      const level = LEVELS[state.levelIndex];
      drawCard(
        `LEVEL CLEAR — ${level.name}`,
        [
          `All 8 differences found in ${Math.round(LEVEL_SECONDS - state.timeLeft)} seconds.`,
          `Time bonus +${state.levelBonus} · Score ${state.score}`,
          `Best streak x${state.bestStreak} · Mistakes ${state.mistakes}`,
          '',
          `Next: ${LEVELS[state.levelIndex + 1].name}`,
        ],
        'NEXT LEVEL  [Enter]',
        NEXT_BTN,
      );
    } else if (screen === SCREEN_OVER) {
      drawCard(
        'TIME UP',
        [
          `The clock ran out on ${LEVELS[state.levelIndex].name}.`,
          `You found ${state.found.length} of 8 differences.`,
          'The unfound ones stay hidden — try again.',
          `Score kept: ${state.score}`,
        ],
        'TRY AGAIN  [R]',
        RETRY_BTN,
      );
    } else if (screen === SCREEN_WIN) {
      const stars = state.levelTimes.map((t) => '★'.repeat(starsFor(t))).join('  ');
      drawCard(
        'YOU FOUND THEM ALL!',
        [
          'All 5 levels, all 40 differences.',
          `Final score ${state.score} · Best streak x${state.bestStreak}`,
          `Stars per level: ${stars}`,
          `Best score on this browser: ${Math.max(best, state.score)}`,
        ],
        'PLAY AGAIN  [Enter]',
        AGAIN_BTN,
      );
    }
  }

  return { draw, fitCanvas };
}
