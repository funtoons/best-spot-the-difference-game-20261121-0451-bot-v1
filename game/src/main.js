// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps (several in a slow frame, none in a fast one), and the
// renderer paints what is there. The game moves between title, play, paused,
// level-clear, game-over and victory screens.
//
// ?seed=N fixes the pictures' decorative scatter. ?shot=play|start|level|end
// (with &seed=N) stages that scene instead of running the loop, paints it
// twice and sets window.__shotReady for a screenshot. ?selftest=1 runs a
// scripted play-through in the page and writes the result into the document,
// so a headless browser can check the real rules without a mouse.
import { BEST_KEY, LEVEL_SECONDS, LEVELS, PANEL, PANEL_LEFT_X, PANEL_RIGHT_X, STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_FOUND, EVENT_LEVEL, EVENT_OVER, EVENT_WRONG, SCREEN_LEVEL, SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';
import { ACTION_CONFIRM, ACTION_HINT, ACTION_MUTE, ACTION_PAUSE, ACTION_RETRY, createInput } from './input.js';
import { createRenderer, hitButton, hitOverlay, SCREEN } from './render.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';
import { levelDiffs } from './scenes.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);
const selftest = params.get('selftest') === '1';

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

function panelOf(x, y) {
  if (y < PANEL.y || y > PANEL.y + PANEL.height) return null;
  if (x >= PANEL_LEFT_X && x <= PANEL_LEFT_X + PANEL.width) return { side: 0, sx: x - PANEL_LEFT_X, sy: y - PANEL.y };
  if (x >= PANEL_RIGHT_X && x <= PANEL_RIGHT_X + PANEL.width) return { side: 1, sx: x - PANEL_RIGHT_X, sy: y - PANEL.y };
  return null;
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, false);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

/** Scripted check of the real rules, for a headless run. */
function runSelftest() {
  const out = [];
  function check(name, ok) {
    out.push(`${ok ? 'PASS' : 'FAIL'} ${name}`);
  }
  const s = world.state;
  world.startGame();
  check('starts in play', s.screen === SCREEN_PLAY);
  check('level has 8 diffs', levelDiffs(0).length === 8);
  const d0 = levelDiffs(0)[0];
  const r1 = world.clickAt(d0.x, d0.y);
  check('correct click found', (r1 & EVENT_FOUND) !== 0 && s.found.length === 1);
  check('score 100 after first find', s.score === 100);
  const r2 = world.clickAt(300, 450);
  check('wrong click costs a mistake', (r2 & EVENT_WRONG) !== 0 && s.mistakes === 1);
  const before = s.score;
  const hint = world.useHint();
  check('hint reveals an unfound diff', hint >= 0 && !s.found.includes(hint));
  check('hint costs 50', s.score === before - 50);
  world.step(LEVEL_SECONDS + 1);
  check('clock running out ends the level', (s.screen === SCREEN_OVER));
  world.retryLevel();
  check('retry restarts the level', s.screen === SCREEN_PLAY && s.found.length === 0);
  const list = levelDiffs(0);
  for (let i = 0; i < list.length; i += 1) {
    if (!s.found.includes(i)) world.clickAt(list[i].x, list[i].y);
  }
  check('finding all 8 clears the level', s.screen === SCREEN_LEVEL && s.found.length === 8);
  world.nextLevel();
  check('next level starts', s.screen === SCREEN_PLAY && s.levelIndex === 1);
  const pre = document.createElement('pre');
  pre.id = 'selftest';
  pre.textContent = out.join('\n');
  document.body.appendChild(pre);
  document.title = out.some((l) => l.startsWith('FAIL')) ? 'SELFTEST FAIL' : 'SELFTEST PASS';
  window.__shotReady = true;
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.startGame();
    screen = SCREEN_PLAY;
    announce(`Playing level 1, ${LEVELS[0].name}. Find 8 differences.`);
  }

  function endLevelIfOver() {
    if (world.state.screen === SCREEN_LEVEL) {
      screen = SCREEN_LEVEL;
      audio.level();
      announce(`Level clear. Score ${world.state.score}.`);
    } else if (world.state.screen === SCREEN_WIN) {
      screen = SCREEN_WIN;
      audio.win();
      if (world.state.score > best) {
        best = world.state.score;
        saveBest(best);
      }
      announce(`You found them all. Final score ${world.state.score}.`);
    } else if (world.state.screen === SCREEN_OVER) {
      screen = SCREEN_OVER;
      announce(`Time up. You found ${world.state.found.length} of 8.`);
    }
  }

  function handleClicks() {
    for (const click of input.takeClicks()) {
      if (screen === SCREEN_PLAY || screen === SCREEN_PAUSED) {
        const btn = hitButton(click.x, click.y);
        if (btn === 'hint') {
          if (world.useHint() >= 0) audio.hint();
          continue;
        }
        if (btn === 'pause') {
          if (screen === SCREEN_PLAY) {
            screen = SCREEN_PAUSED;
            announce('Paused.');
          } else {
            screen = SCREEN_PLAY;
            announce('Playing.');
          }
          continue;
        }
        if (btn === 'menu') {
          world.toTitle();
          screen = SCREEN_TITLE;
          announce('Level select.');
          continue;
        }
      }
      if (screen === SCREEN_TITLE) {
        // Level dots in the footer pick a level; the card starts it.
        if (click.y > 600 && click.y < 680 && click.x >= 580 && click.x <= 720) {
          const picked = Math.round((click.x - 600) / 28);
          if (picked >= 0 && picked < LEVELS.length) world.state.selectedLevel = picked;
          continue;
        }
        if (hitOverlay(click.x, click.y, SCREEN_TITLE) === null && click.y > 500) startGame();
        continue;
      }
      const over = hitOverlay(click.x, click.y, screen);
      if (over === 'next') {
        world.nextLevel();
        screen = SCREEN_PLAY;
        continue;
      }
      if (over === 'retry') {
        world.retryLevel();
        screen = SCREEN_PLAY;
        continue;
      }
      if (over === 'again') {
        startGame();
        continue;
      }
      if (screen === SCREEN_PLAY) {
        const panel = panelOf(click.x, click.y);
        if (!panel) continue;
        const result = world.clickAt(panel.sx, panel.sy);
        if (result & EVENT_FOUND) {
          audio.found();
          announce(`Found: ${world.state.foundLabel}. ${world.state.found.length} of 8.`);
        } else if (result & EVENT_WRONG) {
          audio.wrong();
          announce('Not a difference. Minus 25 points.');
        }
        if (result & EVENT_LEVEL) endLevelIfOver();
      }
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    const digit = input.takeDigit();
    if (digit >= 1 && digit <= 5 && screen === SCREEN_TITLE) {
      world.state.selectedLevel = digit - 1;
    }
    if (actions & ACTION_MUTE) {
      const muted = audio.toggleMute();
      announce(muted ? 'Sound off.' : 'Sound on.');
    }
    if (actions & ACTION_HINT && screen === SCREEN_PLAY) {
      if (world.useHint() >= 0) audio.hint();
    }
    if (actions & ACTION_RETRY && (screen === SCREEN_PLAY || screen === SCREEN_OVER)) {
      world.retryLevel();
      screen = SCREEN_PLAY;
    }
    if (actions & ACTION_PAUSE) {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Paused.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Playing.');
      }
    }
    if (actions & ACTION_CONFIRM) {
      if (screen === SCREEN_TITLE) startGame();
      else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
      else if (screen === SCREEN_LEVEL) {
        world.nextLevel();
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_OVER) {
        world.retryLevel();
        screen = SCREEN_PLAY;
      } else if (screen === SCREEN_WIN) startGame();
    }
  }

  function frame(now) {
    const dt = Math.min(MAX_FRAME, (now - last) / 1000);
    last = now;
    accumulator += dt;
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP) {
        world.step(STEP);
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    if (world.state.screen === SCREEN_OVER && screen === SCREEN_PLAY) endLevelIfOver();
    handleClicks();
    handleActions();
    renderer.draw(world.state, screen, best, audio.isMuted());
    requestAnimationFrame(frame);
  }

  // Play-test hooks: the page's own state, for scripted checks.
  window.__game = {
    state: world.state,
    clickAt: (sx, sy) => world.clickAt(sx, sy),
    start: () => startGame(),
    screen: () => screen,
  };
  announce('Lantern Lane. Find 8 differences between the two pictures.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else if (selftest) runSelftest();
else runGame();
