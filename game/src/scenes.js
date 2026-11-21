// The five pictures. Each level paints the same base scene twice; the only
// things that ever differ between the left (variant 0) and right (variant 1)
// pictures are the level's diffs, each a small painter that draws its element
// in its A form or its B form. Nothing else reads the variant, so a click on
// the same spot in either panel always means the same difference.
import { createRandom, range } from './random.js';

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function sky(ctx, top, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, 500);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 600, 500);
}

function bird(ctx, x, y, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x - 9, y, 9, Math.PI * 1.15, Math.PI * 1.85);
  ctx.arc(x + 9, y, 9, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
}

function star(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  for (let i = 0; i < 5; i += 1) {
    const a = -Math.PI / 2 + (i * Math.PI * 4) / 5;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
}

function scatterStars(ctx, rng, n, maxY) {
  for (let i = 0; i < n; i += 1) {
    circle(ctx, range(rng, 10, 590), range(rng, 8, maxY), range(rng, 1.5, 3.5), '#fff8d6');
  }
}

function pine(ctx, x, y, s, snow) {
  ctx.fillStyle = '#2f6b3a';
  for (let i = 0; i < 3; i += 1) {
    const w = s * (1 - i * 0.28);
    ctx.beginPath();
    ctx.moveTo(x, y - i * s * 0.55 - s * 0.5);
    ctx.lineTo(x - w / 2, y - i * s * 0.55);
    ctx.lineTo(x + w / 2, y - i * s * 0.55);
    ctx.closePath();
    ctx.fill();
  }
  rect(ctx, x - 4, y, 8, 14, '#6b4a2f');
  if (snow) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x, y - s * 0.5);
    ctx.lineTo(x - s * 0.22, y - s * 0.28);
    ctx.lineTo(x + s * 0.22, y - s * 0.28);
    ctx.closePath();
    ctx.fill();
  }
}

// ---------------------------------------------------------------- harbour
function harbourBase(ctx, rng) {
  sky(ctx, '#ff9a5c', '#7b4b94');
  circle(ctx, 150, 90, 42, '#ffd34d');
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.beginPath();
  ctx.ellipse(420, 70, 70, 18, 0, 0, Math.PI * 2);
  ctx.ellipse(480, 78, 50, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  bird(ctx, 300, 130, '#3a2b4d');
  bird(ctx, 340, 150, '#3a2b4d');
  bird(ctx, 260, 160, '#3a2b4d');
  rect(ctx, 0, 300, 600, 200, '#2e6f8e');
  ctx.fillStyle = '#3f8fb0';
  for (let i = 0; i < 5; i += 1) {
    const y = 320 + i * 34;
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 600; x += 40) ctx.quadraticCurveTo(x + 20, y + 8, x + 40, y);
    ctx.lineTo(600, y + 10);
    ctx.lineTo(0, y + 10);
    ctx.fill();
  }
  // Dock.
  rect(ctx, 380, 380, 220, 16, '#7a5230');
  rect(ctx, 400, 396, 12, 60, '#5d3d22');
  rect(ctx, 560, 396, 12, 60, '#5d3d22');
  // Lighthouse.
  rect(ctx, 440, 150, 60, 230, '#f2ede0');
  rect(ctx, 440, 200, 60, 18, '#d94f3d');
  rect(ctx, 440, 260, 60, 18, '#d94f3d');
  rect(ctx, 440, 320, 60, 18, '#d94f3d');
  rect(ctx, 432, 128, 76, 26, '#3a3348');
  // Boat.
  ctx.fillStyle = '#4a2f23';
  ctx.beginPath();
  ctx.moveTo(60, 330);
  ctx.lineTo(180, 330);
  ctx.lineTo(160, 356);
  ctx.lineTo(80, 356);
  ctx.closePath();
  ctx.fill();
  rect(ctx, 118, 250, 5, 80, '#4a2f23');
  scatterStars(ctx, rng, 6, 60);
}

const harbourDiffs = [
  { x: 150, y: 90, r: 34, label: 'sun rays', paint(ctx, v) {
    if (v === 0) { ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 5; for (let i = 0; i < 8; i += 1) { const a = (i * Math.PI) / 4; ctx.beginPath(); ctx.moveTo(150 + Math.cos(a) * 50, 90 + Math.sin(a) * 50); ctx.lineTo(150 + Math.cos(a) * 64, 90 + Math.sin(a) * 64); ctx.stroke(); } }
    else { ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.ellipse(150, 78, 46, 16, 0, 0, Math.PI * 2); ctx.fill(); }
  } },
  { x: 470, y: 141, r: 30, label: 'lighthouse lamp', paint(ctx, v) {
    if (v === 0) { circle(ctx, 470, 141, 12, '#ffe98a'); ctx.fillStyle = 'rgba(255,233,138,0.35)'; ctx.beginPath(); ctx.moveTo(470, 141); ctx.lineTo(600, 110); ctx.lineTo(600, 172); ctx.closePath(); ctx.fill(); }
    else { circle(ctx, 470, 141, 12, '#5a5468'); }
  } },
  { x: 120, y: 285, r: 36, label: 'boat sail', paint(ctx, v) {
    ctx.fillStyle = v === 0 ? '#d94f3d' : '#3d7bd9';
    ctx.beginPath(); ctx.moveTo(123, 255); ctx.lineTo(123, 325); ctx.lineTo(178, 325); ctx.closePath(); ctx.fill();
  } },
  { x: 340, y: 150, r: 28, label: 'third gull', paint(ctx, v) {
    if (v === 0) bird(ctx, 340, 150, '#3a2b4d');
  } },
  { x: 520, y: 380, r: 26, label: 'buoy', paint(ctx, v) {
    if (v === 0) { circle(ctx, 520, 380, 16, '#ff7a3d'); rect(ctx, 514, 356, 12, 10, '#ff7a3d'); circle(ctx, 520, 352, 4, '#ffe98a'); }
  } },
  { x: 470, y: 240, r: 22, label: 'lighthouse window', paint(ctx, v) {
    rect(ctx, 458, 228, 24, 26, v === 0 ? '#ffe98a' : '#3a3348');
  } },
  { x: 200, y: 420, r: 28, label: 'jumping fish', paint(ctx, v) {
    if (v === 0) { ctx.fillStyle = '#c9e8f2'; ctx.beginPath(); ctx.ellipse(200, 420, 18, 9, -0.5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(214, 436, 5, 0, Math.PI * 2); ctx.arc(190, 438, 4, 0, Math.PI * 2); ctx.fill(); }
  } },
  { x: 550, y: 80, r: 20, label: 'evening star', paint(ctx, v) {
    if (v === 0) star(ctx, 550, 80, 12, '#fff8d6');
  } },
];

// ---------------------------------------------------------------- market
function marketBase(ctx, rng) {
  sky(ctx, '#2b1e4d', '#8e4a6b');
  scatterStars(ctx, rng, 10, 90);
  circle(ctx, 520, 70, 30, '#f2e3b3');
  // String lights.
  ctx.strokeStyle = '#1c1430';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 90); ctx.quadraticCurveTo(300, 150, 600, 80); ctx.stroke();
  for (let i = 0; i < 9; i += 1) {
    const x = 40 + i * 65;
    const y = 96 + Math.sin((i / 8) * Math.PI) * 34;
    circle(ctx, x, y + 8, 7, i % 2 ? '#ffd34d' : '#ff8a7a');
  }
  // Stall left: fruit.
  rect(ctx, 40, 260, 220, 16, '#7a5230');
  rect(ctx, 50, 276, 14, 120, '#5d3d22');
  rect(ctx, 236, 276, 14, 120, '#5d3d22');
  rect(ctx, 60, 220, 180, 40, '#ffffff');
  for (let i = 0; i < 3; i += 1) circle(ctx, 90 + i * 50, 210, 16, '#e84a4a');
  // Stall right: jars.
  rect(ctx, 340, 260, 220, 16, '#7a5230');
  rect(ctx, 350, 276, 14, 120, '#5d3d22');
  rect(ctx, 536, 276, 14, 120, '#5d3d22');
  rect(ctx, 380, 210, 40, 50, '#c9a86a');
  rect(ctx, 430, 210, 40, 50, '#c9a86a');
  rect(ctx, 480, 210, 40, 50, '#c9a86a');
  // Ground + crates.
  rect(ctx, 0, 396, 600, 104, '#4a3550');
  rect(ctx, 60, 360, 60, 36, '#8a6a3d');
  rect(ctx, 480, 370, 56, 26, '#8a6a3d');
}

const marketDiffs = [
  { x: 120, y: 110, r: 26, label: 'paper lantern', paint(ctx, v) {
    ctx.fillStyle = v === 0 ? '#e84a4a' : '#58a86b';
    ctx.beginPath(); ctx.ellipse(120, 110, 22, 28, 0, 0, Math.PI * 2); ctx.fill();
    rect(ctx, 114, 80, 12, 6, '#ffd34d'); rect(ctx, 114, 136, 12, 6, '#ffd34d');
  } },
  { x: 300, y: 200, r: 28, label: 'awning stripe', paint(ctx, v) {
    // Awnings are painted by the diff itself so the stripe count can differ.
    for (let i = 0; i < 5; i += 1) {
      const x = 40 + i * 44;
      if (v === 1 && i === 2) continue;
      rect(ctx, x, 150, 44, 34, i % 2 ? '#e84a4a' : '#f2ede0');
    }
    rect(ctx, 40, 184, 220, 10, '#c93a3a');
  } },
  { x: 480, y: 150, r: 26, label: 'round sign', paint(ctx, v) {
    if (v === 0) { circle(ctx, 480, 150, 24, '#ffd34d'); ctx.fillStyle = '#3a2b4d'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('TEA', 480, 157); }
    else { rect(ctx, 456, 126, 48, 48, '#ffd34d'); ctx.fillStyle = '#3a2b4d'; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('TEA', 480, 157); }
  } },
  { x: 80, y: 380, r: 26, label: 'market cat', paint(ctx, v) {
    if (v === 0) { ctx.fillStyle = '#2b2b33'; ctx.beginPath(); ctx.ellipse(80, 380, 24, 15, 0, 0, Math.PI * 2); ctx.fill(); circle(ctx, 96, 362, 11, '#2b2b33'); ctx.beginPath(); ctx.moveTo(88, 354); ctx.lineTo(90, 342); ctx.lineTo(96, 352); ctx.moveTo(102, 352); ctx.lineTo(106, 342); ctx.lineTo(108, 354); ctx.fill(); }
  } },
  { x: 350, y: 90, r: 22, label: 'string bulb', paint(ctx, v) {
    circle(ctx, 350, 104, 8, v === 0 ? '#ffe98a' : '#4a4460');
  } },
  { x: 200, y: 330, r: 28, label: 'cookie jar', paint(ctx, v) {
    rect(ctx, 176, 306, 48, 48, 'rgba(220,200,160,0.9)');
    if (v === 0) { circle(ctx, 190, 330, 9, '#8a5a2b'); circle(ctx, 210, 336, 9, '#8a5a2b'); circle(ctx, 200, 318, 9, '#a06a35'); }
  } },
  { x: 430, y: 420, r: 26, label: 'coin on the ground', paint(ctx, v) {
    if (v === 0) { circle(ctx, 430, 420, 11, '#ffd34d'); ctx.strokeStyle = '#b8932a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(430, 420, 7, 0, Math.PI * 2); ctx.stroke(); }
  } },
  { x: 530, y: 300, r: 24, label: 'sweet in the jar', paint(ctx, v) {
    if (v === 0) { rect(ctx, 512, 276, 36, 46, '#c9a86a'); circle(ctx, 530, 300, 8, '#e8b4c8'); }
    else { rect(ctx, 512, 276, 36, 46, '#c9a86a'); }
  } },
];

// ---------------------------------------------------------------- cabin
function cabinBase(ctx, rng) {
  sky(ctx, '#1d2f55', '#7fa8c9');
  circle(ctx, 480, 90, 34, '#f2ead0');
  scatterStars(ctx, rng, 12, 110);
  ctx.fillStyle = '#5a7ba6';
  ctx.beginPath(); ctx.moveTo(0, 300); ctx.lineTo(140, 170); ctx.lineTo(280, 300); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#4a6a92';
  ctx.beginPath(); ctx.moveTo(220, 300); ctx.lineTo(400, 150); ctx.lineTo(600, 300); ctx.closePath(); ctx.fill();
  rect(ctx, 0, 300, 600, 200, '#3d5c3a');
  pine(ctx, 100, 320, 70, true);
  pine(ctx, 520, 330, 80, false);
  pine(ctx, 60, 380, 55, false);
  // Cabin.
  rect(ctx, 230, 260, 160, 110, '#8a5a2b');
  ctx.fillStyle = '#6b3d1e';
  ctx.beginPath(); ctx.moveTo(210, 262); ctx.lineTo(310, 190); ctx.lineTo(410, 262); ctx.closePath(); ctx.fill();
  rect(ctx, 295, 300, 30, 70, '#4a2f1a');
  // Path.
  ctx.fillStyle = '#c9b18a';
  ctx.beginPath(); ctx.ellipse(310, 430, 90, 26, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(310, 470, 120, 22, 0, 0, Math.PI * 2); ctx.fill();
  // Mushrooms.
  circle(ctx, 150, 392, 10, '#e84a4a');
  rect(ctx, 147, 392, 6, 12, '#f2ede0');
  circle(ctx, 176, 398, 7, '#e84a4a');
}

const cabinDiffs = [
  { x: 480, y: 90, r: 30, label: 'moon phase', paint(ctx, v) {
    if (v === 0) circle(ctx, 480, 90, 34, '#f2ead0');
    else { circle(ctx, 480, 90, 34, '#f2ead0'); circle(ctx, 496, 84, 30, '#263c6c'); }
  } },
  { x: 340, y: 210, r: 28, label: 'chimney smoke', paint(ctx, v) {
    rect(ctx, 348, 196, 18, 40, '#6b4a2f');
    if (v === 0) { ctx.fillStyle = 'rgba(240,240,240,0.85)'; circle(ctx, 357, 180, 12, 'rgba(240,240,240,0.85)'); circle(ctx, 370, 162, 15, 'rgba(240,240,240,0.85)'); circle(ctx, 388, 142, 18, 'rgba(240,240,240,0.85)'); }
  } },
  { x: 150, y: 388, r: 24, label: 'mushroom colour', paint(ctx, v) {
    circle(ctx, 150, 388, 10, v === 0 ? '#e84a4a' : '#8a6a3d');
    rect(ctx, 147, 388, 6, 12, '#f2ede0');
  } },
  { x: 450, y: 400, r: 28, label: 'deer', paint(ctx, v) {
    if (v === 0) { ctx.fillStyle = '#a8763e'; ctx.beginPath(); ctx.ellipse(450, 400, 26, 15, 0, 0, Math.PI * 2); ctx.fill(); circle(ctx, 472, 382, 10, '#a8763e'); ctx.strokeStyle = '#6b4a2f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(466, 374); ctx.lineTo(462, 360); ctx.moveTo(474, 374); ctx.lineTo(478, 360); ctx.stroke(); rect(ctx, 436, 410, 5, 18, '#a8763e'); rect(ctx, 458, 410, 5, 18, '#a8763e'); }
  } },
  { x: 100, y: 285, r: 26, label: 'snow on the pine', paint(ctx, v) {
    pine(ctx, 100, 320, 70, v === 0);
  } },
  { x: 260, y: 285, r: 22, label: 'cabin window', paint(ctx, v) {
    rect(ctx, 246, 272, 26, 26, v === 0 ? '#ffe98a' : '#2b2118');
  } },
  { x: 520, y: 300, r: 24, label: 'birdhouse', paint(ctx, v) {
    if (v === 0) { rect(ctx, 508, 288, 26, 24, '#d9a441'); ctx.beginPath(); ctx.moveTo(504, 288); ctx.lineTo(521, 274); ctx.lineTo(538, 288); ctx.closePath(); ctx.fillStyle = '#a83232'; ctx.fill(); circle(ctx, 521, 300, 5, '#2b2118'); }
  } },
  { x: 220, y: 430, r: 24, label: 'path flower', paint(ctx, v) {
    circle(ctx, 220, 430, 9, v === 0 ? '#ffd34d' : '#e87ab0');
    circle(ctx, 220, 430, 4, '#fff');
  } },
];

// ---------------------------------------------------------------- station
function stationBase(ctx, rng) {
  sky(ctx, '#0a0a18', '#1c1440');
  scatterStars(ctx, rng, 26, 220);
  circle(ctx, 120, 100, 44, '#e8a04c');
  ctx.strokeStyle = '#c97f2e';
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.ellipse(120, 100, 74, 18, -0.35, 0, Math.PI * 2); ctx.stroke();
  rect(ctx, 0, 360, 600, 140, '#8a8a9e');
  ctx.fillStyle = '#6f6f84';
  for (let i = 0; i < 6; i += 1) { const x = 40 + i * 95; ctx.beginPath(); ctx.ellipse(x, 420 + (i % 2) * 30, 26, 10, 0, 0, Math.PI * 2); ctx.fill(); }
  // Dome base.
  ctx.fillStyle = '#c9ccd6';
  ctx.beginPath(); ctx.arc(350, 360, 90, Math.PI, 0); ctx.closePath(); ctx.fill();
  rect(ctx, 260, 360, 180, 14, '#9a9dae');
  // Flag.
  rect(ctx, 80, 260, 5, 100, '#d8d8e0');
  // Astronaut.
  circle(ctx, 300, 300, 16, '#f2f2f2');
  rect(ctx, 286, 316, 28, 34, '#f2f2f2');
}

const stationDiffs = [
  { x: 120, y: 100, r: 34, label: 'planet rings', paint(ctx, v) {
    if (v === 1) { ctx.fillStyle = '#131128'; ctx.beginPath(); ctx.ellipse(120, 100, 84, 30, -0.35, 0, Math.PI * 2); ctx.fill(); }
    circle(ctx, 120, 100, 44, '#e8a04c');
    if (v === 0) { ctx.strokeStyle = '#c97f2e'; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(120, 100, 74, 18, -0.35, 0, Math.PI * 2); ctx.stroke(); }
  } },
  { x: 300, y: 300, r: 24, label: 'helmet visor', paint(ctx, v) {
    circle(ctx, 300, 300, 16, '#f2f2f2');
    circle(ctx, 303, 300, 10, v === 0 ? '#ffd34d' : '#3d6bd9');
  } },
  { x: 480, y: 350, r: 28, label: 'rover wheel', paint(ctx, v) {
    ctx.fillStyle = '#b8932a'; rect(ctx, 440, 330, 80, 22, '#b8932a');
    circle(ctx, 452, 356, 10, '#2b2b33'); circle(ctx, 480, 356, 10, '#2b2b33');
    if (v === 0) circle(ctx, 508, 356, 10, '#2b2b33');
  } },
  { x: 82, y: 250, r: 24, label: 'flag colour', paint(ctx, v) {
    ctx.fillStyle = v === 0 ? '#e84a4a' : '#58a86b';
    ctx.beginPath(); ctx.moveTo(85, 246); ctx.lineTo(125, 256); ctx.lineTo(85, 268); ctx.closePath(); ctx.fill();
  } },
  { x: 520, y: 120, r: 26, label: 'satellite', paint(ctx, v) {
    if (v === 0) { rect(ctx, 500, 110, 40, 16, '#c9ccd6'); rect(ctx, 492, 114, 10, 8, '#3d6bd9'); rect(ctx, 538, 114, 10, 8, '#3d6bd9'); }
  } },
  { x: 200, y: 400, r: 24, label: 'crater', paint(ctx, v) {
    if (v === 0) { ctx.fillStyle = '#6f6f84'; ctx.beginPath(); ctx.ellipse(200, 400, 24, 9, 0, 0, Math.PI * 2); ctx.fill(); }
  } },
  { x: 400, y: 90, r: 26, label: 'third star', paint(ctx, v) {
    if (v === 0) star(ctx, 400, 90, 9, '#fff8d6');
    star(ctx, 380, 70, 7, '#fff8d6'); star(ctx, 420, 66, 7, '#fff8d6');
  } },
  { x: 350, y: 320, r: 22, label: 'dome window', paint(ctx, v) {
    circle(ctx, 350, 320, 16, v === 0 ? '#ffe98a' : '#4a4a5e');
  } },
];

// ---------------------------------------------------------------- bakery
function bakeryBase(ctx, rng) {
  sky(ctx, '#ffe3a3', '#ffb36b');
  circle(ctx, 90, 120, 36, '#ffd34d');
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.beginPath(); ctx.ellipse(420, 80, 70, 16, 0, 0, Math.PI * 2); ctx.ellipse(470, 88, 46, 12, 0, 0, Math.PI * 2); ctx.fill();
  // Shop front.
  rect(ctx, 80, 150, 440, 260, '#f7ead0');
  rect(ctx, 80, 150, 440, 14, '#c98a4b');
  rect(ctx, 100, 200, 180, 130, '#bfe3f2');
  rect(ctx, 320, 200, 180, 130, '#bfe3f2');
  rect(ctx, 270, 260, 60, 150, '#8a5a2b');
  // Shelves with cakes.
  rect(ctx, 110, 260, 160, 8, '#8a5a2b');
  rect(ctx, 110, 300, 160, 8, '#8a5a2b');
  rect(ctx, 330, 260, 160, 8, '#8a5a2b');
  rect(ctx, 330, 300, 160, 8, '#8a5a2b');
  // Ground.
  rect(ctx, 0, 410, 600, 90, '#c9a86a');
  // Flower pot.
  rect(ctx, 100, 430, 40, 30, '#c96a4b');
}

const bakeryDiffs = [
  { x: 300, y: 80, r: 28, label: 'clock hands', paint(ctx, v) {
    circle(ctx, 300, 80, 26, '#ffffff');
    ctx.strokeStyle = '#2b2118'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(300, 80); ctx.lineTo(v === 0 ? 300 : 318, v === 0 ? 62 : 80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(300, 80); ctx.lineTo(316, 80); ctx.stroke();
    circle(ctx, 300, 80, 3, '#2b2118');
  } },
  { x: 150, y: 245, r: 24, label: 'cherry on the cake', paint(ctx, v) {
    ctx.fillStyle = '#e8b4c8'; ctx.beginPath(); ctx.ellipse(150, 252, 26, 12, 0, 0, Math.PI * 2); ctx.fill();
    if (v === 0) circle(ctx, 150, 238, 6, '#e84a4a');
  } },
  { x: 450, y: 290, r: 26, label: 'cat in the window', paint(ctx, v) {
    if (v === 0) { ctx.fillStyle = '#e8a04c'; ctx.beginPath(); ctx.ellipse(450, 300, 24, 14, 0, 0, Math.PI * 2); ctx.fill(); circle(ctx, 466, 284, 11, '#e8a04c'); ctx.beginPath(); ctx.moveTo(458, 276); ctx.lineTo(460, 266); ctx.lineTo(465, 275); ctx.moveTo(470, 275); ctx.lineTo(474, 266); ctx.lineTo(476, 276); ctx.fill(); }
  } },
  { x: 200, y: 380, r: 28, label: 'fourth loaf', paint(ctx, v) {
    ctx.fillStyle = '#d9a441';
    for (let i = 0; i < (v === 0 ? 4 : 3); i += 1) { ctx.beginPath(); ctx.ellipse(160 + i * 28, 380, 14, 9, 0, 0, Math.PI * 2); ctx.fill(); }
  } },
  { x: 520, y: 380, r: 26, label: 'jam jar', paint(ctx, v) {
    rect(ctx, 500, 350, 40, 50, 'rgba(220,200,160,0.95)');
    rect(ctx, 500, v === 0 ? 356 : 372, 40, v === 0 ? 44 : 28, '#c94f6b');
  } },
  { x: 90, y: 120, r: 30, label: 'sun behind a cloud', paint(ctx, v) {
    circle(ctx, 90, 120, 36, '#ffd34d');
    if (v === 1) { ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.ellipse(90, 116, 44, 16, 0, 0, Math.PI * 2); ctx.fill(); }
  } },
  { x: 300, y: 300, r: 24, label: 'door window', paint(ctx, v) {
    if (v === 0) circle(ctx, 300, 300, 14, '#bfe3f2');
    else rect(ctx, 286, 286, 28, 28, '#bfe3f2');
  } },
  { x: 120, y: 425, r: 24, label: 'flower colour', paint(ctx, v) {
    circle(ctx, 112, 422, 8, v === 0 ? '#e84a4a' : '#3d6bd9');
    circle(ctx, 128, 422, 8, v === 0 ? '#e84a4a' : '#3d6bd9');
    circle(ctx, 120, 414, 8, v === 0 ? '#e84a4a' : '#3d6bd9');
  } },
];

export const LEVELS_PAINT = [
  { base: harbourBase, diffs: harbourDiffs },
  { base: marketBase, diffs: marketDiffs },
  { base: cabinBase, diffs: cabinDiffs },
  { base: stationBase, diffs: stationDiffs },
  { base: bakeryBase, diffs: bakeryDiffs },
];

/** Paint one picture of a level. `variant` 0 is the left picture, 1 the right. */
export function paintLevel(ctx, levelIndex, variant, seed) {
  const level = LEVELS_PAINT[levelIndex];
  const rng = createRandom(seed * 7919 + levelIndex * 104729 + 13);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 600, 500);
  ctx.clip();
  level.base(ctx, rng);
  for (const diff of level.diffs) diff.paint(ctx, variant);
  ctx.restore();
}

export function levelDiffs(levelIndex) {
  return LEVELS_PAINT[levelIndex].diffs.map((d) => ({ x: d.x, y: d.y, r: d.r, label: d.label }));
}
