import { AV_EDITOR_CSS, section, row, themeRow, textField, numberField, checkboxField, colorField, entityPicker, bindEditor } from './avery-card-editor.js?v=8';

const DEFAULT_CONFIG = {
  type: 'custom:avery-weather-card',
  entity: 'weather.forecast_home',
  name: '',
  theme: 'dashboard',
  height: 120,
  corner_radius: 10,
  icon_size: 42,
  current_title: '',
  hourly_count: 5,
  daily_count: 5,
  auto_cycle: false,
  cycle_seconds: 8,
  show_dots: true,
  // Single setting: 'none' (use real day/night), 'day' (force day sky + cycle
  // through condition demos on click), 'night' (force night sky + cycle).
  demo_mode: 'none',
  icon_path: '/local/mockups/WeatherIcons',
  moon_icon_path: '/local/mockups/MoonIcons',
  background: '',
  accent_color: '#6f7bff',
  glow_color: '#ff8a4c',
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function num(value) { const parsed = Number.parseFloat(value); return Number.isFinite(parsed) ? parsed : null; }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function titleCase(value) { return String(value || '').replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase()); }
function tempText(value, unit = '°C', digits = 0, showUnit = true) {
  const parsed = num(value);
  if (parsed === null) return '--';
  return `${parsed.toFixed(digits).replace(/\.0$/, '')}${showUnit ? (unit || '°C') : '°'}`;
}
function dayName(dateLike, short = true) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { weekday: short ? 'short' : 'long' });
}
function hourText(dateLike) {
  const d = new Date(dateLike);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString(undefined, { hour: '2-digit', hour12: false });
}
function iconCode(condition, isNight = false) {
  const key = String(condition || '').toLowerCase().replace(/_/g, '-');
  if (isNight && ['sunny', 'clear-night'].includes(key)) return '31';
  return ({
    sunny: '32', 'clear-night': '31', partlycloudy: '30', 'partly-cloudy': '30', cloudy: '26', fog: '20', hail: '17',
    lightning: '37', 'lightning-rainy': '38', pouring: '12', rainy: '11', snowy: '14', 'snowy-rainy': '7', windy: '23',
    'windy-variant': '23', exceptional: 'Na', unavailable: 'Na', unknown: 'Na', clear: '32', overcast: '26',
  })[key] || '32';
}
function weatherIcon(condition) {
  const key = String(condition || '').toLowerCase().replace(/_/g, '-');
  return ({
    sunny: 'mdi:weather-sunny',
    clear: 'mdi:weather-sunny',
    'clear-night': 'mdi:weather-night',
    partlycloudy: 'mdi:weather-partly-cloudy',
    'partly-cloudy': 'mdi:weather-partly-cloudy',
    cloudy: 'mdi:weather-cloudy',
    overcast: 'mdi:weather-cloudy',
    fog: 'mdi:weather-fog',
    hail: 'mdi:weather-hail',
    lightning: 'mdi:weather-lightning',
    'lightning-rainy': 'mdi:weather-lightning-rainy',
    pouring: 'mdi:weather-pouring',
    rainy: 'mdi:weather-rainy',
    snowy: 'mdi:weather-snowy',
    'snowy-rainy': 'mdi:weather-snowy-rainy',
    windy: 'mdi:weather-windy',
    'windy-variant': 'mdi:weather-windy-variant',
    exceptional: 'mdi:alert-circle-outline',
    unavailable: 'mdi:weather-cloudy-alert',
    unknown: 'mdi:weather-cloudy-alert',
  })[key] || 'mdi:weather-partly-cloudy';
}
function weatherIconFor(condition, isNight = false) {
  const key = String(condition || '').toLowerCase().replace(/_/g, '-');
  if (isNight && ['sunny', 'clear', 'partlycloudy', 'partly-cloudy'].includes(key)) return key.includes('partly') ? 'mdi:weather-night-partly-cloudy' : 'mdi:weather-night';
  return weatherIcon(condition);
}
function viewIcon(view) {
  if (view === 1) return 'mdi:clock-outline';
  if (view === 2) return 'mdi:weather-partly-cloudy';
  return 'mdi:weather-sunny';
}
function themeClass(theme) {
  if (theme === 'dark') return 'theme-dark';
  if (theme === 'light') return 'theme-light';
  return 'theme-dashboard';
}
function conditionClass(condition) {
  const key = String(condition || '').toLowerCase().replace(/_/g, '-');
  if (['sunny', 'clear'].includes(key)) return 'cond-sunny';
  if (key === 'clear-night') return 'cond-night';
  if (['partlycloudy', 'partly-cloudy'].includes(key)) return 'cond-partly';
  if (['cloudy', 'overcast'].includes(key)) return 'cond-cloudy';
  if (['rainy', 'pouring'].includes(key)) return key === 'pouring' ? 'cond-pouring' : 'cond-rainy';
  if (key === 'lightning-rainy') return 'cond-lightning cond-rainy';
  if (key === 'lightning') return 'cond-lightning';
  if (key === 'snowy-rainy') return 'cond-snowy cond-rainy';
  if (key === 'hail') return 'cond-hail cond-snowy';
  if (key === 'snowy') return 'cond-snowy';
  if (key === 'fog') return 'cond-fog';
  if (key === 'windy-variant') return 'cond-windy cond-cloudy';
  if (key === 'windy') return 'cond-windy';
  if (key === 'exceptional') return 'cond-exceptional cond-cloudy';
  return 'cond-cloudy';
}
function isNightCondition(condition) {
  return String(condition || '').toLowerCase().replace(/_/g, '-') === 'clear-night';
}
const CONDITION_LABELS = {
  'clear-night': 'Clear Night',
  clear: 'Clear',
  sunny: 'Sunny',
  partlycloudy: 'Partly Cloudy',
  'partly-cloudy': 'Partly Cloudy',
  cloudy: 'Cloudy',
  overcast: 'Overcast',
  fog: 'Fog',
  hail: 'Hail',
  lightning: 'Lightning',
  'lightning-rainy': 'Thunderstorms',
  pouring: 'Pouring',
  rainy: 'Rainy',
  snowy: 'Snowy',
  'snowy-rainy': 'Sleet',
  windy: 'Windy',
  'windy-variant': 'Windy',
  exceptional: 'Severe Weather',
};
function conditionTitle(condition, isNight = false) {
  const key = String(condition || '').toLowerCase().replace(/_/g, '-');
  if (isNight && ['sunny', 'clear'].includes(key)) return 'Clear Night';
  if (isNight && ['partlycloudy', 'partly-cloudy'].includes(key)) return 'Partly Cloudy Night';
  return CONDITION_LABELS[key] || titleCase(condition);
}
function moonPhaseIndex(date = new Date()) {
  const knownNewMoon = Date.UTC(2024, 0, 11, 11, 57);
  const days = (date.getTime() - knownNewMoon) / 86400000;
  return Math.round((((days % 29.530588853) + 29.530588853) % 29.530588853) / 29.530588853 * 8) % 8;
}

const CSS = `
  :host { display:block; --aw-height:120px; --aw-radius:10px; --aw-icon-size:42px; }
  * { box-sizing:border-box; }
  .card {
    position:relative; height:var(--aw-height); min-height:var(--aw-height); border-radius:var(--aw-radius); overflow:hidden; isolation:isolate;
    display:flex; align-items:center; gap:14px; padding:16px; color:var(--primary-text-color,#fff);
    background:var(--reflection-top, none), var(--av-card-bg, var(--aw-bg-default, rgba(255,255,255,.10)));
    border:1px solid var(--av-card-border, transparent);
    box-shadow:var(--shadow-glass, var(--ha-card-box-shadow, none));
    backdrop-filter:var(--av-card-blur, none); -webkit-backdrop-filter:var(--av-card-blur, none);
    font-family:var(--ha-font-family-body, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif);
  }
  .card.theme-dark { --aw-bg-default:#1a1a1f; color:#fff; }
  .card.theme-light { --aw-bg-default:rgba(0,0,0,.075); color:#172033; }
  /* On current view the sky overlay is dark — force light text in any theme so
     the condition/title/summary stay legible (esp. light theme + night sky). */
  .card.view-current { color:#f2f4fa; }
  .sky { position:absolute; inset:0; z-index:0; opacity:0; transition:opacity .35s ease; background:radial-gradient(ellipse at 78% -20%, rgba(255,236,170,.85), rgba(255,196,120,.35) 18%, transparent 38%), linear-gradient(110deg,#1e3a64,#2a4d7a 45%,#3a6ea0 70%,#6a8fb8); }
  .card.view-current .sky { opacity:.82; }
  .card.cond-night .sky, .card.is-night .sky { background:radial-gradient(ellipse at 74% 18%, rgba(170,205,255,.28), transparent 28%), linear-gradient(120deg,#07111f,#14233b 48%,#223a52); }
  /* Night sky is always dark regardless of HA theme — pin the text/dot colour
     source to white so light themes don't render dark-on-dark. */
  .card.cond-night, .card.is-night { --primary-text-color: #fff; }
  .card.cond-cloudy .sky, .card.cond-fog .sky { background:linear-gradient(120deg,#3a4a5b,#526679 48%,#6d8290); }
  .card.cond-rainy .sky, .card.cond-pouring .sky, .card.cond-lightning .sky { background:linear-gradient(120deg,#172337,#263b55 48%,#435d73); }
  .card.cond-snowy .sky { background:linear-gradient(120deg,#405468,#718a9c 52%,#c5d5df); }
  .card.cond-windy .sky { background:linear-gradient(110deg,#243854,#355c75 48%,#74a4aa); }
  .sun-orb { position:absolute; right:10%; top:-34%; width:170px; height:170px; border-radius:50%; z-index:1; opacity:0; pointer-events:none; background:radial-gradient(circle, rgba(255,247,194,.95) 0 18%, rgba(255,207,96,.46) 32%, transparent 58%); filter:blur(1px); animation:aw-sun 5s ease-in-out infinite; }
  .sun-orb::before { content:""; position:absolute; inset:-72px; border-radius:50%; background:repeating-conic-gradient(from 0deg, rgba(255,245,180,.34) 0deg 7deg, transparent 14deg 24deg); -webkit-mask:radial-gradient(circle, transparent 0 22%, rgba(0,0,0,.95) 28%, rgba(0,0,0,.42) 48%, transparent 72%); mask:radial-gradient(circle, transparent 0 22%, rgba(0,0,0,.95) 28%, rgba(0,0,0,.42) 48%, transparent 72%); filter:blur(6px); animation:aw-rays 18s linear infinite; }
  .card.view-current.cond-sunny:not(.is-night) .sun-orb, .card.view-current.cond-partly:not(.is-night) .sun-orb { opacity:.78; }
  .card.view-current.cond-partly:not(.is-night) .sun-orb::before { opacity:0; animation:none; }
  .weather-fx { position:absolute; inset:0; z-index:1; pointer-events:none; opacity:0; }
  .moon-art { position:absolute; z-index:1; pointer-events:none; opacity:0; object-fit:contain; filter:drop-shadow(0 14px 22px rgba(0,0,0,.22)); }
  /* Cloud is rendered as a masked silhouette so we can paint it any colour
     (filter:brightness() can only dim the PNG's existing pixels — it can't actually
     recolour to a stormy dark grey/blue). The cloud URL is passed in via inline
     --cloud-url; default background is the light off-white the original PNG used. */
  .cloud-art {
    position:absolute; z-index:1; pointer-events:none; opacity:0;
    background-color: #d9dce5;
    -webkit-mask: var(--cloud-url) center/contain no-repeat;
            mask: var(--cloud-url) center/contain no-repeat;
    filter: drop-shadow(0 14px 22px rgba(0,0,0,.22));
    transition: background-color .4s ease;
  }
  .cloud-art.one { width:130px; height:82px; right:18%; top:-8px; animation:aw-cloud-img-one 24s ease-in-out infinite alternate; }
  .cloud-art.two { width:96px; height:62px; right:-6px; bottom:8px; opacity:0; animation:aw-cloud-img-two 31s ease-in-out infinite alternate; }
  .card.view-current.cond-cloudy .cloud-art.one { width:176px; height:112px; right:10%; top:-20px; }
  .card.view-current.cond-cloudy .cloud-art.two { width:134px; height:86px; right:-18px; bottom:-4px; }
  .moon-art { width:118px; height:118px; right:8%; top:-24px; transform:rotate(-8deg); filter:drop-shadow(0 0 22px rgba(180,210,255,.38)) drop-shadow(0 12px 18px rgba(0,0,0,.34)); animation:aw-moon 7s ease-in-out infinite alternate; }
  .card.view-current.cond-partly .cloud-art, .card.view-current.cond-cloudy .cloud-art, .card.view-current.cond-rainy .cloud-art, .card.view-current.cond-pouring .cloud-art, .card.view-current.cond-snowy .cloud-art, .card.view-current.cond-lightning .cloud-art { opacity:.5; }
  .card.view-current.cond-cloudy .cloud-art, .card.view-current.cond-rainy .cloud-art, .card.view-current.cond-pouring .cloud-art, .card.view-current.cond-snowy .cloud-art { opacity:.68; }
  /* Darker cloud silhouettes for rain intensity — actual recolour via background-color
     (the mask preserves the cloud shape; the colour comes from us). */
  .card.view-current.cond-rainy .cloud-art { background-color: #7a8190; }
  .card.view-current.cond-pouring .cloud-art, .card.view-current.cond-lightning .cloud-art { background-color: #444b58; }
  .card.view-current.cond-exceptional .cloud-art { background-color: #232936; }
  .card.view-current.is-night .moon-art { opacity:.66; }
  .card.view-current.is-night.cond-cloudy .moon-art, .card.view-current.is-night.cond-rainy .moon-art, .card.view-current.is-night.cond-pouring .moon-art, .card.view-current.is-night.cond-snowy .moon-art { opacity:.34; }
  /* Rain — drop+stem+splat layered (per rain-lightning mockup). JS spawns drops only on rain conditions. */
  .rain { position:absolute; inset:0; overflow:hidden; pointer-events:none; opacity:0; transition:opacity .35s ease; z-index:1; }
  .rain.back { transform:scale(.85); transform-origin:bottom; }
  .card.view-current.cond-rainy .rain.front, .card.view-current.cond-pouring .rain.front, .card.view-current.cond-lightning .rain.front, .card.view-current.cond-exceptional .rain.front { opacity:1; }
  .card.view-current.cond-rainy .rain.back, .card.view-current.cond-pouring .rain.back, .card.view-current.cond-lightning .rain.back, .card.view-current.cond-exceptional .rain.back { opacity:.45; }
  .drop { position:absolute; bottom:100%; width:14px; height:70px; pointer-events:none; will-change:transform; animation:aw-drop var(--dur,.5s) linear var(--delay,0s) infinite; }
  .stem { width:1px; height:60%; margin-left:7px; background:linear-gradient(to bottom, rgba(255,255,255,0), rgba(200,220,240,.55)); animation:aw-stem var(--dur,.5s) linear var(--delay,0s) infinite; }
  .splat { width:12px; height:6px; margin-top:-2px; margin-left:1px; border-top:1.5px dotted rgba(200,220,240,.55); border-radius:50%; opacity:0; transform:scale(0); animation:aw-splat var(--dur,.5s) linear var(--delay,0s) infinite; }
  .card.cond-pouring .stem, .card.cond-lightning .stem, .card.cond-exceptional .stem { background:linear-gradient(to bottom, rgba(255,255,255,0), rgba(210,225,245,.75)); width:1.4px; margin-left:6.5px; }
  .fog { background:repeating-linear-gradient(0deg, transparent 0 15px, rgba(255,255,255,.16) 17px 24px, transparent 28px 46px); filter:blur(8px); animation:aw-fog 13s ease-in-out infinite; }
  .card.view-current.cond-fog .fog, .card.view-current.cond-windy .fog { opacity:.78; }
  .wind { display:none; overflow:hidden; }
  .gust { position:absolute; left:-34%; height:1px; border-radius:999px; background:linear-gradient(90deg, transparent, rgba(232,250,255,.68), transparent); filter:blur(.2px); animation:aw-gust 2.2s linear infinite; }
  .gust:nth-child(1) { top:30%; width:34%; animation-duration:1.85s; animation-delay:-.4s; opacity:.62; }
  .gust:nth-child(2) { top:48%; width:48%; animation-duration:2.35s; animation-delay:-1.2s; opacity:.48; }
  .gust:nth-child(3) { top:67%; width:28%; animation-duration:1.55s; animation-delay:-.9s; opacity:.54; }
  .card.view-current.cond-windy .wind { display:block; opacity:1; }
  .snow { display:none; }
  .flake { position:absolute; top:-12px; border-radius:50%; background:rgba(255,255,255,.86); box-shadow:0 0 8px rgba(255,255,255,.42); opacity:0; animation:aw-flake 9s linear infinite; }
  .flake:nth-child(1) { left:8%; width:2px; height:2px; animation-duration:7.5s; animation-delay:-1.2s; }
  .flake:nth-child(2) { left:18%; width:4px; height:4px; animation-duration:10.5s; animation-delay:-4.8s; opacity:.72; }
  .flake:nth-child(3) { left:31%; width:2.5px; height:2.5px; animation-duration:8.8s; animation-delay:-2.6s; }
  .flake:nth-child(4) { left:44%; width:5px; height:5px; animation-duration:12.2s; animation-delay:-7.3s; opacity:.58; }
  .flake:nth-child(5) { left:59%; width:3px; height:3px; animation-duration:9.4s; animation-delay:-5.1s; }
  .flake:nth-child(6) { left:72%; width:2px; height:2px; animation-duration:6.9s; animation-delay:-3.5s; opacity:.66; }
  .flake:nth-child(7) { left:84%; width:4.5px; height:4.5px; animation-duration:11.4s; animation-delay:-8.7s; }
  .flake:nth-child(8) { left:94%; width:2.5px; height:2.5px; animation-duration:8.1s; animation-delay:-6.2s; opacity:.62; }
  .card.view-current.cond-snowy .snow { display:block; opacity:1; }
  .card.view-current.cond-snowy .flake { opacity:.78; }
  .card.view-current.cond-hail .flake { width:4px; height:4px; opacity:.86; animation-duration:5.5s; box-shadow:0 0 8px rgba(210,235,255,.52); }
  /* Star field — individual twinkling dots populated by JS (per clear-night-card mockup) */
  .stars { display:none; }
  .card.view-current.is-night .stars, .card.view-current.cond-night .stars { display:block; opacity:1; }
  .star { position:absolute; width:2px; height:2px; background:#fff; border-radius:50%; opacity:.7; box-shadow:0 0 4px rgba(255,255,255,.6); animation:aw-twinkle var(--dur,3s) ease-in-out infinite; animation-delay:var(--delay,0s); will-change:opacity, transform; }
  .star.sm { width:1px; height:1px; box-shadow:none; opacity:.5; }
  .star.lg { width:2.5px; height:2.5px; }
  @keyframes aw-twinkle { 0%,100% { opacity:.15; transform:scale(.9); } 50% { opacity:.9; transform:scale(1.1); } }
  /* Lightning — flash overlay + real bolt photos (screen-blended). JS scheduler triggers strikes at random intervals. */
  .flash { position:absolute; inset:0; background:#dde6ff; opacity:0; pointer-events:none; mix-blend-mode:screen; z-index:2; display:none; }
  .bolt { position:absolute; top:-8px; height:128px; width:auto; pointer-events:none; opacity:0; filter:brightness(1.15) contrast(1.1) drop-shadow(0 0 8px #aac4ff) drop-shadow(0 0 18px rgba(140,170,255,.6)); user-select:none; mix-blend-mode:screen; z-index:2; display:none; }
  /* .bolt.line + .bolt.branch — position (left/transform) is set per strike by JS for random
     placement, so no fixed left here. Lightning-only conditions show just the line bolt;
     thunderstorms (cond-lightning + cond-rainy) and severe weather show both. */
  .card.view-current.cond-lightning .flash, .card.view-current.cond-lightning .bolt.line { display:block; }
  .card.view-current.cond-lightning.cond-rainy .bolt.branch { display:block; }
  .card.view-current.cond-exceptional .flash, .card.view-current.cond-exceptional .bolt { display:block; }
  @keyframes aw-sun { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(7px) scale(1.04); } }
  @keyframes aw-rays { to { transform:rotate(360deg); } }
  @keyframes aw-cloud-img-one { from { transform:translateX(-14px) translateY(0); } to { transform:translateX(20px) translateY(5px); } }
  @keyframes aw-cloud-img-two { from { transform:translateX(18px) translateY(3px); } to { transform:translateX(-16px) translateY(-3px); } }
  @keyframes aw-moon { from { transform:translateY(0) rotate(-8deg); } to { transform:translateY(5px) rotate(-5deg); } }
  @keyframes aw-drop { 0% { transform:translateY(0); } 75%,100% { transform:translateY(120px); } }
  @keyframes aw-stem { 0%,65% { opacity:1; } 75%,100% { opacity:0; } }
  @keyframes aw-splat { 0%,80% { opacity:0; transform:scale(0); } 90% { opacity:.7; transform:scale(1); } 100% { opacity:0; transform:scale(1.4); } }
  @keyframes aw-fog { 0%,100% { transform:translateX(-18px); } 50% { transform:translateX(18px); } }
  @keyframes aw-gust { from { transform:translateX(0); } to { transform:translateX(420%); } }
  @keyframes aw-flake { 0% { transform:translate3d(0,-18px,0); } 50% { transform:translate3d(14px,62px,0); } 100% { transform:translate3d(-8px,142px,0); } }
  @keyframes aw-stars { 0%,100% { filter:brightness(.78); } 45% { filter:brightness(1.35); } 75% { filter:brightness(.95); } }
  /* Lightning keyframes — verbatim from the rain-lightning mockup. Flash happens at 88-95%
     of each cycle; the cleanup timer in the scheduler clears style.animation after duration
     so the next strike's reassignment actually triggers (re-assigning the SAME string is a
     no-op per spec, so without the cleanup only the first strike would fire). */
  @keyframes aw-flashSoft { 0%,88%,100% { opacity:0; } 89% { opacity:.55; } 90% { opacity:.05; } 91% { opacity:.7; } 93% { opacity:.15; } 95% { opacity:0; } }
  @keyframes aw-flashHard { 0%,70%,100% { opacity:0; } 71% { opacity:.85; } 72% { opacity:.2; } 73% { opacity:.95; } 75% { opacity:.3; } 77% { opacity:0; } 88% { opacity:.6; } 89% { opacity:.1; } 91% { opacity:0; } }
  @keyframes aw-boltSoft { 0%,87%,100% { opacity:0; } 88% { opacity:.95; } 89% { opacity:.15; } 90% { opacity:1; } 92% { opacity:.25; } 94% { opacity:.8; } 96% { opacity:0; } }
  @keyframes aw-boltHard { 0%,68%,100% { opacity:0; } 69% { opacity:1; } 70% { opacity:.2; } 71% { opacity:1; } 73% { opacity:.4; } 75% { opacity:0; } 85% { opacity:.85; } 86% { opacity:.1; } 87% { opacity:0; } }
  .corner-glow { position:absolute; width:92px; height:92px; right:-30px; bottom:-34px; border-radius:50%; z-index:1; pointer-events:none; background:conic-gradient(from 140deg, #22c55e, #06b6d4, var(--aw-glow,#ff8a4c), #22c55e); filter:blur(20px); opacity:.42; }
  .warn-flash { position:absolute; inset:0; z-index:5; pointer-events:none; border-radius:inherit; opacity:0; box-shadow: inset 0 0 0 2px rgba(239,68,68,.95), inset 0 0 42px rgba(239,68,68,.5); }
  .card.cond-exceptional .warn-flash { animation: aw-warn 1.1s ease-in-out infinite; }
  @keyframes aw-warn { 0%, 100% { opacity:.2; } 50% { opacity:1; } }
  .pill { position:relative; z-index:2; flex:0 0 auto; width:var(--aw-icon-size); height:var(--aw-icon-size); border-radius:15px; display:grid; place-items:center; cursor:pointer; background:radial-gradient(circle at 35% 25%, color-mix(in srgb, var(--aw-accent,#6f7bff) 62%, #fff), color-mix(in srgb, var(--aw-accent,#6f7bff) 74%, #111) 72%); border:1px solid transparent; box-shadow:inset 0 1px 0 rgba(255,255,255,.22), inset 0 0 0 1px rgba(255,255,255,.08), 0 0 24px -9px var(--aw-accent,#6f7bff); overflow:visible; }
  .pill::before { content:""; position:absolute; inset:-7px; z-index:-1; border-radius:20px; background:conic-gradient(from 150deg, #22c55e, #06b6d4, var(--aw-glow,#ff8a4c), #22c55e); filter:blur(14px); opacity:.68; }
  .pill ha-icon { --mdc-icon-size:calc(var(--aw-icon-size) * .52); color:var(--primary-text-color,#fff); }
  /* Standard Avery pagination dot — matches nest/light/tv cards. */
  .dots { position:absolute; bottom:-14px; left:50%; transform:translateX(-50%); display:flex; gap:4px; align-items:center; }
  .dots span { width:5px; height:5px; border-radius:50%; background:var(--primary-text-color, #fff); opacity:.28; transition:opacity .2s; }
  .dots span.on { opacity:.95; }
  .stage { position:relative; z-index:2; flex:1 1 auto; min-width:0; height:100%; display:flex; align-items:center; }
  .card.demo-mode.view-current .stage { cursor:pointer; }
  .current { width:100%; min-width:0; display:grid; grid-template-columns:minmax(0,1fr) minmax(74px,max-content); gap:12px; align-items:center; }
  .current-main { min-width:0; }
  .current-metrics { min-width:74px; text-align:right; justify-self:end; }
  .label { font-size:15px; font-weight:800; letter-spacing:0; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
  .sub { font-size:12px; line-height:1.25; color:color-mix(in srgb, var(--primary-text-color, #fff) 74%, rgba(0,0,0,0)); margin-top:2px; overflow-wrap:anywhere; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
  .temp { font-size:clamp(22px, 7.4vw, 28px); font-weight:700; letter-spacing:0; white-space:nowrap; }
  .hum { display:flex; align-items:center; gap:4px; justify-content:flex-end; font-size:12px; color:color-mix(in srgb, var(--primary-text-color, #fff) 86%, rgba(0,0,0,0)); margin-top:4px; }
  .hum ha-icon { --mdc-icon-size:13px; color:#6ec6ff; }
  .forecast-row { width:100%; display:grid; grid-template-columns:repeat(var(--aw-count,5), minmax(0,1fr)); gap:8px; align-items:center; justify-items:center; align-content:center; }
  .col { display:flex; flex-direction:column; align-items:center; gap:4px; min-width:0; font-size:12px; color:color-mix(in srgb, var(--primary-text-color, #fff) 84%, rgba(0,0,0,0)); }
  .day { min-height:20px; display:inline-flex; align-items:center; justify-content:center; font-size:12px; color:color-mix(in srgb, var(--primary-text-color, #fff) 70%, rgba(0,0,0,0)); font-weight:700; }
  .day.active { background:#2563eb; color:#fff; padding:0 10px; border-radius:999px; }
  .weather-wrap { position:relative; display:grid; place-items:center; width:32px; height:30px; margin-top:2px; }
  .weather-icon { --mdc-icon-size:28px; color:currentColor; filter:drop-shadow(0 3px 5px rgba(0,0,0,.22)); }
  .precip-badge { position:absolute; right:-10px; bottom:-3px; min-width:18px; height:14px; padding:0 5px; border-radius:999px; display:grid; place-items:center; background:#2563eb; color:#fff; font-size:9px; line-height:1; font-weight:800; box-shadow:0 3px 8px rgba(0,0,0,.22), inset 0 1px 0 rgba(255,255,255,.20); }
  .t { color:currentColor; font-size:12px; font-weight:500; line-height:1.15; white-space:nowrap; text-align:center; letter-spacing:0; }
  .empty { font-size:13px; color:color-mix(in srgb, var(--primary-text-color, #fff) 68%, rgba(0,0,0,0)); font-weight:700; }
`;

const DEMO_CONDITIONS = ['sunny', 'clear-night', 'partlycloudy', 'cloudy', 'fog', 'rainy', 'pouring', 'lightning', 'lightning-rainy', 'snowy', 'snowy-rainy', 'hail', 'windy', 'windy-variant', 'exceptional'];

class AveryWeatherCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode:'open' }); this._config={...DEFAULT_CONFIG}; this._view=0; this._forecasts={hourly:[], daily:[]}; }
  static getConfigElement() { return document.createElement('avery-weather-card-editor'); }
  setConfig(config) {
    const prevEntity = this._config?.entity;
    // Legacy migration: old configs stored `demo_mode: true/false` + a separate
    // `demo_night: true/false`. Collapse to a single 'none' | 'day' | 'night'.
    const rawDemo = config?.demo_mode;
    let demoMode = 'none';
    if (typeof rawDemo === 'string' && ['day', 'night'].includes(rawDemo.toLowerCase())) {
      demoMode = rawDemo.toLowerCase();
    } else if (rawDemo === true) {
      demoMode = config?.demo_night ? 'night' : 'day';
    }
    this._config = { ...DEFAULT_CONFIG, ...(config || {}), height: clamp(num(config?.height) || DEFAULT_CONFIG.height, 72, 260), corner_radius: clamp(num(config?.corner_radius) ?? DEFAULT_CONFIG.corner_radius, 0, 48), icon_size: clamp(num(config?.icon_size) || DEFAULT_CONFIG.icon_size, 36, 72), hourly_count: clamp(parseInt(config?.hourly_count,10) || DEFAULT_CONFIG.hourly_count, 3, 8), daily_count: clamp(parseInt(config?.daily_count,10) || DEFAULT_CONFIG.daily_count, 3, 8), cycle_seconds: clamp(num(config?.cycle_seconds) || DEFAULT_CONFIG.cycle_seconds, 3, 60), auto_cycle: !!config?.auto_cycle, show_dots: config?.show_dots !== false, demo_mode: demoMode };
    // demo_night is no longer part of the schema — drop it explicitly so it
    // doesn't sit around in this._config from the spread above.
    delete this._config.demo_night;
    if (this._config.entity !== prevEntity) {
      this._forecasts = { hourly:[], daily:[] };
      this._lastFcSig = null;
      this._forecastTimerStarted = false;
    }
    this._lastSig = null;
    this._startForecastTimerIfNeeded();
    this._render();
    this._setupCycle();
  }
  set hass(hass) {
    this._hass = hass;
    this._startForecastTimerIfNeeded();
    const sig = this._signature();
    if (sig === this._lastSig) return;
    this._render();
  }
  disconnectedCallback() {
    clearInterval(this._cycleTimer);
    clearInterval(this._forecastTimer);
    this._forecastTimerStarted = false;
    if (this._lightTimers) this._lightTimers.forEach(clearTimeout);
    this._lightTimers = [];
  }
  getCardSize() { return 2; }
  _state() { return this._hass?.states?.[this._config.entity]; }
  _unit() { return this._state()?.attributes?.temperature_unit || this._hass?.config?.unit_system?.temperature || '°C'; }
  _signature() {
    const s = this._state();
    const a = s?.attributes || {};
    return [this._config?.entity, s?.state, a.temperature, a.humidity, a.temperature_unit, a.friendly_name, this._view, this._demoWeather || '', this._config?.demo_mode || 'none', this._isCurrentlyNight() ? 'rn' : 'rd'].join('|');
  }
  _forecastSignature() {
    const h = this._forecasts.hourly?.[0] || {};
    const d = this._forecasts.daily?.[0] || {};
    return [h.datetime || h.date, h.temperature, h.condition, h.precipitation, h.precipitation_probability, d.datetime || d.date, d.temperature, d.templow, d.condition, (this._forecasts.hourly||[]).length, (this._forecasts.daily||[]).length].join('|');
  }
  _startForecastTimerIfNeeded() {
    if (this._forecastTimerStarted || !this._hass?.connection || !this._config?.entity) return;
    this._forecastTimerStarted = true;
    this._fetchForecasts();
    clearInterval(this._forecastTimer);
    this._forecastTimer = setInterval(() => this._fetchForecasts(), 600000);
  }
  async _fetchForecasts() {
    if (!this._hass?.connection || !this._config.entity || this._fetching === this._config.entity) return;
    this._fetching = this._config.entity;
    try {
      for (const type of ['hourly','daily']) {
        const res = await this._hass.connection.sendMessagePromise({ type:'call_service', domain:'weather', service:'get_forecasts', service_data:{ type }, target:{ entity_id:this._config.entity }, return_response:true });
        this._forecasts[type] = res?.response?.[this._config.entity]?.forecast || res?.service_response?.[this._config.entity]?.forecast || [];
      }
    } catch (err) { console.warn('avery-weather-card forecast fetch failed', err); }
    this._fetching = '';
    const fcSig = this._forecastSignature();
    if (fcSig !== this._lastFcSig) {
      this._lastFcSig = fcSig;
      this._lastSig = null;
      this._render();
    }
  }
  _setupCycle() {
    clearInterval(this._cycleTimer);
    if (this._config.auto_cycle) this._cycleTimer = setInterval(() => { this._view = (this._view + 1) % 3; this._render(); }, this._config.cycle_seconds * 1000);
  }
  _setView(view) { this._view = view; this._render(); }
  _isDemo() {
    const m = this._config?.demo_mode;
    return m === 'day' || m === 'night';
  }
  _isCurrentlyNight() {
    // Real day/night detection used both for the actual sky (when demo_mode
    // is 'none') and the signature so renders pick up sunrise/sunset.
    const sun = this._hass?.states?.['sun.sun'];
    if (sun?.state === 'above_horizon') return false;
    if (sun?.state === 'below_horizon') return true;
    // No sun.sun entity — fall back to local clock.
    const h = new Date().getHours();
    return h < 6 || h >= 18;
  }
  _demoCondition(realCondition) { return this._isDemo() && this._view === 0 ? (this._demoWeather || realCondition || DEMO_CONDITIONS[0]) : realCondition; }
  _cycleDemoCondition() {
    const current = this._demoWeather || this._state()?.state || DEMO_CONDITIONS[0];
    const next = DEMO_CONDITIONS[(DEMO_CONDITIONS.indexOf(current) + 1) % DEMO_CONDITIONS.length] || DEMO_CONDITIONS[0];
    this._demoWeather = next;
    this._render();
  }

  _daySummary() {
    const daily = this._forecasts.daily || [];
    const hourly = this._forecasts.hourly || [];
    const today = daily[0] || {};
    const high = num(today.temperature);
    const low = num(today.templow ?? today.low_temperature ?? today.temperature_low);
    const temps = high !== null && low !== null ? `High ${tempText(high, this._unit(), 0, false)}, low ${tempText(low, this._unit(), 0, false)}` : '';
    const rain = hourly
      .map(item => ({ item, amount: num(item.precipitation) || 0, probability: num(item.precipitation_probability) || 0 }))
      .filter(entry => entry.amount > 0 || entry.probability >= 40)
      .sort((a, b) => (b.amount || b.probability) - (a.amount || a.probability))[0];
    if (!rain) return temps ? `${temps}. No rain expected` : 'No rain expected';
    const when = hourText(rain.item.datetime || rain.item.date || rain.item.datetime_utc);
    const intensity = rain.amount >= 4 || rain.probability >= 70 ? 'Heavy rain' : 'Light rain';
    return `${temps ? `${temps}. ` : ''}${intensity} around ${when}`;
  }

  _currentHtml(state, condition, isNight = false) {
    if (!state) return '<div class="empty">Weather entity not found</div>';
    const a = state.attributes || {};
    const title = this._config.current_title || conditionTitle(condition || state.state, isNight);
    const summary = this._daySummary() || this._config.name || a.friendly_name || state.entity_id;
    return `<div class="current"><div class="current-main"><div class="label">${escapeHtml(title)}</div><div class="sub">${escapeHtml(summary)}</div></div><div class="current-metrics"><div class="temp">${escapeHtml(tempText(a.temperature, a.temperature_unit || this._unit(), 1))}</div><div class="hum"><ha-icon icon="mdi:water"></ha-icon>${escapeHtml(a.humidity ?? '--')}%</div></div></div>`;
  }
  _forecastHtml(type) {
    const list = (this._forecasts[type] || []).slice(0, type === 'hourly' ? this._config.hourly_count : this._config.daily_count);
    if (!list.length) return '<div class="empty">Forecast loading...</div>';
    const unit = this._unit();
    return `<div class="forecast-row" style="--aw-count:${list.length}">${list.map((item, index) => {
      const when = item.datetime || item.date || item.datetime_utc;
      const label = type === 'hourly' ? (index === 0 ? dayName(when) : hourText(when)) : dayName(when);
      const temp = type === 'hourly' ? tempText(item.temperature, unit, 0, false) : `${tempText(item.temperature, unit, 0, false)}/${tempText(item.templow ?? item.low_temperature ?? item.temperature_low, unit, 0, false)}`;
      const hasPrecipProbability = item.precipitation_probability !== undefined && item.precipitation_probability !== null && item.precipitation_probability !== '';
      const precip = hasPrecipProbability ? item.precipitation_probability : item.precipitation;
      const precipBadge = precip ? `<span class="precip-badge">${escapeHtml(hasPrecipProbability ? `${precip}%` : precip)}</span>` : '';
      return `<div class="col"><span class="day ${index === 0 ? 'active' : ''}">${escapeHtml(label)}</span><span class="weather-wrap"><ha-icon class="weather-icon" icon="${weatherIcon(item.condition)}"></ha-icon>${precipBadge}</span><span class="t">${escapeHtml(temp)}</span></div>`;
    }).join('')}</div>`;
  }
  _render() {
    if (!this.shadowRoot) return;
    const cfg = this._config; const state = this._state();
    const condition = this._demoCondition(state?.state);
    // Night sky logic (only for view 0 / current weather):
    //   - demo_mode 'day'  → force day, even if condition is `clear-night`.
    //   - demo_mode 'night'→ force night.
    //   - demo_mode 'none' → use sun.sun (or local clock fallback) so the
    //                       actual weather card flips at sunrise/sunset, plus
    //                       always-night for the explicit `clear-night` cond.
    const isDemo = this._isDemo();
    const isNight = this._view === 0 && (
      isDemo
        ? cfg.demo_mode === 'night'
        : (isNightCondition(condition) || this._isCurrentlyNight())
    );
    const content = this._view === 0 ? this._currentHtml(state, condition, isNight) : this._view === 1 ? this._forecastHtml('hourly') : this._forecastHtml('daily');
    const pillIcon = this._view === 0 ? weatherIconFor(condition, isNight) : viewIcon(this._view);
    const moonUrl = `${cfg.moon_icon_path || DEFAULT_CONFIG.moon_icon_path}/${moonPhaseIndex()}.png`;
    const cloudOne = `${cfg.icon_path || DEFAULT_CONFIG.icon_path}/${iconCode('cloudy')}.png`;
    const cloudTwo = `${cfg.icon_path || DEFAULT_CONFIG.icon_path}/26.png`;
    this.shadowRoot.innerHTML = `<style>${CSS}</style><div class="card ${themeClass(cfg.theme)} ${conditionClass(condition)} ${isNight?'is-night':''} ${this._view===0?'view-current':''} ${isDemo?'demo-mode':''}" style="--aw-height:${cfg.height}px;--aw-radius:${cfg.corner_radius}px;--aw-icon-size:${cfg.icon_size}px;--aw-accent:${escapeHtml(cfg.accent_color)};--aw-glow:${escapeHtml(cfg.glow_color)};${cfg.background ? `--aw-bg:${escapeHtml(cfg.background)};` : ''}"><div class="sky"></div><div class="sun-orb"></div><img class="moon-art" src="${escapeHtml(moonUrl)}" alt=""><span class="cloud-art one" style="--cloud-url:url('${escapeHtml(cloudOne)}')"></span><span class="cloud-art two" style="--cloud-url:url('${escapeHtml(cloudTwo)}')"></span><div class="rain back"></div><div class="rain front"></div><div class="weather-fx fog"></div><div class="weather-fx wind"><span class="gust"></span><span class="gust"></span><span class="gust"></span></div><div class="weather-fx snow"><span class="flake"></span><span class="flake"></span><span class="flake"></span><span class="flake"></span><span class="flake"></span><span class="flake"></span><span class="flake"></span><span class="flake"></span></div><div class="weather-fx stars"></div><img class="bolt line" src="/local/weather-fx/bolt-1.png" alt=""><img class="bolt branch" src="/local/weather-fx/bolt-2.png" alt=""><div class="flash"></div><div class="corner-glow"></div><div class="warn-flash"></div><div class="pill" role="button" title="Cycle weather view"><ha-icon icon="${pillIcon}"></ha-icon>${cfg.show_dots ? `<div class="dots"><span class="${this._view===0?'on':''}"></span><span class="${this._view===1?'on':''}"></span><span class="${this._view===2?'on':''}"></span></div>` : ''}</div><div class="stage">${content}</div></div>`;
    // Pill cycles the three views (current → hourly → daily).
    this.shadowRoot.querySelector('.pill')?.addEventListener('click', e => {
      e.stopPropagation();
      this._setView((this._view + 1) % 3);
    });
    // In demo mode, a click anywhere on the card (other than the pill) cycles
    // through demo conditions. If the user isn't on the current-weather view
    // yet, switch them there first so the condition change is visible.
    this.shadowRoot.querySelector('.card')?.addEventListener('click', e => {
      if (!isDemo) return;
      if (e.target.closest('.pill')) return;
      if (this._view !== 0) { this._setView(0); return; }
      this._cycleDemoCondition();
    });
    // Populate the night sky with twinkling stars (only when visible).
    if (isNight) {
      const starsEl = this.shadowRoot.querySelector('.stars');
      if (starsEl) {
        const frag = document.createDocumentFragment();
        for (let i = 0; i < 55; i++) {
          const s = document.createElement('div');
          const r = Math.random();
          s.className = 'star' + (r < 0.4 ? ' sm' : r > 0.9 ? ' lg' : '');
          const x = Math.random() * 100, y = Math.random() * 100;
          s.style.left = x + '%';
          s.style.top = y + '%';
          s.style.setProperty('--dur', (2 + Math.random() * 4).toFixed(2) + 's');
          s.style.setProperty('--delay', (Math.random() * 5).toFixed(2) + 's');
          if (x > 62 && y < 75) s.style.opacity = '0.12';   // dim stars overlapping the moon
          frag.appendChild(s);
        }
        starsEl.appendChild(frag);
      }
    }

    // Rain + lightning — cleanup any in-flight strikes from a previous render (DOM is replaced),
    // then populate drops and start the scheduler only when the current view shows them.
    if (this._lightTimers) this._lightTimers.forEach(clearTimeout);
    this._lightTimers = [];
    if (this._view === 0) {
      const card = this.shadowRoot.querySelector('.card');
      const isExceptional = card?.classList.contains('cond-exceptional');
      const isLightning = card?.classList.contains('cond-lightning');
      const isPouring = card?.classList.contains('cond-pouring');
      const isRainy = card?.classList.contains('cond-rainy');
      if (isRainy || isPouring || isLightning || isExceptional) {
        const heavy = isExceptional || isLightning || isPouring;
        const severe = isExceptional;
        const backN = severe ? 70 : heavy ? 55 : 20;
        const frontN = severe ? 100 : heavy ? 80 : 30;
        const range = severe ? [0.28, 0.40] : heavy ? [0.35, 0.50] : [0.50, 0.70];
        this._fillRain(this.shadowRoot.querySelector('.rain.back'), backN, range);
        this._fillRain(this.shadowRoot.querySelector('.rain.front'), frontN, range);
      }
      if (isLightning || isExceptional) this._scheduleLightning();
    }
    this._lastSig = this._signature();
  }

  // Spawn N drops (each with stem + splat) with random horizontal position and a duration
  // picked from the intensity range. Set as CSS vars so the keyframes pick them up.
  _fillRain(layer, count, [minDur, maxDur]) {
    if (!layer) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const drop = document.createElement('div');
      drop.className = 'drop';
      const left = (Math.random() * 100).toFixed(2);
      const bottom = (100 + Math.random() * 30).toFixed(1);
      const delay = (Math.random() * 0.5).toFixed(3);
      const dur = (minDur + Math.random() * (maxDur - minDur)).toFixed(3);
      drop.style.cssText = `left:${left}%;bottom:${bottom}%;--delay:${delay}s;--dur:${dur}s`;
      drop.innerHTML = '<div class="stem"></div><div class="splat"></div>';
      frag.appendChild(drop);
    }
    layer.appendChild(frag);
  }

  // Random lightning scheduler (per rain-lightning mockup). Each strike triggers a flash +
  // bolt animation once, then schedules the next at a random delay. All timers are tracked
  // so they can be cleared on _render / disconnect — preventing leaks and stale callbacks.
  _scheduleLightning() {
    // Spec: first strike in 0-10s; subsequent strikes 40-90s apart. Each strike picks a
    // random bolt from the available pool (lightning-only = [line]; thunderstorms /
    // severe = [line, branch]), places it at a random x and flips it 50/50, then fires
    // the mockup-verbatim flash + bolt animations. A cleanup timer clears style.animation
    // afterwards so the next strike's reassignment is not a no-op.
    const card = this.shadowRoot.querySelector('.card');
    if (!card) return;
    const isExceptional = card.classList.contains('cond-exceptional');
    const isLightning   = card.classList.contains('cond-lightning');
    const isRainy       = card.classList.contains('cond-rainy');
    const types = isExceptional ? ['line', 'branch']
                : (isLightning && isRainy) ? ['line', 'branch']
                : isLightning ? ['line']
                : [];
    if (!types.length) return;
    const hard = isExceptional;
    const flashAnim = hard ? 'aw-flashHard 3.8s 1' : 'aw-flashSoft 6.5s 1';
    const boltAnim  = hard ? 'aw-boltHard 3.8s 1'  : 'aw-boltSoft 6.5s 1';
    const duration  = hard ? 3800 : 6500;
    const flash = this.shadowRoot.querySelector('.flash');
    const strike = () => {
      if (!this.shadowRoot || !this.shadowRoot.contains(flash)) return;
      const type = types[Math.floor(Math.random() * types.length)];
      const bolt = this.shadowRoot.querySelector('.bolt.' + type);
      if (bolt) {
        bolt.style.left = (20 + Math.random() * 60).toFixed(1) + '%';
        bolt.style.transform = 'translateX(-50%)' + (Math.random() < 0.5 ? '' : ' scaleX(-1)');
        bolt.style.animation = boltAnim;
      }
      if (flash) flash.style.animation = flashAnim;
      // Cleanup so the next strike's identical reassignment actually retriggers the animation.
      const t2 = setTimeout(() => {
        if (bolt)  bolt.style.animation = '';
        if (flash) flash.style.animation = '';
      }, duration);
      this._lightTimers.push(t2);
      // Schedule next: 40-90s after this strike's start.
      const nextDelay = 40000 + Math.random() * 50000;
      this._lightTimers.push(setTimeout(strike, nextDelay));
    };
    // First strike at a random point in the first 10s.
    this._lightTimers.push(setTimeout(strike, Math.random() * 10000));
  }
}

class AveryWeatherCardEditor extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode:'open' }); this._config={...DEFAULT_CONFIG}; }
  set hass(hass) { this._hass=hass; this.shadowRoot.querySelectorAll('ha-entity-picker').forEach(p=>p.hass=hass); }
  setConfig(config) { this._config={...DEFAULT_CONFIG,...(config||{})}; if (!this._rendered) this._render(); }
  _render() {
    const c=this._config;
    this.shadowRoot.innerHTML = `<style>${AV_EDITOR_CSS}</style>
      ${section('Weather',
        row('Weather entity', entityPicker('entity', 'weather')) +
        row('Name override', textField('name', c)) +
        row('Current title', textField('current_title', c, 'Override the condition label')) +
        themeRow(c)
      )}
      ${section('Forecast',
        row('Hourly count', numberField('hourly_count', c, { min: 3, max: 8 })) +
        row('Daily count', numberField('daily_count', c, { min: 3, max: 8 })) +
        row('Show pagination dots', checkboxField('show_dots', c, true)) +
        row('Auto cycle views', checkboxField('auto_cycle', c, false)) +
        row('Cycle seconds', numberField('cycle_seconds', c, { min: 3, max: 60 }))
      )}
      ${section('Demo',
        row('Select demo mode', `<select data-field="demo_mode">
          <option value="none" ${(c.demo_mode || 'none') === 'none' ? 'selected' : ''}>None</option>
          <option value="day" ${c.demo_mode === 'day' ? 'selected' : ''}>Day</option>
          <option value="night" ${c.demo_mode === 'night' ? 'selected' : ''}>Night</option>
        </select>`)
      )}
      ${section('Colours',
        row('Accent', colorField('accent_color', c, '#6f7bff')) +
        row('Glow', colorField('glow_color', c, '#ff8a4c')) +
        row('Background', textField('background', c, 'CSS background (optional)'))
      )}
      ${section('Dimensions',
        row('Height (px)', numberField('height', c, { min: 72, max: 260, placeholder: '120' })) +
        row('Corner radius', numberField('corner_radius', c, { min: 0, max: 48, placeholder: '10' })) +
        row('Icon size', numberField('icon_size', c, { min: 36, max: 72, placeholder: '42' }))
      )}
    `;
    bindEditor(this.shadowRoot, {
      hass: this._hass,
      cfg: c,
      update: (f, v) => { this._config = { ...this._config, [f]: v }; this._fire(); },
      rerender: null,
    });
    this._rendered=true;
  }
  _fire(){ clearTimeout(this._timer); this._timer=setTimeout(()=>this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{...DEFAULT_CONFIG,...this._config}},bubbles:true,composed:true})),180); }
}
customElements.define('avery-weather-card', AveryWeatherCard);
customElements.define('avery-weather-card-editor', AveryWeatherCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({ preview: false, type:'avery-weather-card', name:'Avery Weather Card', description:'Avery weather card with current, hourly and weekly views' });
