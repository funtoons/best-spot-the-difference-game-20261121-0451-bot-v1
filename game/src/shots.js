// The screenshot scenes behind ?shot=play|start|level|end. Each one sets the
// real world to a real game state — a level in progress, a title preview, a
// level just cleared, a game just won — with fixed seeds, fixed found sets
// and a fixed clock, so the same seed always gives the same frame. The cover
// (play) is a level mid-game: markers on the differences found, several
// still unfound, and the counter showing how many remain.
import { SCREEN_LEVEL, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './world.js';

function foundSet(world, indices, score, timeLeft) {
  world.state.found = [...indices];
  world.state.score = score;
  world.state.timeLeft = timeLeft;
  world.state.now = 12;
}

/** Set `world` to the named scene and return the screen to draw over it. */
export function stageShot(name, world) {
  const state = world.state;
  if (name === 'level') {
    world.resetLevel(0);
    foundSet(world, [0, 1, 2, 3, 4, 5, 6, 7], 1180, 41);
    state.levelBonus = 82;
    state.bestStreak = 5;
    state.screen = SCREEN_LEVEL;
    return { screen: SCREEN_LEVEL, best: 0 };
  }
  if (name === 'end') {
    world.resetLevel(4);
    foundSet(world, [0, 1, 2, 3, 4, 5, 6, 7], 5420, 63);
    state.levelScores = [1180, 1040, 980, 1120, 1100];
    state.levelTimes = [52, 71, 88, 64, 57];
    state.bestStreak = 9;
    state.screen = SCREEN_WIN;
    return { screen: SCREEN_WIN, best: 5420 };
  }
  if (name === 'start') {
    world.resetLevel(0);
    foundSet(world, [1, 5], 200, 150);
    state.screen = SCREEN_TITLE;
    return { screen: SCREEN_TITLE, best: 200 };
  }
  // play: the cover. Level 2 (Night Market), 4 of 8 found, 4 still hidden.
  world.resetLevel(1);
  foundSet(world, [0, 2, 4, 6], 1240, 83);
  state.mistakes = 1;
  state.streak = 3;
  state.bestStreak = 4;
  state.hintsLeft = 2;
  state.screen = SCREEN_PLAY;
  return { screen: SCREEN_PLAY, best: 1240 };
}
