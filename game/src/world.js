// The rules of Lantern Lane: five levels, eight differences each, one clock.
// A click on either picture is mapped into picture coordinates and checked
// against the nearest difference not found yet. Finding one scores, missing
// costs points and breaks the streak, a hint shows one difference for points.
import { CLICK_RADIUS, HINTS_PER_LEVEL, LEVEL_SECONDS, LEVELS, SCORE } from './config.js';
import { levelDiffs } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL = 'level';
export const SCREEN_OVER = 'over';
export const SCREEN_WIN = 'win';

export const EVENT_NONE = 0;
export const EVENT_FOUND = 1;
export const EVENT_WRONG = 2;
export const EVENT_LEVEL = 4;
export const EVENT_OVER = 8;

export function createWorld(seed) {
  const state = {
    seed,
    screen: SCREEN_TITLE,
    levelIndex: 0,
    selectedLevel: 0,
    found: [],
    mistakes: 0,
    hintsLeft: HINTS_PER_LEVEL,
    hintFlash: -1,
    hintFlashUntil: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    timeLeft: LEVEL_SECONDS,
    levelScores: [0, 0, 0, 0, 0],
    levelTimes: [0, 0, 0, 0, 0],
    totalFound: 0,
    wrongAt: null,
    wrongUntil: 0,
    now: 0,
    foundLabel: '',
    levelBonus: 0,
  };

  function diffs() {
    return levelDiffs(state.levelIndex);
  }

  function resetLevel(index) {
    state.levelIndex = index;
    state.selectedLevel = index;
    state.found = [];
    state.mistakes = 0;
    state.hintsLeft = HINTS_PER_LEVEL;
    state.hintFlash = -1;
    state.streak = 0;
    state.timeLeft = LEVEL_SECONDS;
    state.wrongAt = null;
    state.foundLabel = '';
    state.levelBonus = 0;
  }

  function startLevel(index) {
    resetLevel(index);
    state.screen = SCREEN_PLAY;
  }

  function startGame() {
    state.score = 0;
    state.totalFound = 0;
    state.levelScores = [0, 0, 0, 0, 0];
    state.levelTimes = [0, 0, 0, 0, 0];
    state.bestStreak = 0;
    startLevel(state.selectedLevel);
  }

  /** Click at picture coordinates (sx, sy) inside either panel. */
  function clickAt(sx, sy) {
    if (state.screen !== SCREEN_PLAY) return EVENT_NONE;
    const list = diffs();
    let best = -1;
    let bestDist = CLICK_RADIUS;
    for (let i = 0; i < list.length; i += 1) {
      if (state.found.includes(i)) continue;
      const d = Math.hypot(list[i].x - sx, list[i].y - sy);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    }
    if (best < 0) {
      state.mistakes += 1;
      state.streak = 0;
      state.score = Math.max(0, state.score + SCORE.wrong);
      state.wrongAt = { x: sx, y: sy };
      state.wrongUntil = state.now + 0.8;
      state.foundLabel = '';
      return EVENT_WRONG;
    }
    state.found.push(best);
    state.totalFound += 1;
    state.streak += 1;
    state.bestStreak = Math.max(state.bestStreak, state.streak);
    const gained = SCORE.found + SCORE.streakBonus * (state.streak - 1);
    state.score += gained;
    state.foundLabel = list[best].label;
    state.wrongAt = null;
    if (state.found.length === list.length) {
      const bonus = Math.round(state.timeLeft) * SCORE.timeBonusPerSecond;
      state.levelBonus = bonus;
      state.score += bonus;
      state.levelScores[state.levelIndex] = state.score;
      state.levelTimes[state.levelIndex] = Math.round(LEVEL_SECONDS - state.timeLeft);
      state.screen = state.levelIndex === LEVELS.length - 1 ? SCREEN_WIN : SCREEN_LEVEL;
      return EVENT_FOUND | EVENT_LEVEL;
    }
    return EVENT_FOUND;
  }

  function useHint() {
    if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return -1;
    const list = diffs();
    for (let i = 0; i < list.length; i += 1) {
      if (!state.found.includes(i)) {
        state.hintsLeft -= 1;
        state.score = Math.max(0, state.score + SCORE.hint);
        state.hintFlash = i;
        state.hintFlashUntil = state.now + 2.5;
        state.foundLabel = `Hint: ${list[i].label}`;
        return i;
      }
    }
    return -1;
  }

  function step(dt) {
    state.now += dt;
    if (state.screen !== SCREEN_PLAY) return EVENT_NONE;
    state.timeLeft -= dt;
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      state.screen = SCREEN_OVER;
      return EVENT_OVER;
    }
    return EVENT_NONE;
  }

  function nextLevel() {
    if (state.levelIndex < LEVELS.length - 1) startLevel(state.levelIndex + 1);
    else state.screen = SCREEN_TITLE;
  }

  function retryLevel() {
    startLevel(state.levelIndex);
  }

  function toTitle() {
    state.screen = SCREEN_TITLE;
  }

  return {
    state,
    diffs,
    startLevel,
    startGame,
    clickAt,
    useHint,
    step,
    nextLevel,
    retryLevel,
    toTitle,
    resetLevel,
  };
}
