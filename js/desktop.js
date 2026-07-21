/* Windows 95 desktop shell.
   Chrome comes from 98.css, dragging from interact.js, icons from @react95/icons.
   This file is only the glue: window manager, taskbar, start menu, clock. */

const ICONS = 'https://cdn.jsdelivr.net/npm/@react95/icons@2.5.3/png/';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const desktop = $('#desktop');
const tasks = $('#tasks');

/* ── The reel. Add a clip by adding a line here. ────────────────────── */
const CLIPS = [
  { file: 'walkonby.mp4', title: 'Walk On By' },
  { file: 'peanut.mp4', title: 'Peanut' },
  { file: 'pointy.mp4', title: 'Pointy' },
  { file: 'high-low.mp4', title: 'High / Low' },
  { file: 'minedance.mp4', title: 'Mine Dance' },
  { file: 'traffic.mp4', title: 'Traffic' },
  { file: 'runtime.mp4', title: 'Runtime' },
  { file: 'meowtosis.mp4', title: 'Meowtosis' },
];

/* ── Icons: data-icon -> background, and wrap the label for selection ─ */
function paintIcon(el) {
  el.style.setProperty('--icon', `url("${ICONS}${el.dataset.icon}.png")`);
  if (el.classList.contains('desktop-icon')) el.innerHTML = `<span>${el.innerHTML}</span>`;
}

/* ── Window manager ─────────────────────────────────────────────────
   .hidden = closed (not on the taskbar), .minimized = open but hidden. */
let zTop = 100;
const OPEN = '#desktop > .window:not(.hidden)';

function focusWin(win) {
  $$('#desktop > .window').forEach(w => {
    const active = w === win;
    $('.title-bar', w).classList.toggle('inactive', !active);
    const btn = tasks.querySelector(`[data-for="${w.id}"]`);
    if (btn) btn.classList.toggle('active', active);
  });
  if (win) win.style.zIndex = ++zTop;
}

function openWin(win) {
  win.classList.remove('hidden', 'minimized');
  syncTasks();
  focusWin(win);
}

function focusTopmost() {
  focusWin($$(OPEN).filter(w => !w.classList.contains('minimized'))
    .sort((a, b) => b.style.zIndex - a.style.zIndex)[0]);
}

function closeWin(win) {
  if (win.dataset.transient) win.remove();
  else win.classList.add('hidden');
  syncTasks();
  focusTopmost();
}

/* Rebuild the taskbar from whatever windows are currently open. */
function syncTasks() {
  tasks.innerHTML = '';
  $$(OPEN).forEach(w => {
    const b = document.createElement('button');
    b.dataset.for = w.id;
    b.textContent = $('.title-bar-text', w).textContent;
    b.onclick = () => {
      if (b.classList.contains('active') && !w.classList.contains('minimized')) {
        w.classList.add('minimized');
        b.classList.remove('active');
      } else {
        w.classList.remove('minimized');
        focusWin(w);
      }
    };
    tasks.append(b);
  });
}

/* Title-bar controls + click-to-focus, delegated for dynamic windows. */
desktop.addEventListener('mousedown', e => {
  const win = e.target.closest('.window');
  if (win) focusWin(win);
});

desktop.addEventListener('click', e => {
  const btn = e.target.closest('.title-bar-controls button');
  if (!btn) return;
  const win = btn.closest('.window');
  const label = btn.getAttribute('aria-label');
  if (label === 'Close') closeWin(win);
  if (label === 'Minimize') { win.classList.add('minimized'); syncTasks(); focusTopmost(); }
  if (label === 'Maximize') win.classList.toggle('maximized');
});

/* Pointer deltas arrive in unzoomed viewport pixels, but offsetLeft/Top are
   in the zoomed layout space, so drags need dividing by the --ui scale. */
const uiScale = () =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui')) || 1;

/* Dragging by the title bar, clamped to the desktop. */
interact('#desktop > .window').draggable({
  allowFrom: '.title-bar',
  ignoreFrom: '.title-bar-controls',
  listeners: {
    start(e) {
      /* Pin the window to wherever it actually renders, then drop the
         centring transform/margins so left/top alone drive it. Rects are
         viewport pixels, so divide by the zoom to get layout pixels. */
      const w = e.target;
      const ui = uiScale();
      const dr = desktop.getBoundingClientRect(), wr = w.getBoundingClientRect();
      const x = Math.round((wr.left - dr.left) / ui);   // snap to whole pixels
      const y = Math.round((wr.top - dr.top) / ui);     // like a real Win95 window
      w.style.left = x + 'px';
      w.style.top = y + 'px';
      w.style.margin = '0';
      w.style.transform = 'none';
      /* Track position as floats: offsetLeft rounds to whole pixels, so
         re-reading it every move would accumulate drift at 1.5x. */
      e.interaction.pos = { x, y, ui };
    },
    move(e) {
      const w = e.target;
      const p = e.interaction.pos;
      if (!p || w.classList.contains('maximized')) return;
      p.x = Math.max(0, Math.min(desktop.clientWidth - 60, p.x + e.dx / p.ui));
      p.y = Math.max(0, Math.min(desktop.clientHeight - 24, p.y + e.dy / p.ui));
      w.style.left = Math.round(p.x) + 'px';
      w.style.top = Math.round(p.y) + 'px';
    },
  },
});

/* ── Icon behaviour: single click selects, double click opens ───────── */
document.addEventListener('click', e => {
  const icon = e.target.closest('.desktop-icon');
  $$('.desktop-icon.selected').forEach(i => i.classList.remove('selected'));
  if (icon) icon.classList.add('selected');
});

document.addEventListener('dblclick', e => {
  const icon = e.target.closest('.desktop-icon');
  if (!icon) return;
  if (icon.dataset.opens) openWin($('#' + icon.dataset.opens));
  else if (icon.dataset.clip) openPlayer(JSON.parse(icon.dataset.clip));
});

/* ── Player windows, cloned from the folder window's chrome ─────────── */
function openPlayer(clip) {
  const id = 'player-' + clip.file.replace(/\W/g, '');
  const existing = $('#' + id);
  if (existing) return openWin(existing);

  const win = document.createElement('div');
  win.className = 'window';
  win.id = id;
  win.dataset.transient = '1';
  win.style.cssText = `width:440px;left:${70 + zTop % 8 * 18}px;top:${50 + zTop % 8 * 16}px`;
  win.innerHTML = `
    <div class="title-bar">
      <div class="title-bar-text">${clip.title} — Media Player</div>
      <div class="title-bar-controls">
        <button aria-label="Minimize"></button>
        <button aria-label="Maximize"></button>
        <button aria-label="Close"></button>
      </div>
    </div>
    <div class="menu-bar"><span>File</span><span>Edit</span><span>Device</span><span>Help</span></div>
    <div class="window-body" style="padding:3px">
      <video src="videos/${clip.file}" autoplay loop muted playsinline controls></video>
    </div>
    <div class="status-bar"><p class="status-bar-field">Looping</p><p class="status-bar-field">${clip.file}</p></div>`;
  desktop.append(win);
  openWin(win);
}

/* ── Start menu ─────────────────────────────────────────────────────── */
const startBtn = $('#start-button'), startMenu = $('#start-menu');

startBtn.addEventListener('click', e => {
  e.stopPropagation();
  startMenu.classList.toggle('hidden');
  startBtn.classList.toggle('pressed');
});

document.addEventListener('click', () => {
  startMenu.classList.add('hidden');
  startBtn.classList.remove('pressed');
});

startMenu.addEventListener('click', e => {
  const li = e.target.closest('li[data-opens]');
  if (li) openWin($('#' + li.dataset.opens));
});

/* ── Clock ──────────────────────────────────────────────────────────── */
const clock = $('#clock');
const fmt = new Intl.DateTimeFormat([], { hour: 'numeric', minute: '2-digit' });
const tick = () => { clock.textContent = fmt.format(new Date()); };
tick();
setInterval(tick, 10000);

/* ── Boot ───────────────────────────────────────────────────────────── */
const reel = $('#reel');
CLIPS.forEach(clip => {
  const b = document.createElement('button');
  b.className = 'desktop-icon dark';
  b.dataset.icon = 'Amovie2_32x32_4';
  b.dataset.clip = JSON.stringify(clip);
  b.textContent = clip.title;
  reel.append(b);
});
$('#reel-count').textContent = `${CLIPS.length} object(s)`;

$$('.desktop-icon, #start-menu li[data-icon]').forEach(paintIcon);
syncTasks();
