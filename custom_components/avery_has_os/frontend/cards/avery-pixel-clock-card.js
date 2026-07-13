import {
  AV_EDITOR_CSS, section, row, hint, textField, numberField, checkboxField,
  selectField, colorField, iconPicker, themeRow, colorsSection, bindEditor,
} from './avery-card-editor.js?v=8';

// Avery Pixel Clock Card — from mockups/pixel-clock_v6.html.
//
// Phase 1: icon column + live LED-matrix clock panel (HH:MM:SS, blinking
// colon, configurable digit/separator/off-pixel colors, 24h toggle).
// Config is via the standard edit-card dialog (this repo's convention),
// not the mockup's own on-card pager/settings page — kept for consistency
// with every other avery-*-card.
//
// Deferred to a later pass: the mockup's "quote mode" (fine-pixel-grid
// inspirational quotes filling the whole card) — not part of this phase's
// ask, and it's a separate rendering engine (fine grid + text wrapping).
//
// Phase 2 (this pass): Avery voice timers. The card watches
// sensor.avery_timers (avery_smart_assist's self-contained TimerEngine) and
// shows the upcoming 2 timers as small text rows in the lower band of the
// LED panel — the clock glyphs shift to the top row to make room. Each row
// has its own ✕ cancel button. Countdown is computed client-side from
// started_at/total_seconds (the backend only pushes on start/cancel/extend/
// finish). A fired timer stays in the list as status "ringing": the row
// pulses and the card plays a WebAudio beep + speaks "<name> timer
// finished" until any browser dismisses it (or the backend's 5-min safety
// timeout fires). Audio needs one prior user gesture per page load
// (iOS/kiosk autoplay policy) — first pointerdown on the card unlocks it;
// until then a ringing timer flashes silently.

const DEFAULT_CONFIG = {
  type: 'custom:avery-pixel-clock-card',
  title: '',
  icon: 'mdi:clock-digital',
  theme: 'dashboard',
  height: '120px',
  corner_radius: 14,
  hide_glow: false,
  no_border: false,
  accent_color: '#f97316',
  glow_color_1: '#f97316',
  glow_color_2: '#06b6d4',
  glow_color_3: '#a855f7',
  background_color: '',
  background_image: '',
  tap_action: 'more-info',
  navigation_path: '',
  digit_rainbow: true,
  digit_color: '#5dc8ff',
  sep_color: '#ffffff',
  off_color: '#1a1d28',
  format_24: true,
  clock_size: 'medium',
};

const RAINBOW = ['#ff5d8f', '#ffb347', '#ffe156', '#5dffb0', '#5dc8ff', '#a26bff'];

// Digit/font size within a fixed-size panel — the panel itself already
// fills all available space (see the no-border work), so "bigger digits"
// means less margin around the grid, not a bigger panel. Large = tightest
// fit, small = more breathing room around the numbers.
const CLOCK_SIZE_PADDING = { small: '10px', medium: '3px', large: '0px' };

// 3-wide x 5-tall pixel font — digits + A/P/M for the optional AM/PM suffix.
const FONT = {
  '0': ['111', '101', '101', '101', '111'],
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '7': ['111', '001', '010', '100', '100'],
  '8': ['111', '101', '111', '101', '111'],
  '9': ['111', '101', '111', '001', '111'],
  A: ['010', '101', '111', '101', '101'],
  P: ['110', '101', '110', '100', '100'],
  M: ['101', '111', '111', '101', '101'],
};

const COLS = 35, ROWS = 11;
// With timers active the panel splits: the timer band takes its natural
// height at the bottom and the grid is rebuilt with fewer rows, so the
// clock digits shrink (fewer, shorter rows) instead of the band
// overlapping full-size digits.
const ROWS_WITH_TIMERS = 8;
const GLYPH_H = 5;
const TOP_CENTERED = Math.floor((ROWS - GLYPH_H) / 2);
const TOP_WITH_TIMERS = Math.floor((ROWS_WITH_TIMERS - GLYPH_H) / 2);
const DIGIT_COLS = [0, 4, 10, 14, 20, 24];
const COLON_COLS = [8, 18];
const TIME_WIDTH = 27;
// Seconds-dropped layout (HH:MM) for narrow cards — 4 digits + 1 colon.
// We shrink the content, never the pixels: a square LED locked to the card
// height stays the same size, and when it no longer leaves room for the
// seconds pair we drop to HH:MM rather than squashing the font.
const HHMM_DIGIT_COLS = [0, 4, 10, 14];
const HHMM_COLON_COLS = [8];
const HHMM_WIDTH = 17;
// AM/PM suffix width when format_24 is off: 1 leading gap + "AM"/"PM"
// (two 3-wide glyphs with a 1-col gap = 7).
const AMPM_WIDTH = 8;
const GAP_PX = 1.5; // must match .grid { gap } below

const TIMERS_ENTITY = 'sensor.avery_timers';
const MAX_TIMER_ROWS = 2;

function themeClass(theme) {
  if (theme === 'dark') return 'theme-dark';
  if (theme === 'light') return 'theme-light';
  return 'theme-dashboard';
}

const CARD_CSS = `
  :host {
    --am-text: var(--primary-text-color, #fff);
    --am-bg: color-mix(in srgb, var(--am-text) 10%, transparent);
    --am-border: color-mix(in srgb, var(--am-text) 12%, rgba(255,255,255,0.16));
    --am-radius: 14px;
    --am-accent: #f97316;
    --am-glow-1: #f97316;
    --am-glow-2: #06b6d4;
    --am-glow-3: #a855f7;
    display: block;
  }
  ha-card.card {
    position: relative;
    height: var(--am-card-height, 120px);
    min-height: var(--am-card-height, 120px);
    border-radius: var(--am-radius) !important;
    overflow: hidden !important;
    clip-path: inset(0 round var(--am-radius));
    transform: translateZ(0);
    color: var(--am-text);
    background: var(--reflection-top, none), var(--av-card-bg, var(--am-bg-override, var(--am-bg))) !important;
    background-size: cover;
    background-position: center;
    border: 1px solid var(--av-card-border, transparent) !important;
    box-shadow: var(--shadow-glass, none) !important;
    backdrop-filter: var(--av-card-blur, none);
    -webkit-backdrop-filter: var(--av-card-blur, none);
    box-sizing: border-box;
    padding: 6px 6px 6px 18px;
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    column-gap: 14px;
    align-items: center;
    font-family: var(--ha-font-family-body, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
    cursor: pointer;
  }

  /* Column 1 — icon */
  .icon-col {
    display: flex; align-items: center; justify-content: center;
    height: 100%;
  }
  .icon-wrap {
    position: relative;
    width: 40px; height: 40px;
    border-radius: 14px;
    display: grid; place-items: center;
    background: var(--reflection-top, none),
      color-mix(in srgb, var(--am-accent) 20%, rgba(255,255,255,.12));
    border: 1px solid transparent;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,.18),
      0 0 24px -9px var(--am-accent),
      0 12px 26px rgba(0,0,0,.14);
  }
  .icon-wrap::before {
    content: "";
    position: absolute;
    inset: -7px;
    z-index: -1;
    border-radius: 20px;
    background: conic-gradient(
      from 150deg,
      var(--am-glow-1), var(--am-glow-2), var(--am-glow-3), var(--am-glow-1)
    );
    filter: blur(14px);
    opacity: 0.68;
  }
  .card.hide-glow .icon-wrap::before { display: none; }
  .icon-wrap ha-icon { --mdc-icon-size: 22px; color: var(--am-text); }

  /* Column 2 — LED matrix panel */
  .panel {
    position: relative;
    align-self: stretch;
    border-radius: 10px;
    background: linear-gradient(135deg, #14151d 0%, #1c1f2b 100%);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  /* No border: panel fills the card on top/right/bottom — flat seam on the
     left (against the icon column), rounded on the right to follow the
     card's own outer corner radius since that edge now IS the card edge. */
  .card.no-border {
    padding: 0 0 0 18px;
  }
  .card.no-border .panel {
    border-radius: 0 var(--am-radius) var(--am-radius) 0;
    /* Bleed 1px past the card's own top/right/bottom edges — the card's
       overflow:hidden + clip-path trims it cleanly, which avoids a hairline
       sub-pixel gap revealing the card background between the panel's
       rounded corner and the card's own rounded clip. */
    margin: -1px -1px -1px 0;
  }
  .panel::before {
    content: "";
    position: absolute; inset: 0;
    background: repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 3px);
    pointer-events: none;
  }
  .grid {
    flex: 1 1 auto;
    min-height: 0;
    display: grid;
    /* Columns are square, fixed-px tracks set by _relayout() so each LED
       keeps the row height's aspect ratio (1:1) no matter how wide the card
       gets; this repeat() is only the pre-measure fallback. Rows stay 1fr so
       the glyph height always fills the panel. justify-content centers the
       pixel field, leaving the extra width as even dark padding. */
    grid-template-columns: repeat(${COLS}, 1fr);
    grid-template-rows: repeat(${ROWS}, 1fr);
    justify-content: center;
    gap: ${GAP_PX}px;
    padding: var(--pc-grid-pad, 3px);
    box-sizing: border-box;
  }
  .grid .px {
    border-radius: 1px;
    background: var(--pc-off, #1a1d28);
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.4);
  }
  .grid .px.on {
    background: var(--c, #fff);
    box-shadow: 0 0 6px currentColor, 0 0 2px currentColor;
  }
  .grid .px.blink { animation: pc-blink 1s steps(2, start) infinite; }
  @keyframes pc-blink { 50% { opacity: 0.2; box-shadow: none; } }

  /* Timer band — sits below the (shrunken) grid, never overlapping it */
  .timers {
    flex: 0 0 auto;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 1px 6px 5px 8px;
  }
  .timers[hidden] { display: none; }
  .t-row {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    color: rgba(255,255,255,.85);
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 0.06em;
    line-height: 1.1;
  }
  .t-name {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-transform: uppercase;
  }
  .t-time {
    flex: 0 0 auto;
    font-variant-numeric: tabular-nums;
    color: #5dffb0;
  }
  .t-more {
    flex: 0 0 auto;
    color: rgba(255,255,255,.45);
    font-size: 10px;
    font-weight: 700;
  }
  .t-x {
    flex: 0 0 auto;
    width: 24px; height: 24px;
    margin: -3px -4px -3px 0; /* full 24px hit target without inflating the row */
    display: grid; place-items: center;
    border: none;
    border-radius: 8px;
    background: rgba(255,255,255,.10);
    color: rgba(255,255,255,.8);
    font-size: 12px;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
    padding: 0;
  }
  .t-x:active { background: rgba(255,255,255,.22); }
  .t-row.ringing { color: #ffb347; animation: t-ring 1s ease-in-out infinite; }
  .t-row.ringing .t-time { color: #ffb347; }
  @keyframes t-ring { 50% { opacity: 0.35; } }
`;

class AveryPixelClockCard extends HTMLElement {
  static getConfigElement() { return document.createElement('avery-pixel-clock-card-editor'); }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._gridRows = ROWS;
    this._cols = COLS; // recomputed from the panel width by _relayout()
    this._cells = new Array(ROWS * COLS);
    this._lastStr = '';
    this._timers = [];
    this._lastTimersJson = '';
    this._alerts = new Map(); // timer id -> { beepInterval, speakInterval }
    this._audioUnlocked = false;
  }

  setConfig(config) {
    if (!config) throw new Error('Invalid configuration');
    this._config = { ...DEFAULT_CONFIG, ...config };
    try { this._renderShell(); } catch (err) { console.error('avery-pixel-clock-card render failed', err); }
  }

  set hass(hass) {
    this._hass = hass;
    const list = hass?.states?.[TIMERS_ENTITY]?.attributes?.timers || [];
    const json = JSON.stringify(list);
    if (json !== this._lastTimersJson) {
      this._lastTimersJson = json;
      this._timers = list;
      this._renderTimers();
      this._updateAlerts();
      this._tick(); // glyphs may need to move up/down immediately
    }
  }

  connectedCallback() {
    if (!this._timer) this._timer = setInterval(() => this._tick(), 1000);
  }

  disconnectedCallback() {
    if (this._timer) { clearInterval(this._timer); this._timer = null; }
    this._ro?.disconnect();
    this._ro = null;
    for (const id of [...this._alerts.keys()]) this._stopAlert(id);
  }

  getCardSize() { return 2; }
  getGridOptions() {
    return { columns: 12, rows: 'auto', min_columns: 6, min_rows: 'auto' };
  }

  // ---- shell ---------------------------------------------------------

  _renderShell() {
    const cfg = this._config;
    this.shadowRoot.innerHTML = `
      <style>${CARD_CSS}</style>
      <ha-card class="card ${themeClass(cfg.theme)} ${cfg.hide_glow ? 'hide-glow' : ''} ${cfg.no_border ? 'no-border' : ''}">
        <div class="icon-col">
          <div class="icon-wrap"><ha-icon icon="${cfg.icon || DEFAULT_CONFIG.icon}"></ha-icon></div>
        </div>
        <div class="panel">
          <div class="grid" id="grid"></div>
          <div class="timers" id="timers" hidden></div>
        </div>
      </ha-card>
    `;
    const sh = this.shadowRoot;
    this._refs = {
      card: sh.querySelector('.card'),
      panel: sh.querySelector('.panel'),
      grid: sh.querySelector('#grid'),
      timers: sh.querySelector('#timers'),
    };

    this._applyConfigStyles();
    this._refs.card.style.setProperty('--pc-off', cfg.off_color || DEFAULT_CONFIG.off_color);
    this._refs.card.addEventListener('click', () => this._handleTap());
    // Autoplay policy: alert audio (AudioContext + speechSynthesis) is
    // blocked until the page has seen a user gesture — unlock on the first
    // tap anywhere on the card.
    this._refs.card.addEventListener('pointerdown', () => this._unlockAudio(), { once: false });
    this._buildGrid();
    this._lastStr = '';
    this._renderTimers();
    this._tick();

    // Re-measure the square pixel size / column count whenever the panel
    // changes width (responsive slots, sidebar toggles, viewport rotate).
    // ResizeObserver fires an initial callback on observe(), which also
    // covers the first real measurement once the grid has laid out.
    this._ro?.disconnect();
    this._ro = new ResizeObserver(() => { this._relayout(); this._tick(); });
    this._ro.observe(this._refs.grid);
    requestAnimationFrame(() => { this._relayout(); this._tick(); });
  }

  _applyConfigStyles() {
    const cfg = this._config;
    const st = this.style;
    st.setProperty('--am-card-height', cfg.height || '120px');
    st.setProperty('--am-radius', `${Number(cfg.corner_radius) || 14}px`);
    st.setProperty('--am-accent', cfg.accent_color || DEFAULT_CONFIG.accent_color);
    st.setProperty('--am-glow-1', cfg.glow_color_1 || DEFAULT_CONFIG.glow_color_1);
    st.setProperty('--am-glow-2', cfg.glow_color_2 || DEFAULT_CONFIG.glow_color_2);
    st.setProperty('--am-glow-3', cfg.glow_color_3 || DEFAULT_CONFIG.glow_color_3);
    st.setProperty('--pc-grid-pad', CLOCK_SIZE_PADDING[cfg.clock_size] || CLOCK_SIZE_PADDING.medium);
    if (cfg.background_color) st.setProperty('--am-bg-override', cfg.background_color);
    else st.removeProperty('--am-bg-override');
    if (this._refs?.card) {
      this._refs.card.style.backgroundImage = cfg.background_image
        ? `url("${cfg.background_image}")` : '';
    }
  }

  _handleTap() {
    const cfg = this._config;
    if (cfg.tap_action === 'navigate' && cfg.navigation_path) {
      history.pushState(null, '', cfg.navigation_path);
      window.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true }));
    }
    // 'more-info' has no natural entity on this card (pure clock display) —
    // no-op rather than guessing at one. 'none' also no-ops.
  }

  _desiredRows() {
    return this._timers.length ? ROWS_WITH_TIMERS : ROWS;
  }

  _buildGrid(rows = this._desiredRows(), cols = this._cols) {
    const grid = this._refs.grid;
    this._gridRows = rows;
    this._cols = cols;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    // Column track px is set by _relayout(); default to square-ish fr here so
    // the very first pre-measure paint isn't wildly stretched.
    grid.innerHTML = '';
    this._cells = new Array(rows * cols);
    for (let i = 0; i < rows * cols; i++) {
      const p = document.createElement('div');
      p.className = 'px';
      grid.appendChild(p);
      this._cells[i] = p;
    }
  }

  // Measure the panel and lock every LED to a square whose size follows the
  // (fixed) card height: S = usable grid height / row count. The column count
  // is then however many of those squares fit across the width — extra width
  // becomes unlit padding pixels, never a stretched font. Returns true if the
  // grid geometry changed (so the caller repaints).
  _relayout() {
    const grid = this._refs?.grid;
    if (!grid) return false;
    const rows = this._desiredRows();
    const gridH = grid.clientHeight;
    const gridW = grid.clientWidth;
    if (!gridH || !gridW) return false;
    const pad = parseFloat(getComputedStyle(grid).paddingTop) || 0;
    const S = (gridH - 2 * pad - (rows - 1) * GAP_PX) / rows;
    if (S <= 0) return false;
    const cols = Math.max(
      HHMM_WIDTH,
      Math.floor((gridW - 2 * pad + GAP_PX) / (S + GAP_PX)),
    );
    let changed = false;
    if (rows !== this._gridRows || cols !== this._cols) {
      this._buildGrid(rows, cols);
      changed = true;
    }
    const tpl = `repeat(${cols}, ${S.toFixed(3)}px)`;
    if (grid.style.gridTemplateColumns !== tpl) {
      grid.style.gridTemplateColumns = tpl;
      changed = true;
    }
    if (changed) this._lastStr = ''; // force a full glyph repaint
    return changed;
  }

  // ---- pixel painting -------------------------------------------------

  _idx(r, c) { return r * this._cols + c; }

  _setPx(r, c, color, blink) {
    if (r < 0 || c < 0 || r >= this._gridRows || c >= this._cols) return;
    const cell = this._cells[this._idx(r, c)];
    cell.classList.add('on');
    if (blink) cell.classList.add('blink');
    cell.style.setProperty('--c', color);
  }

  _paintGlyph(ch, rowStart, colStart, color) {
    const pattern = FONT[ch] || FONT['0'].map(() => '000');
    const w = pattern[0].length;
    for (let r = 0; r < GLYPH_H; r++) {
      for (let c = 0; c < w; c++) {
        if (pattern[r][c] === '1') this._setPx(rowStart + r, colStart + c, color, false);
      }
    }
  }

  _paintColon(rowStart, colStart, color) {
    [1, 3].forEach(r => this._setPx(rowStart + r, colStart, color, true));
  }

  _clear() {
    for (const c of this._cells) {
      if (c.className !== 'px') {
        c.className = 'px';
        c.style.removeProperty('--c');
      }
    }
  }

  _digitColor(i) {
    return this._config.digit_rainbow
      ? RAINBOW[i % RAINBOW.length]
      : (this._config.digit_color || DEFAULT_CONFIG.digit_color);
  }

  _pad2(n) { return n < 10 ? '0' + n : '' + n; }

  _timeParts() {
    const now = new Date();
    let h = now.getHours();
    let isPM = false;
    if (!this._config.format_24) {
      isPM = h >= 12; h = h % 12; if (h === 0) h = 12;
    }
    return { str: this._pad2(h) + this._pad2(now.getMinutes()) + this._pad2(now.getSeconds()), isPM };
  }

  _glyphTop() {
    return this._timers.length ? TOP_WITH_TIMERS : TOP_CENTERED;
  }

  _tick() {
    if (!this._refs?.grid || !this._config) return;
    this._tickTimers();
    if (this._desiredRows() !== this._gridRows) {
      this._relayout(); // rebuilds the grid + recomputes square size / columns
    }
    const { str, isPM } = this._timeParts();
    const top = this._glyphTop();
    const ampmWidth = this._config.format_24 ? 0 : AMPM_WIDTH;

    // Drop the seconds pair when the measured column count can't hold the full
    // HH:MM:SS field — the pixels stay square, we just show less.
    const showSeconds = this._cols >= TIME_WIDTH + ampmWidth;
    const digitCols = showSeconds ? DIGIT_COLS : HHMM_DIGIT_COLS;
    const colonCols = showSeconds ? COLON_COLS : HHMM_COLON_COLS;
    const timeWidth = showSeconds ? TIME_WIDTH : HHMM_WIDTH;
    const digits = showSeconds ? str : str.slice(0, 4);

    const key = `${digits}|${showSeconds}|${this._cols}|${this._gridRows}|${top}|${this._config.format_24}|${this._config.digit_rainbow}|${this._config.digit_color}|${this._config.sep_color}`;
    if (key === this._lastStr) return;
    this._lastStr = key;

    this._clear();
    const totalWidth = timeWidth + ampmWidth;
    const startCol = Math.max(0, Math.floor((this._cols - totalWidth) / 2));
    for (let i = 0; i < digits.length; i++) {
      this._paintGlyph(digits[i], top, startCol + digitCols[i], this._digitColor(i));
    }
    colonCols.forEach(c => this._paintColon(top, startCol + c, this._config.sep_color || DEFAULT_CONFIG.sep_color));
    if (!this._config.format_24) {
      const a = startCol + timeWidth + 1;
      this._paintGlyph(isPM ? 'P' : 'A', top, a, this._digitColor(0));
      this._paintGlyph('M', top, a + 4, this._digitColor(1));
    }
  }

  // ---- Avery timers ----------------------------------------------------

  _fmtRemaining(t) {
    if (t.status === 'ringing') return 'DONE';
    const s = Math.max(0, Math.round(t.ends_at - Date.now() / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    const p2 = n => (n < 10 ? '0' + n : '' + n);
    return h ? `${h}:${p2(m)}:${p2(sec)}` : `${m}:${p2(sec)}`;
  }

  _renderTimers() {
    const box = this._refs?.timers;
    if (!box) return;
    const shown = this._timers.slice(0, MAX_TIMER_ROWS);
    if (!shown.length) {
      box.hidden = true;
      box.innerHTML = '';
      return;
    }
    box.hidden = false;
    box.innerHTML = '';
    shown.forEach((t, i) => {
      const row = document.createElement('div');
      row.className = 't-row' + (t.status === 'ringing' ? ' ringing' : '');
      const name = document.createElement('span');
      name.className = 't-name';
      name.textContent = t.name;
      const time = document.createElement('span');
      time.className = 't-time';
      time.dataset.id = t.id;
      time.textContent = this._fmtRemaining(t);
      row.appendChild(name);
      if (i === MAX_TIMER_ROWS - 1 && this._timers.length > MAX_TIMER_ROWS) {
        const more = document.createElement('span');
        more.className = 't-more';
        more.textContent = `+${this._timers.length - MAX_TIMER_ROWS}`;
        row.appendChild(more);
      }
      row.appendChild(time);
      const x = document.createElement('button');
      x.className = 't-x';
      x.textContent = '✕';
      x.setAttribute('aria-label', `Cancel ${t.name} timer`);
      x.addEventListener('click', (ev) => {
        ev.stopPropagation();
        this._unlockAudio();
        this._hass?.callService('avery_smart_assist', 'cancel_timer', { id: t.id });
      });
      row.appendChild(x);
      box.appendChild(row);
    });
  }

  _tickTimers() {
    const box = this._refs?.timers;
    if (!box || box.hidden) return;
    for (const el of box.querySelectorAll('.t-time')) {
      const t = this._timers.find(x => x.id === el.dataset.id);
      if (t) {
        const txt = this._fmtRemaining(t);
        if (el.textContent !== txt) el.textContent = txt;
      }
    }
  }

  // ---- alert audio -----------------------------------------------------

  _unlockAudio() {
    if (this._audioUnlocked) return;
    this._audioUnlocked = true;
    try {
      this._audioCtx = this._audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (this._audioCtx.state === 'suspended') this._audioCtx.resume();
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance('');
        u.volume = 0;
        speechSynthesis.speak(u);
      }
    } catch (e) { /* audio stays locked — ringing rows still flash */ }
  }

  _beep() {
    try {
      const ctx = this._audioCtx;
      if (!ctx || ctx.state !== 'running') return;
      // Two short 880Hz pulses, classic kitchen-timer cadence
      [0, 0.25].forEach(offset => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        const t0 = ctx.currentTime + offset;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.2);
      });
    } catch (e) { /* ignore — flash-only fallback */ }
  }

  _speakFinished(name) {
    try {
      if (!window.speechSynthesis) return;
      const u = new SpeechSynthesisUtterance(`${name} timer finished`);
      speechSynthesis.speak(u);
    } catch (e) { /* ignore */ }
  }

  _updateAlerts() {
    const ringing = new Map(
      this._timers.filter(t => t.status === 'ringing').map(t => [t.id, t])
    );
    // stop alerts for timers no longer ringing (dismissed anywhere)
    for (const id of [...this._alerts.keys()]) {
      if (!ringing.has(id)) this._stopAlert(id);
    }
    for (const [id, t] of ringing) {
      if (this._alerts.has(id)) continue;
      // Clock-drift guard: if our local clock says it hasn't finished yet,
      // delay the first beep until it visibly hits 0:00.
      const wait = Math.max(0, (t.ends_at - Date.now() / 1000)) * 1000;
      const entry = { beepInterval: null, speakInterval: null, startTimeout: null };
      entry.startTimeout = setTimeout(() => {
        this._beep();
        this._speakFinished(t.name);
        entry.beepInterval = setInterval(() => this._beep(), 2500);
        entry.speakInterval = setInterval(() => this._speakFinished(t.name), 10000);
      }, wait);
      this._alerts.set(id, entry);
    }
  }

  _stopAlert(id) {
    const entry = this._alerts.get(id);
    if (!entry) return;
    clearTimeout(entry.startTimeout);
    clearInterval(entry.beepInterval);
    clearInterval(entry.speakInterval);
    this._alerts.delete(id);
    try { if (window.speechSynthesis) speechSynthesis.cancel(); } catch (e) { /* ignore */ }
  }
}

// ============================================================================
// Editor
// ============================================================================

class AveryPixelClockCardEditor extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._config = { ...DEFAULT_CONFIG };
  }

  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...(config || {}) };
    // Skip re-render only during our own brief post-emit window — Lovelace
    // echoes config-changed back via setConfig, and re-rendering on that
    // echo would wipe focus/caret out of a text field the user is mid-typing
    // into. Any OTHER setConfig call (dialog reopen, external change) always
    // re-renders — the previous "only ever render once" version silently
    // went stale on reopen, which is why toggles like "No border" looked
    // like they weren't being remembered.
    if (this._suppressRenderUntil && Date.now() < this._suppressRenderUntil) return;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) { this._render(); return; }
    this._shadow.querySelectorAll('ha-icon-picker').forEach(el => { el.hass = hass; });
  }

  _render() {
    const cfg = this._config;
    this._shadow.innerHTML = `
      <style>${AV_EDITOR_CSS}</style>
      ${section('Display',
        row('Title', textField('title', cfg, '')) +
        row('Icon', iconPicker('icon')) +
        themeRow(cfg)
      )}
      ${section('Layout & shape',
        row('Height (px)', numberField('height', cfg, { min: 44, max: 400, placeholder: '120' })) +
        row('Corner radius', numberField('corner_radius', cfg, { min: 0, max: 48, placeholder: '14' })) +
        row('Hide glow', checkboxField('hide_glow', cfg)) +
        row('No border', checkboxField('no_border', cfg)) +
        hint('Clock panel fills the card — flat seam on the left (icon side), rounded to match the card on the right.')
      )}
      ${colorsSection(cfg)}
      ${section('Background',
        row('Background colour', colorField('background_color', cfg, '#1a1c20')) +
        row('Background image', textField('background_image', cfg, '/local/…'))
      )}
      ${section('Pixel Clock',
        row('Clock size', selectField('clock_size', cfg, ['small', 'medium', 'large'])) +
        row('24-hour format', checkboxField('format_24', cfg, true)) +
        row('Rainbow digits', checkboxField('digit_rainbow', cfg, true)) +
        (!cfg.digit_rainbow ? row('Digit colour', colorField('digit_color', cfg, DEFAULT_CONFIG.digit_color)) : '') +
        row('Separator colour', colorField('sep_color', cfg, DEFAULT_CONFIG.sep_color)) +
        row('Off-pixel colour', colorField('off_color', cfg, DEFAULT_CONFIG.off_color))
      )}
      ${section('Tap behaviour',
        row('Tap action', selectField('tap_action', cfg, ['more-info', 'navigate', 'none'])) +
        row('Navigation path', textField('navigation_path', cfg, '/lovelace/home'))
      )}
    `;
    bindEditor(this._shadow, {
      hass: this._hass,
      cfg,
      update: (f, v) => this._update(f, v),
      rerender: () => this._render(),
    });
    this._rendered = true;
  }

  _update(field, value) {
    this._config = { ...this._config, [field]: value };
    // Brief window where our own setConfig echo is ignored — see setConfig's
    // comment. 400ms is plenty for Lovelace's round-trip, short enough that
    // a genuine external change right after ours wouldn't get lost for long.
    this._suppressRenderUntil = Date.now() + 400;
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...this._config } },
      bubbles: true,
      composed: true,
    }));
  }
}

if (!customElements.get('avery-pixel-clock-card')) customElements.define('avery-pixel-clock-card', AveryPixelClockCard);
if (!customElements.get('avery-pixel-clock-card-editor')) customElements.define('avery-pixel-clock-card-editor', AveryPixelClockCardEditor);

window.customCards = window.customCards || [];
if (!window.customCards.find(c => c.type === 'avery-pixel-clock-card')) {
  window.customCards.push({
    type: 'avery-pixel-clock-card',
    preview: false,
    name: 'Avery Pixel Clock Card',
    description: 'LED-matrix pixel clock with icon column — HH:MM:SS, blinking colon, configurable colours',
  });
}
