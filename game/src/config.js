// Lantern Lane — Spot the Difference: every tuning number and colour in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };
export const STEP = 1 / 60;

/** Two picture panels, side by side, in logical coordinates. */
export const PANEL = { width: 600, height: 500, y: 84 };
export const PANEL_LEFT_X = 20;
export const PANEL_RIGHT_X = 660;
export const PANEL_GAP = 40;

/** Seconds on the clock when a level starts; finding everything beats the clock. */
export const LEVEL_SECONDS = 150;
export const HINTS_PER_LEVEL = 3;
export const CLICK_RADIUS = 30;

export const SCORE = {
  found: 100,
  streakBonus: 10,
  wrong: -25,
  hint: -50,
  timeBonusPerSecond: 2,
};

export const PALETTE = {
  backdrop: '#14101d',
  header: '#1e1830',
  panelBorder: '#3d3358',
  panelA: '#f5e6c8',
  panelB: '#f5e6c8',
  text: '#f4eedd',
  muted: '#a89ec4',
  accent: '#ffc94d',
  green: '#58d68d',
  red: '#ef5b5b',
  gold: '#ffd34d',
  button: '#2c2547',
  buttonEdge: '#6b5b9e',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'lantern-lane-spot-best';

export const LEVELS = [
  { id: 'harbour', name: 'Harbour Dusk', sub: 'Lighthouse, boats and gulls at sunset', diffs: 8 },
  { id: 'market', name: 'Night Market', sub: 'Lanterns, stalls and sweet smells', diffs: 8 },
  { id: 'cabin', name: 'Forest Cabin', sub: 'A quiet cabin under tall pines', diffs: 8 },
  { id: 'station', name: 'Moon Station', sub: 'A little base on a cratered moon', diffs: 8 },
  { id: 'bakery', name: 'Bakery Morning', sub: 'Fresh bread, a cat and the morning rush', diffs: 8 },
];
