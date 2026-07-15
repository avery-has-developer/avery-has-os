// avery-bbc-radio-card.js — browser HLS/stream player for BBC live radio.
// Plays the public BBC streams directly; no BBC account/auth (that path is
// CORS-blocked from a browser origin).
import { AV_EDITOR_CSS, section, row, textField, numberField, themeRow, colorsSection, bindEditor } from './avery-card-editor.js?v=8';

// Bump on every meaningful cut. Shown in the editor + logged on load so it's
// always clear which build is loaded.
const CARD_VERSION = '0.6';

// Signature BBC-radio palette — the colour defaults in the editor (accent + glows).
const BBC_COLORS = { accent_color: '#ff375f', glow_color_1: '#ff375f', glow_color_2: '#ffb020', glow_color_3: '#7a5cff' };

// Standard Avery customisation parameters (+ this card's default_station).
const DEFAULT_CONFIG = {
  default_station: 0,
  name: '',
  theme: 'dashboard',
  corner_radius: 12,
  ...BBC_COLORS,
};

const STATIONS = [
  { name: 'BBC Radio 1',       short: 'R1',  vpid: 'bbc_radio_one',
    fallback: 'https://as-hls-ww-live.akamaized.net/pool_01505109/live/ww/bbc_radio_one/bbc_radio_one.isml/bbc_radio_one-audio=128000.norewind.m3u8' },
  { name: 'BBC Radio 2',       short: 'R2',  vpid: 'bbc_radio_two',
    fallback: 'https://as-hls-ww-live.akamaized.net/pool_74208725/live/ww/bbc_radio_two/bbc_radio_two.isml/bbc_radio_two-audio=128000.norewind.m3u8' },
  { name: 'BBC Radio 3',       short: 'R3',  vpid: 'bbc_radio_three',
    fallback: 'https://as-hls-ww-live.akamaized.net/pool_23461179/live/ww/bbc_radio_three/bbc_radio_three.isml/bbc_radio_three-audio=128000.norewind.m3u8' },
  { name: 'BBC Radio 4',       short: 'R4',  vpid: 'bbc_radio_fourfm',
    fallback: 'https://as-hls-ww-live.akamaized.net/pool_55057080/live/ww/bbc_radio_fourfm/bbc_radio_fourfm.isml/bbc_radio_fourfm-audio=128000.norewind.m3u8' },
  { name: 'BBC Radio 5 Live',  short: '5L',  vpid: 'bbc_radio_five_live',
    fallback: 'https://as-hls-ww-live.akamaized.net/pool_89021708/live/ww/bbc_radio_five_live/bbc_radio_five_live.isml/bbc_radio_five_live-audio=128000.norewind.m3u8' },
  { name: 'BBC Radio 4 Extra', short: '4X',  vpid: 'bbc_radio_four_extra',
    fallback: 'https://as-hls-ww-live.akamaized.net/pool_26173715/live/ww/bbc_radio_four_extra/bbc_radio_four_extra.isml/bbc_radio_four_extra-audio=128000.norewind.m3u8' },
  { name: 'BBC Asian Network', short: 'ASN', vpid: 'bbc_asian_network',
    fallback: 'https://as-hls-ww-live.akamaized.net/pool_22108647/live/ww/bbc_asian_network/bbc_asian_network.isml/bbc_asian_network-audio=128000.norewind.m3u8' },
  { name: 'BBC World Service', short: 'WS',  vpid: 'bbc_world_service',
    // WS has no working https HLS pool (the akamaized pool is http-only → mixed
    // content on an https dashboard). This direct AAC/MP3 stream serves over
    // https with open CORS and plays via the native <audio> path.
    fallback: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service' },
  { name: 'BBC 6 Music',       short: '6M',  vpid: 'bbc_6music',
    fallback: 'https://as-hls-ww-live.akamaized.net/pool_81827798/live/ww/bbc_6music/bbc_6music.isml/bbc_6music-audio=128000.norewind.m3u8' },
];

let _hlsLib = null;

async function ensureHls() {
  if (_hlsLib !== null) return _hlsLib;
  if (window.Hls) { _hlsLib = window.Hls; return _hlsLib; }
  // Bundled with the avery_has_os integration first, then a plain /local copy
  // for the standalone (www) install.
  for (const src of ['/avery_has_os/hls.min.js', '/local/hls.min.js']) {
    const ok = await new Promise(resolve => {
      const s = document.createElement('script');
      s.src = src;
      s.onload  = () => resolve(true);
      s.onerror = () => { s.remove(); resolve(false); };
      document.head.appendChild(s);
    });
    if (ok && window.Hls) { _hlsLib = window.Hls; return _hlsLib; }
  }
  _hlsLib = null;
  return null;
}

// Make a range input draggable via POINTER events, not the native range's own
// touch handling. The iOS Home Assistant companion app (WKWebView) doesn't
// deliver touch-drags to custom-styled <input type=range>, so the thumb won't
// move — even though it works in mobile Safari. Pointer events fire reliably in
// both, so we drive the value ourselves and dispatch a synthetic 'input' event
// (the card's existing input listener still does the work). Additive: native
// click/keyboard still function.
function enableSliderDrag(wrap, input) {
  if (!wrap || !input || wrap._avDrag) return;
  wrap._avDrag = true;
  const setFromX = (clientX) => {
    const r = input.getBoundingClientRect();
    if (!r.width) return;
    const min = Number(input.min || 0), max = Number(input.max || 100);
    const pct = Math.max(0, Math.min(1, (clientX - r.left) / r.width));
    const val = Math.round(min + pct * (max - min));
    if (String(val) !== input.value) {
      input.value = String(val);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };
  wrap.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    try { wrap.setPointerCapture(e.pointerId); } catch (_) {}
    wrap._dragging = true;
    setFromX(e.clientX);
    e.preventDefault();
  });
  wrap.addEventListener('pointermove', (e) => { if (wrap._dragging) setFromX(e.clientX); });
  const end = (e) => { wrap._dragging = false; try { wrap.releasePointerCapture(e.pointerId); } catch (_) {} };
  wrap.addEventListener('pointerup', end);
  wrap.addEventListener('pointercancel', end);
}

const TMPL = document.createElement('template');
TMPL.innerHTML = `
<style>
  :host {
    display: block;
    --accent: var(--am-accent, #ff375f);
    --glow1:  var(--am-glow-1, #ff375f);
    --glow2:  var(--am-glow-2, #ffb020);
    --glow3:  var(--am-glow-3, #7a5cff);
    --text:   var(--am-text,   #ffffff);
    --muted:  var(--am-muted,  rgba(255,255,255,.68));
    --bg:     var(--am-bg,     rgba(255,255,255,.08));
    --border: var(--am-border, rgba(255,255,255,.10));
    --radius: var(--am-radius, 12px);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  .card {
    position: relative;
    width: 100%; min-height: 120px;
    border-radius: var(--radius);
    overflow: hidden;
    background: var(--bg);
    border: 1px solid var(--border);
    padding: 12px 12px 10px;
    box-sizing: border-box;
    display: flex; flex-direction: column;
    gap: 8px;
    color: var(--text);
  }
  .card.theme-light {
    --text: #172033; --muted: rgba(23,32,51,.62);
    --bg: rgba(255,255,255,.55); --border: rgba(0,0,0,.10);
  }
  .glow {
    position: absolute;
    width: 110px; height: 110px;
    right: -34px; bottom: -40px;
    border-radius: 50%;
    background: conic-gradient(from 140deg, var(--glow1), var(--glow2), var(--glow3), var(--glow1));
    filter: blur(22px); opacity: 0.36; pointer-events: none;
  }

  /* top row */
  .top { display: flex; align-items: center; gap: 10px; min-width: 0; position: relative; }
  .play-btn {
    width: 36px; height: 36px; flex: 0 0 36px;
    border-radius: 50%;
    display: grid; place-items: center;
    background: linear-gradient(160deg,
      color-mix(in srgb, var(--accent) 70%, #1a1020),
      color-mix(in srgb, var(--accent) 30%, #120910));
    border: 1px solid color-mix(in srgb, var(--accent) 45%, rgba(255,255,255,.18));
    box-shadow: inset 0 1px 0 rgba(255,255,255,.24),
      0 0 20px -6px var(--accent), 0 6px 14px rgba(0,0,0,.35);
    cursor: pointer; padding: 0;
    transition: transform .12s ease;
    color: #fff;
  }
  .play-btn:active { transform: scale(.95); }
  .play-ico  { width: 14px; height: 14px; margin-left: 2px;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,.35)); }
  .bars { display: none; gap: 2px; align-items: flex-end; height: 14px; }
  .bars span { display: block; width: 2.5px; background: #fff; border-radius: 1px;
    animation: eq 900ms ease-in-out infinite; }
  .bars span:nth-child(1) { height: 40%; animation-delay: -100ms; }
  .bars span:nth-child(2) { height: 90%; animation-delay: -400ms; }
  .bars span:nth-child(3) { height: 60%; animation-delay: -250ms; }
  @keyframes eq { 0%,100% { transform: scaleY(.35); } 50% { transform: scaleY(1); } }
  .playing   .play-ico { display: none; }
  .playing   .bars     { display: flex; }

  .info { flex: 1 1 auto; min-width: 0; }
  .info-top { display: flex; align-items: center; gap: 6px; }
  .live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #22c55e; box-shadow: 0 0 8px #22c55e;
    animation: pulse 1.6s ease-in-out infinite;
  }
  .live-dot[hidden] { display: none; }
  @keyframes pulse { 50% { opacity: .35; } }
  .live-label { font-size: 9px; font-weight: 700; letter-spacing: .12em;
    color: var(--muted); text-transform: uppercase; }
  .station { font-size: 15px; font-weight: 700; letter-spacing: -0.01em;
    line-height: 1.15; margin-top: 1px; overflow: hidden; white-space: nowrap; }
  .station .marq { display: inline-block; white-space: nowrap; }
  .station.scroll .marq { animation: marquee var(--marq-dur, 10s) ease-in-out infinite alternate; }
  @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(var(--marq-shift, 0)); } }

  /* BBC blocks logo */
  .bbc-logo { display: flex; gap: 4px; flex: 0 0 auto; }
  .bbc-logo .block {
    width: 26px; height: 34px;
    background: #fff; color: #0a0b10;
    display: grid; place-items: center;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    font-weight: 900; font-size: 24px; letter-spacing: -0.04em;
    border-radius: 3px; box-shadow: 0 2px 6px rgba(0,0,0,.35);
    user-select: none;
  }

  /* volume row */
  .vol-row { display: flex; align-items: center; gap: 8px; }
  .ctrl {
    width: 20px; height: 20px; border-radius: 5px;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.12);
    color: #fff; display: grid; place-items: center;
    cursor: pointer; padding: 0; flex: 0 0 20px;
  }
  .ctrl:hover { background: rgba(255,255,255,.16); }
  .ctrl svg { width: 10px; height: 10px; }
  /* volume slider — shared Avery media-card style */
  .vol-well {
    flex: 1 1 auto; min-width: 0; height: 24px; border-radius: 999px;
    background: linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.15)), rgba(255,255,255,.04);
    display: flex; align-items: center; padding: 0 10px; gap: 8px;
    box-shadow: inset 0 1.5px 2px rgba(0,0,0,.55), inset 0 -1px 0 rgba(255,255,255,.06);
  }
  .vol-ic { width: 13px; height: 13px; flex: none; color: rgba(255,255,255,.85); }
  .slider-wrap { position: relative; flex: 1; min-width: 0; display: flex; align-items: center; height: 20px; touch-action: none; }
  .av-slider {
    -webkit-appearance: none; appearance: none; width: 100%; height: 4px; border-radius: 999px;
    outline: none; margin: 0; cursor: pointer;
    background: linear-gradient(to right, #fff 0%, #fff var(--val,70%), rgba(255,255,255,.18) var(--val,70%), rgba(255,255,255,.18) 100%);
  }
  .av-slider::-webkit-slider-thumb {
    -webkit-appearance: none; width: 34px; height: 16px; border-radius: 999px;
    background: linear-gradient(180deg, #fff, #e9e9ec);
    box-shadow: 0 1px 3px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.95); cursor: pointer;
  }
  .av-slider::-moz-range-thumb {
    width: 34px; height: 16px; border: 0; border-radius: 999px;
    background: linear-gradient(180deg, #fff, #e9e9ec);
    box-shadow: 0 1px 3px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.95); cursor: pointer;
  }
  .vol-val { font-size: 10px; color: rgba(255,255,255,.85); min-width: 20px; text-align: right; font-variant-numeric: tabular-nums; flex: none; }

  /* station chips */
  .chips { display: flex; gap: 3px; flex-wrap: nowrap; justify-content: space-between; }
  .chip {
    flex: 1 1 0; min-width: 0;
    font-size: 9px; font-weight: 600;
    padding: 3px 2px; text-align: center;
    border-radius: 5px;
    background: rgba(255,255,255,.05);
    border: 1px solid rgba(255,255,255,.08);
    color: var(--muted);
    cursor: pointer; user-select: none;
    transition: all .15s ease; white-space: nowrap;
  }
  .chip:hover { color: #fff; border-color: rgba(255,255,255,.22); }
  .chip.active {
    color: #fff;
    background: color-mix(in srgb, var(--accent) 32%, rgba(255,255,255,.06));
    border-color: color-mix(in srgb, var(--accent) 60%, transparent);
    box-shadow: 0 0 10px -3px var(--accent);
  }
</style>
<div class="card" id="card">
  <div class="glow"></div>
  <div class="top">
    <button class="play-btn" id="playBtn" title="Play / Pause">
      <svg class="play-ico" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
      <div class="bars"><span></span><span></span><span></span></div>
    </button>
    <div class="info">
      <div class="info-top">
        <span class="live-dot" id="liveDot" hidden></span>
        <span class="live-label" id="liveLabel">Live</span>
      </div>
      <div class="station" id="stationName"></div>
    </div>
    <div class="bbc-logo" aria-label="BBC">
      <div class="block">B</div><div class="block">B</div><div class="block">C</div>
    </div>
  </div>
  <div class="vol-row">
    <button class="ctrl" id="prevBtn" title="Previous station">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zM9.5 12l8.5 6V6z"/></svg>
    </button>
    <div class="vol-well">
      <svg class="vol-ic" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>
      <span class="slider-wrap"><input type="range" class="av-slider" id="volSlider" min="0" max="100" value="70"></span>
      <span class="vol-val" id="volVal">70</span>
    </div>
    <button class="ctrl" id="nextBtn" title="Next station">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 6h2v12h-2zM6 6v12l8.5-6z"/></svg>
    </button>
  </div>
  <div class="chips" id="chips"></div>
</div>
<audio id="audio"></audio>
`;

class AveryBBCRadioCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._current = Math.min(
      parseInt(localStorage.getItem('avery-bbc-station') || '0', 10),
      STATIONS.length - 1
    );
    this._volume   = parseFloat(localStorage.getItem('avery-bbc-volume') || '0.7');
    this._playing  = false;
    this._hls      = null;
    this._built    = false;
    this._config   = {};
  }

  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...(config || {}) };
    // Respect default_station from config on first build (before localStorage overrides it)
    if (!this._built) {
      if (this._config.default_station != null && !localStorage.getItem('avery-bbc-station')) {
        this._current = Math.min(parseInt(this._config.default_station, 10), STATIONS.length - 1);
      }
      this._build();
      this._built = true;
    }
    this._applyConfig();
  }

  // Apply the standard Avery customisation params to the host / card.
  _applyConfig() {
    const c = this._config;
    const set = (k, v) => (v ? this.style.setProperty(k, v) : this.style.removeProperty(k));
    set('--am-accent', c.accent_color);
    set('--am-glow-1', c.glow_color_1);
    set('--am-glow-2', c.glow_color_2);
    set('--am-glow-3', c.glow_color_3);
    set('--am-radius', (c.corner_radius != null && c.corner_radius !== '') ? `${c.corner_radius}px` : null);
    const card = this.shadowRoot && this.shadowRoot.getElementById('card');
    if (card) {
      card.classList.remove('theme-dark', 'theme-light', 'theme-dashboard');
      card.classList.add(`theme-${c.theme || 'dashboard'}`);
    }
    const label = this.shadowRoot && this.shadowRoot.getElementById('liveLabel');
    if (label) label.textContent = c.name || 'Live';
  }

  set hass(_) {}

  _build() {
    const sr = this.shadowRoot;
    sr.appendChild(TMPL.content.cloneNode(true));

    this._audio = sr.getElementById('audio');
    this._card  = sr.getElementById('card');

    const slider = sr.getElementById('volSlider');
    slider.addEventListener('input', () => this._setVolume(Number(slider.value) / 100));
    enableSliderDrag(slider.closest('.slider-wrap'), slider);

    sr.getElementById('playBtn').addEventListener('click', () => this._togglePlay());
    sr.getElementById('prevBtn').addEventListener('click', () =>
      this._selectStation((this._current - 1 + STATIONS.length) % STATIONS.length, this._playing));
    sr.getElementById('nextBtn').addEventListener('click', () =>
      this._selectStation((this._current + 1) % STATIONS.length, this._playing));

    this._audio.addEventListener('play',  () => this._setPlaying(true));
    this._audio.addEventListener('pause', () => this._setPlaying(false));
    this._audio.addEventListener('ended', () => this._setPlaying(false));
    this._audio.addEventListener('error', () => this._setPlaying(false));

    this._renderChips();
    this._updateInfo();
    this._setVolume(this._volume);
    this._setCardState();
    this._startMeta();
  }

  _renderChips() {
    const el = this.shadowRoot.getElementById('chips');
    if (!el) return;
    el.innerHTML = '';
    STATIONS.forEach((s, i) => {
      const b = document.createElement('button');
      b.className = 'chip' + (i === this._current ? ' active' : '');
      b.textContent = s.short;
      b.title = s.name;
      b.addEventListener('click', () => this._selectStation(i, true));
      el.appendChild(b);
    });
  }

  _titleText() {
    // Live programme/track line from the avery_has_os proxy if present, else
    // the station name.
    return this._nowPlaying || STATIONS[this._current].name;
  }

  // Poll the integration's server-side BBC proxy for the current programme/track.
  // Degrades silently to the station name if the integration isn't installed
  // (the endpoint 404s) or the request fails.
  async _fetchMeta() {
    const station = STATIONS[this._current];
    const token = ++this._metaToken;
    try {
      const r = await fetch(`/avery_has_os/bbc/nowplaying?service=${encodeURIComponent(station.vpid)}`);
      if (!r.ok) throw new Error(String(r.status));
      const d = await r.json();
      if (token !== this._metaToken) return; // station changed mid-flight
      const line = d && d.line;
      if (line && line !== this._nowPlaying) { this._nowPlaying = line; this._nowArt = d.image || null; this._updateInfo(); }
      else if (!line && this._nowPlaying) { this._nowPlaying = null; this._nowArt = null; this._updateInfo(); }
      else if (line) { this._nowArt = d.image || null; }
    } catch (_) {
      if (token === this._metaToken && this._nowPlaying) { this._nowPlaying = null; this._nowArt = null; this._updateInfo(); }
    }
  }

  _startMeta() {
    this._metaToken = 0;
    clearInterval(this._metaTimer);
    this._fetchMeta();
    this._metaTimer = setInterval(() => this._fetchMeta(), 30000);
  }

  disconnectedCallback() {
    clearInterval(this._metaTimer);
  }

  _updateInfo() {
    const el = this.shadowRoot.getElementById('stationName');
    if (el) {
      el.textContent = '';
      const span = document.createElement('span');
      span.className = 'marq';
      span.textContent = this._titleText();
      el.appendChild(span);
      // Scroll (ping-pong) only when the title overflows its box.
      requestAnimationFrame(() => {
        el.classList.remove('scroll');
        const overflow = span.scrollWidth - el.clientWidth;
        if (overflow > 4) {
          el.style.setProperty('--marq-shift', `-${overflow + 8}px`);
          el.style.setProperty('--marq-dur', `${Math.max(6, (overflow + 8) / 22)}s`);
          el.classList.add('scroll');
        }
      });
    }
    this._renderChips();
    this._updateMediaSession();
  }

  // Canvas-drawn raster cover so the iOS lock screen / widget has real artwork
  // (BBC only exposes SVG; iOS wants raster). Cached per station.
  _stationArtwork(i) {
    this._artCache = this._artCache || {};
    if (this._artCache[i]) return this._artCache[i];
    const s = STATIONS[i];
    const c = document.createElement('canvas');
    c.width = c.height = 320;
    const g = c.getContext('2d');
    const grd = g.createLinearGradient(0, 0, 320, 320);
    grd.addColorStop(0, '#2a0d18'); grd.addColorStop(1, '#100810');
    g.fillStyle = grd; g.fillRect(0, 0, 320, 320);
    g.fillStyle = '#ff375f';
    g.beginPath(); g.arc(160, 138, 96, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#fff';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '700 92px system-ui, sans-serif';
    g.fillText(s.short, 160, 142);
    g.font = '700 30px system-ui, sans-serif';
    g.fillText('BBC RADIO', 160, 268);
    return (this._artCache[i] = c.toDataURL('image/png'));
  }

  _updateMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const s = STATIONS[this._current];
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: this._titleText(),
        artist: s.name,
        album: this._config.name || 'BBC Radio',
        artwork: this._nowArt
          ? [{ src: this._nowArt, sizes: '480x480', type: 'image/jpeg' }]
          : [{ src: this._stationArtwork(this._current), sizes: '320x320', type: 'image/png' }],
      });
    } catch (_) { /* MediaMetadata unsupported */ }
    const set = (a, h) => { try { navigator.mediaSession.setActionHandler(a, h); } catch (_) {} };
    set('play',  () => this._audio.play().catch(() => {}));
    set('pause', () => this._audio.pause());
    set('stop',  () => this._audio.pause());
    set('previoustrack', () => this._selectStation((this._current - 1 + STATIONS.length) % STATIONS.length, true));
    set('nexttrack',     () => this._selectStation((this._current + 1) % STATIONS.length, true));
  }

  _setPlaying(playing) {
    this._playing = playing;
    this._setCardState();
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
    const dot = this.shadowRoot.getElementById('liveDot');
    if (dot) playing ? dot.removeAttribute('hidden') : dot.setAttribute('hidden', '');
  }

  _setCardState() {
    if (!this._card) return;
    this._card.classList.toggle('playing', this._playing);
  }

  _setVolume(v) {
    v = Math.max(0, Math.min(1, v));
    this._volume = v;
    if (this._audio) this._audio.volume = v;
    localStorage.setItem('avery-bbc-volume', String(v));
    const pct = Math.round(v * 100);
    const sl  = this.shadowRoot.getElementById('volSlider');
    const val = this.shadowRoot.getElementById('volVal');
    if (sl)  { if (document.activeElement !== sl) sl.value = String(pct);
               sl.style.setProperty('--val', pct + '%'); }
    if (val) val.textContent = String(pct);
  }

  // The public https stream for a station.
  _streamUrl(station) {
    return station.fallback;
  }

  async _loadStream(url) {
    if (this._hls) { this._hls.destroy(); this._hls = null; }
    this._audio.pause();
    this._audio.src = '';

    // Only .m3u8 URLs go through HLS.js; direct ICY/AAC/MP3 streams (e.g. World
    // Service) play natively — HLS.js would choke on a non-HLS source.
    const isHls = /\.m3u8(\?|$)/i.test(url);
    const HLS = isHls ? await ensureHls() : null;
    if (isHls && HLS && HLS.isSupported()) {
      const h = new HLS({
        maxBufferLength: 30,
        liveSyncDurationCount: 3,
        enableWorker: true,
        // Fetch anonymously. The public BBC HLS streams answer with
        // `Access-Control-Allow-Origin: *`, which the browser REJECTS for
        // credentialed (withCredentials) requests — that combination is what
        // blocked all playback. Credentials would only matter for an
        // authenticated MediaSelector URL, and that path is CORS-blocked from a
        // browser origin anyway.
      });
      h.loadSource(url);
      h.attachMedia(this._audio);
      this._hls = h;
    } else {
      // Direct stream (WS) or Safari native HLS. Anonymous, same wildcard-CORS
      // reason as above.
      this._audio.crossOrigin = 'anonymous';
      this._audio.src = url;
    }
  }

  async _selectStation(i, autoplay) {
    this._current = i;
    localStorage.setItem('avery-bbc-station', String(i));
    this._nowPlaying = null; this._nowArt = null;
    this._updateInfo();
    this._fetchMeta();
    await this._loadStream(this._streamUrl(STATIONS[i]));
    if (autoplay) this._audio.play().catch(() => {});
  }

  async _togglePlay() {
    if (!this._audio.src && !this._hls) {
      await this._loadStream(this._streamUrl(STATIONS[this._current]));
    }
    if (this._audio.paused) {
      this._audio.play().catch(() => {});
    } else {
      this._audio.pause();
    }
  }

  static getConfigElement() { return document.createElement('avery-bbc-radio-card-editor'); }
  static getStubConfig()    { return {}; }
  getCardSize()             { return 2; }
}

// ─── Card editor ────────────────────────────────────────────────────────────

class AveryBBCRadioCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = { ...DEFAULT_CONFIG };
  }

  set hass(hass) { this._hass = hass; }

  setConfig(config) {
    this._config = { ...DEFAULT_CONFIG, ...(config || {}) };
    if (!this._rendered) this._render();
  }

  _render() {
    const c = this._config;
    this.shadowRoot.innerHTML = `<style>${AV_EDITOR_CSS}
      .av-ed-ver { text-align:center; font-size:10px; font-weight:600; letter-spacing:.04em; opacity:.5; padding-top:6px; color:var(--secondary-text-color); }
    </style>
      ${section('General',
        row('Name', textField('name', c, 'BBC Radio')) +
        row('Default station', `<select data-field="default_station">${STATIONS.map((s, i) => `<option value="${i}" ${Number(c.default_station) === i ? 'selected' : ''}>${s.name}</option>`).join('')}</select>`) +
        themeRow(c)
      )}
      ${colorsSection(c, BBC_COLORS)}
      ${section('Dimensions',
        row('Corner radius', numberField('corner_radius', c, { min: 0, max: 40, placeholder: '12' }))
      )}
      <div class="av-ed-ver">Avery BBC Radio Card · v${CARD_VERSION}</div>
    `;
    bindEditor(this.shadowRoot, {
      hass: this._hass,
      cfg: c,
      update: (f, v) => {
        if (f === 'default_station') v = Number(v);
        this._config = { ...this._config, [f]: v };
        this._fire();
      },
      rerender: () => this._render(),
      colorDefaults: BBC_COLORS,
    });
    this._rendered = true;
  }

  _fire() {
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: { ...DEFAULT_CONFIG, ...this._config } },
      bubbles: true, composed: true,
    })), 180);
  }
}

customElements.define('avery-bbc-radio-card-editor', AveryBBCRadioCardEditor);
customElements.define('avery-bbc-radio-card', AveryBBCRadioCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'avery-bbc-radio-card',
  name: 'Avery BBC Radio',
  description: 'Live BBC radio player — 9 stations, plays in the browser.',
  preview: false,
  version: CARD_VERSION,
});

console.info(`%c AVERY BBC RADIO %c v${CARD_VERSION} `, 'background:#ff375f;color:#fff;border-radius:3px 0 0 3px;padding:2px 4px', 'background:#1f2937;color:#fff;border-radius:0 3px 3px 0;padding:2px 4px');
