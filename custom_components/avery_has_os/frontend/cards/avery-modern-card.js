const DEFAULT_CONFIG = {
  type: 'custom:avery-modern-card',
  // Variant set after the unification pass:
  //   generic  — the single-/dual-entity workhorse (replaces wide/status/hero/old-generic)
  //   square   — the square tile (renamed from `tile`)
  //   security, doors, lights, waste, presence — aggregated overviews
  //   title-room (formerly `room`), nav — special-purpose
  variant: 'generic',

  // === title-room typography + colour ===
  //   color_mode: 'theme'   → use --am-text (theme-driven default)
  //               'static'  → flat user-picked colour (title_color)
  //               'random'  → fresh random 3-stop gradient per card mount
  //               'dynamic' → user-picked 3-stop gradient with moving animation
  title_font_family: '',                 // empty = inherit card font
  title_font_size: '',                   // empty = clamp(46px, 7vw, 92px); otherwise raw CSS length
  title_color_mode: 'theme',
  title_color: '#ffffff',                // static-mode flat colour
  title_gradient_1: '#a78bfa',
  title_gradient_2: '#60a5fa',
  title_gradient_3: '#22d3ee',
  title_animation_seconds: 8,            // dynamic-mode loop length
  name: '',
  icon: '',
  theme: 'dashboard',
  demo: false,
  show_state: true,
  show_icon: true,
  show_entity_picture: false,

  // === Primary entity (drives icon/name fallbacks + the left-side readout) ===
  primary_entity: '',
  // "Prefix + attribute" — rendered as "<prefix> <value>" on the primary line.
  // attribute may be: '' (none), 'state' (entity state), an attribute key, or
  // a sibling-device entity id (e.g. "sensor.foo_battery").
  primary_prefix: '',
  primary_attribute: '',
  // Render the primary line as a coloured pill. Border / fill / fill opacity
  // / corner radius each have their own override; otherwise inherit the card
  // accent and use a `999px` "always-round" default.
  primary_pill: false,
  primary_pill_border: '',
  primary_pill_fill: '',
  primary_pill_opacity: '',  // 0–100; blank = 18% default.
  primary_pill_radius: '',   // px; blank = 999 (fully rounded).
  // Optional second line under the primary readout.
  primary_descriptor_prefix: '',
  primary_descriptor_attribute: '',

  // === Secondary entity (right-side panel; only rendered when set) ===
  // When `secondary_use_primary` is true, the secondary side reads from the
  // primary entity instead — useful for showing two attributes of the same
  // device (e.g. state on the left, battery on the right).
  secondary_use_primary: false,
  secondary_entity: '',
  secondary_prefix: '',
  secondary_attribute: '',
  secondary_descriptor_prefix: '',
  secondary_descriptor_attribute: '',
  show_divider: true,

  // Badge
  show_badge: false,
  badge_text: '',
  badge_entity: '',
  badge_attribute: '',

  // Aggregations / specials
  door_entity: '',
  door_battery_entity: '',
  door_entities: 'binary_sensor.front_door_contact,binary_sensor.living_room_sliding_door_contact,binary_sensor.utility_garden_door_contact,binary_sensor.kitchen_patio_door_contact,binary_sensor.garage_door_contact,binary_sensor.gym_room_door_contact',
  door_battery_entities: 'sensor.front_door_battery,sensor.living_room_sliding_door_battery,sensor.utility_garden_door_battery,sensor.kitchen_patio_door_battery,sensor.garage_door_battery,sensor.gym_room_door_battery',
  light_entities: 'light.kitchen_chandalier,light.utility_light,light.k2,light.k3,light.k4,light.k5,light.porch_lamp,light.living_room_wall_lights,light.tv_backlight,light.nl1,light.nl2_1,light.nl3,light.nl4,light.stairway_led_lights,light.stairway_wall_1,light.stairway_wall_2,light.stairway_wall_3',
  security_entity: '',
  security_armed_icon: 'mdi:shield-lock',
  security_disarmed_icon: 'mdi:lock-open-variant',
  room_temperature_entity: '',
  room_humidity_entity: '',
  waste_entities: 'sensor.household_waste,sensor.recycling,sensor.garden_waste',
  presence_entities: 'person.vijaysinh_patil,person.rajshri,person.aniya',
  presence_icon_size: 46,

  // Look + feel
  background_image: '',
  background_color: '',
  accent_color: '',
  glow_color_1: '',
  glow_color_2: '',
  glow_color_3: '',
  height: '',
  corner_radius: 10,
  lean: false,
  active: false,
  hide_glow: false,
  tap_action: 'more-info',
  navigation_path: '',

  // Legacy fields kept so config-loads from old storage don't error.
  // setConfig migrates them onto the primary_* fields above.
  entity: '',
  subtitle: '',
  subtitle_attribute: '',
  descriptor: '',
  descriptor_attribute: '',
  secondary_label: '',
  square: false,
};

// Shared by both the card runtime and the editor: maps legacy variants /
// fields onto the unified shape. Without this in the editor, a stored
// `variant: 'wide'` would render as 'generic' in the dropdown (since 'wide'
// isn't an option, the first option wins) while `cfg.variant` stayed literally
// 'wide' — making every section guard `showIn(['generic', ...])` evaluate
// false and hiding Primary/Secondary/Display. Run it in both setConfig paths.
function migrateLegacyConfig(config) {
  const merged = { ...DEFAULT_CONFIG, ...(config || {}) };
  const variantMigrations = {
    lean: 'generic',
    wide: 'generic',
    status: 'generic',
    hero: 'generic',
    tile: 'square',
    room: 'title-room',
  };
  if (merged.variant === 'lean') merged.lean = true;
  if (variantMigrations[merged.variant]) {
    merged.variant = variantMigrations[merged.variant];
  }
  // Field migrations: legacy entity / subtitle / descriptor → primary_*.
  if (!merged.primary_entity && merged.entity) merged.primary_entity = merged.entity;
  if (!merged.primary_prefix && merged.subtitle) merged.primary_prefix = merged.subtitle;
  if (!merged.primary_attribute && merged.subtitle_attribute) merged.primary_attribute = merged.subtitle_attribute;
  if (!merged.primary_descriptor_prefix && merged.descriptor) merged.primary_descriptor_prefix = merged.descriptor;
  if (!merged.primary_descriptor_attribute && merged.descriptor_attribute) merged.primary_descriptor_attribute = merged.descriptor_attribute;
  if (merged.primary_attribute && merged.primary_attribute.includes(',')) {
    merged.primary_attribute = merged.primary_attribute.split(',')[0].trim();
  }
  // `secondary_label` is deliberately NOT auto-migrated here; the storage
  // rewrite has done that one-shot, and re-inserting it every load would
  // prevent the user from clearing the descriptor via the editor.
  return merged;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function stateName(entityId) {
  return String(entityId || '').split('.').pop()?.replace(/_/g, ' ') || '';
}

function themeClass(theme) {
  if (theme === 'dark') return 'theme-dark';
  if (theme === 'light') return 'theme-light';
  return 'theme-dashboard';
}

const BINARY_LABELS = {
  door: ['Open', 'Closed'], window: ['Open', 'Closed'], opening: ['Open', 'Closed'],
  garage_door: ['Open', 'Closed'], lock: ['Unlocked', 'Locked'],
  moisture: ['Wet', 'Dry'], motion: ['Detected', 'Clear'],
  occupancy: ['Occupied', 'Clear'], presence: ['Present', 'Away'],
  smoke: ['Detected', 'Clear'], vibration: ['Detected', 'Clear'],
  tamper: ['Tampered', 'OK'], moving: ['Moving', 'Still'],
  problem: ['Problem', 'OK'], safety: ['Unsafe', 'Safe'],
  cold: ['Cold', 'Normal'], heat: ['Hot', 'Normal'],
  light: ['Detected', 'Clear'], plug: ['Plugged in', 'Unplugged'],
  power: ['Powered', 'Off'], running: ['Running', 'Stopped'],
  sound: ['Detected', 'Clear'], update: ['Available', 'Up to date'],
};

function friendlyState(stateObj, hass) {
  if (!stateObj) return '';
  // Prefer HA's own localised formatter (knows device_class translations).
  if (hass?.formatEntityState) {
    try { return hass.formatEntityState(stateObj); } catch (e) {}
  }
  // Fallback for binary sensors so a door reads "Open/Closed" not "on/off".
  const dc = stateObj.attributes?.device_class;
  if (stateObj.entity_id?.startsWith('binary_sensor.') && (stateObj.state === 'on' || stateObj.state === 'off')) {
    const pair = BINARY_LABELS[dc];
    if (pair) return stateObj.state === 'on' ? pair[0] : pair[1];
    return stateObj.state === 'on' ? 'On' : 'Off';
  }
  const unit = stateObj.attributes?.unit_of_measurement || '';
  return `${stateObj.state}${unit ? ` ${unit}` : ''}`;
}

function prettyState(value) {
  return String(value || '').replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
}

function batteryText(stateObj) {
  if (!stateObj || ['unknown', 'unavailable'].includes(stateObj.state)) return '';
  const parsed = parseInt(stateObj.state, 10);
  return Number.isFinite(parsed) ? `${parsed}%` : stateObj.state;
}

function relativeTime(iso) {
  if (!iso) return '';
  const changed = new Date(iso);
  if (Number.isNaN(changed.getTime())) return '';
  const mins = Math.max(0, Math.floor((Date.now() - changed.getTime()) / 60000));
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// Long-form duration for the "state since …" display. Returns up to two
// non-zero units in order of magnitude — e.g. "2 days, 4 hours", "5 hours,
// 12 minutes", "8 minutes". Singular/plural respected.
function longDuration(iso) {
  if (!iso) return '';
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return '';
  const seconds = Math.max(0, Math.floor((Date.now() - t.getTime()) / 1000));
  if (seconds < 60) return 'a moment';
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const piece = (n, label) => `${n} ${label}${n !== 1 ? 's' : ''}`;
  const parts = [];
  if (days) parts.push(piece(days, 'day'));
  if (hours) parts.push(piece(hours, 'hour'));
  if (!parts.length || (parts.length === 1 && !days && minutes)) parts.push(piece(minutes, 'minute'));
  return parts.slice(0, 2).join(', ');
}

function listValue(value) {
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  return String(value || '').split(',').map(item => item.trim()).filter(Boolean);
}

function wasteDays(value) {
  const text = String(value || '').trim().toLowerCase();
  if (!text || ['unknown', 'unavailable'].includes(text)) return Number.POSITIVE_INFINITY;
  if (text === 'today') return 0;
  if (text === 'tomorrow') return 1;
  const match = text.match(/(\d+)/);
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
}

function daysText(days, fallback = '') {
  if (!Number.isFinite(days)) return fallback || 'Unknown';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
}

function numberText(value, digits = 1) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return '';
  return parsed.toFixed(digits).replace(/\.0$/, '');
}

function fire(el, type, detail = {}) {
  el.dispatchEvent(new CustomEvent(type, {
    detail,
    bubbles: true,
    composed: true,
  }));
}

const CSS = `
  :host {
    display: block;
    --am-card-height: auto;
    --am-radius: 10px;
    --am-accent: var(--accent-color, #f97316);
    --am-glow-1: #f97316;
    --am-glow-2: #06b6d4;
    --am-glow-3: #a855f7;
    --am-text: var(--primary-text-color, #fff);
    --am-muted: var(--secondary-text-color, rgba(255,255,255,.68));
    --am-bg-default: color-mix(in srgb, var(--am-text) 10%, rgba(0,0,0,0));
    --am-bg: var(--av-card-bg, var(--am-bg-default));
    --am-border: color-mix(in srgb, var(--primary-text-color, #fff) 12%, rgba(255,255,255,0.16));
    --am-hover: rgba(255,255,255,.05);
  }
  * { box-sizing: border-box; }
  .card {
    position: relative;
    min-height: var(--am-card-height);
    height: var(--am-card-height);
    border-radius: var(--am-radius) !important;
    overflow: hidden !important;
    clip-path: inset(0 round var(--am-radius));
    color: var(--am-text);
    background: var(--reflection-top, none), var(--am-bg) !important;
    border: 1px solid var(--av-card-border, transparent) !important;
    box-shadow: var(--shadow-glass, none);
    backdrop-filter: var(--av-card-blur, none);
    -webkit-backdrop-filter: var(--av-card-blur, none);
    font-family: var(--ha-font-family-body, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif);
    cursor: pointer;
    transition: none;
  }
  .card.variant-nav {
    background: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
    overflow: visible;
  }
  .card.variant-title-room {
    background: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    clip-path: none;
    overflow: visible !important;
    cursor: default;
    pointer-events: none;
  }
  .card.variant-nav {
    min-height: var(--am-card-height, 42px);
  }
  .card:hover {
    transform: none;
    background: var(--reflection-top, none), var(--am-bg) !important;
    border-color: var(--av-card-border, transparent) !important;
  }
  .card.variant-title-room:hover {
    background: transparent !important;
    border-color: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    transform: none !important;
  }
  .card.variant-nav:hover {
    background: transparent !important;
    border-color: transparent !important;
    transform: none;
  }
  .card.theme-dark {
    --am-text: #fff;
    --am-muted: rgba(255,255,255,.68);
    --am-bg-default: rgba(255,255,255,.22);
    --am-border: rgba(255,255,255,.10);
  }
  .card.theme-light {
    --am-text: #172033;
    --am-muted: rgba(23,32,51,.64);
    --am-bg-default: rgba(0,0,0,.075);
    --am-border: rgba(23,32,51,.12);
    --am-hover: rgba(23,32,51,.04);
  }
  .bg-image {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    opacity: .34;
    pointer-events: none;
  }
  .bg-image::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, rgba(0,0,0,.58), rgba(0,0,0,.08) 54%, rgba(0,0,0,.38));
  }
  .glow {
    position: absolute;
    width: 92px;
    height: 92px;
    right: -30px;
    bottom: -34px;
    border-radius: 50%;
    background: conic-gradient(from 140deg, var(--am-glow-1), var(--am-glow-2), var(--am-glow-3), var(--am-glow-1));
    filter: blur(20px);
    opacity: .42;
    pointer-events: none;
  }
  .hide-glow .glow,
  .variant-nav .glow {
    display: none;
  }
  .content {
    position: relative;
    z-index: 1;
    min-height: inherit;
    height: 100%;
    display: flex;
    gap: 12px;
    padding: 16px;
  }
  /* Square tile. Two cases:
     - height: auto       → card fills its grid cell width, height derives from
                            width via aspect-ratio (square based on cell).
     - height: <length>   → host shrinks to that length, card matches, so the
                            tile is exactly N×N regardless of cell width. */
  :host([square]) {
    width: var(--am-card-height);
    max-width: 100%;
  }
  /* The square variant is the only one forced into a 1:1 aspect ratio. The
     host width is pinned to var(--am-card-height) via :host([square]) so the
     card renders as a true N x N tile. */
  .card.variant-square {
    aspect-ratio: 1 / 1;
    height: var(--am-card-height);
    width: 100%;
    min-height: 112px;
  }
  .variant-square .content {
    flex-direction: column;
    justify-content: space-between;
  }
  /* Generic — the unified wide/status/hero workhorse: icon left, text middle,
     state/secondary panel right. */
  .variant-generic .content {
    min-height: 72px;
    align-items: center;
  }
  .variant-security .content {
    min-height: var(--am-card-height, 120px);
    align-items: center;
    gap: 14px;
  }
  .variant-doors .content,
  .variant-lights .content,
  .variant-waste .content,
  .variant-presence .content {
    min-height: var(--am-card-height, 120px);
    align-items: stretch;
    gap: 14px;
  }
  .variant-title-room .content {
    min-height: var(--am-card-height, 116px);
    padding: 0;
    align-items: stretch;
  }
  .variant-nav .content {
    min-height: var(--am-card-height, 42px);
    height: var(--am-card-height, 42px);
    padding: 0 6px;
    align-items: center;
    justify-content: center;
    gap: 0;
  }
  .variant-lean {
    background: var(--am-bg) !important;
    transform: skewX(-12deg);
    transform-origin: center;
  }
  .variant-lean:hover {
    background: var(--am-bg) !important;
    transform: skewX(-12deg) translateY(-2px);
  }
  /* Lean is now a composable toggle (cfg.lean) rather than a layout variant —
     content layout is owned by the underlying variant (tile / wide / etc).
     Lean only contributes the skew + counter-skew so the card looks tilted
     while the inner text stays upright. */
  .variant-lean .content {
    transform: skewX(12deg);
    transform-origin: center;
  }
  /* Icon-wrap (the rounded square + the glyph inside) stays exactly as in
     the underlying variant — the content counter-skew already keeps it
     upright, so no extra transform here. */
  /* Lean wraps the card in a flex row with two spacer divs. The spacers reserve
     exactly the width the skew silhouette reaches past each side, so the card's
     bounding rectangle is "host width − 2·pad" and the leaning corners live in
     the reserved spacer area instead of crossing the grid gap. When lean is off
     the spacers collapse (display: none) and the card fills the host. */
  .card-row {
    display: flex;
    width: 100%;
    height: 100%;
    min-height: inherit;
    align-items: stretch;
  }
  .lean-spacer {
    display: none;
    flex: 0 0 0;
  }
  :host([lean]) .lean-spacer {
    display: block;
    /* Default = grid gap + 2px (just enough to clear the skew silhouette).
       Theme/card overrides --am-lean-pad to an absolute value when needed. */
    flex: 0 0 var(--am-lean-pad, calc(var(--grid-card-gap, 8px) + 2px));
  }
  .card-row > .card {
    flex: 1 1 auto;
    min-width: 0;
  }
  .variant-lean .bg-image,
  .variant-lean .glow {
    transform: skewX(12deg) scale(1.18);
  }
  .variant-lean .glow {
    right: -34px;
    bottom: -38px;
    opacity: .30;
    filter: blur(26px);
  }
  .icon-wrap {
    position: relative;
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    border-radius: 15px;
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--am-accent) 18%, rgba(0,0,0,0));
    border: 1px solid transparent;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.18);
    overflow: visible;
  }
  .icon-wrap::before {
    content: "";
    position: absolute;
    inset: -6px;
    z-index: -1;
    border-radius: 17px;
    background: radial-gradient(circle, color-mix(in srgb, var(--am-accent) 52%, rgba(0,0,0,0)), transparent 70%);
    filter: blur(8px);
    opacity: .72;
  }
  .variant-title-room .icon-wrap {
    width: 56px;
    height: 56px;
    border-radius: 18px;
    margin-bottom: 3px;
  }
  .variant-title-room .icon-wrap ha-icon {
    --mdc-icon-size: 30px;
  }
  .variant-nav .icon-wrap {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    display: grid;
    background: color-mix(in srgb, var(--am-accent) 16%, rgba(0,0,0,0));
    border-color: transparent;
    box-shadow: 0 0 18px -10px var(--am-accent);
  }
  .variant-nav .icon-wrap::before {
    display: none;
  }
  .variant-nav .icon-wrap ha-icon {
    --mdc-icon-size: 17px;
  }
  .variant-security .icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: 14px;
    background: color-mix(in srgb, var(--am-accent) 20%, rgba(255,255,255,.12));
    border-color: transparent;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.18), 0 0 24px -9px var(--am-accent), 0 12px 26px rgba(0,0,0,.14);
  }
  .variant-security .icon-wrap ha-icon {
    --mdc-icon-size: 22px;
    color: var(--am-text);
  }
  .variant-doors .icon-wrap,
  .variant-lights .icon-wrap,
  .variant-waste .icon-wrap,
  .variant-presence .icon-wrap {
    align-self: center;
  }
  .icon-wrap::before {
    content: "";
    position: absolute;
    inset: -7px;
    z-index: -1;
    border-radius: 20px;
    background: conic-gradient(from 150deg, var(--am-glow-1), var(--am-glow-2), var(--am-glow-3), var(--am-glow-1));
    filter: blur(14px);
    opacity: .68;
  }
  .icon-wrap ha-icon {
    --mdc-icon-size: 22px;
    color: var(--am-text);
  }
  .entity-picture {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .text {
    min-width: 0;
    flex: 1;
  }
  .name {
    font-size: 15px;
    line-height: 1.15;
    font-weight: 800;
    letter-spacing: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .variant-title-room .name {
    margin-top: 22px;
    font-family: var(--am-title-font, inherit);
    font-size: var(--am-title-size, clamp(46px, 7vw, 92px));
    /* Was 0.86 — tight enough to clip descenders (y, g, p) and, in gradient
       modes, the text-clipped background. Lift to ~1.0 and add a tiny
       bottom padding so the glyph box always covers the descender area. */
    line-height: 1.0;
    padding-bottom: 0.08em;
    font-weight: 900;
    color: var(--am-title-color, var(--am-text));
    text-shadow: none;
    white-space: normal;
    letter-spacing: 0;
    overflow: visible;
  }
  /* Gradient colour modes — replaces the flat text colour with a clipped
     linear gradient. Static, random and dynamic share the same recipe; only
     dynamic adds the moving animation. */
  .variant-title-room.title-color-static .name,
  .variant-title-room.title-color-random .name,
  .variant-title-room.title-color-dynamic .name {
    background: linear-gradient(120deg,
      var(--am-title-g1, #a78bfa),
      var(--am-title-g2, #60a5fa),
      var(--am-title-g3, #22d3ee),
      var(--am-title-g1, #a78bfa));
    background-size: 300% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .variant-title-room.title-color-dynamic .name {
    animation: am-title-shift var(--am-title-anim, 8s) linear infinite;
  }
  @keyframes am-title-shift {
    0%   { background-position:   0% 50%; }
    100% { background-position: 200% 50%; }
  }
  .variant-nav .name {
    font-size: 13px;
    font-weight: 850;
    color: rgba(255,255,255,.58);
    text-align: center;
    max-width: 92px;
  }
  .variant-nav.active .name {
    color: #fff;
  }
  .variant-nav .text {
    flex: 0 1 auto;
  }
  .variant-nav .content:has(.icon-wrap) .text {
    min-width: 0;
  }
  .variant-nav.active::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: -3px;
    height: 2px;
    border-radius: 999px;
    background: var(--am-text);
    box-shadow: 0 0 16px color-mix(in srgb, var(--am-accent) 72%, rgba(0,0,0,0));
  }
  .variant-security .name {
    font-size: 15px;
    font-weight: 900;
  }
  .meta {
    margin-top: 5px;
    color: var(--am-muted);
    font-size: 12px;
    line-height: 1.25;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .variant-title-room .meta {
    margin-top: 0;
    color: color-mix(in srgb, var(--am-text) 78%, rgba(0,0,0,0));
    font-size: clamp(14px, 1.6vw, 20px);
    line-height: 1.2;
    font-weight: 850;
    letter-spacing: .04em;
    text-transform: uppercase;
    max-width: 520px;
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }
  .variant-title-room .descriptor {
    margin-top: 24px;
    color: color-mix(in srgb, var(--am-text) 82%, rgba(0,0,0,0));
    font-size: clamp(16px, 1.8vw, 23px);
    line-height: 1.22;
    font-weight: 850;
    max-width: 760px;
    -webkit-line-clamp: unset;
    overflow: visible;
  }
  .variant-title-room .text {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: inherit;
  }
  .variant-doors .text,
  .variant-lights .text,
  .variant-waste .text {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .variant-nav .meta,
  .variant-nav .badge,
  .variant-nav .state,
  .variant-nav .right {
    display: none;
  }
  .security-door {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
    min-width: 0;
    margin-top: 8px;
    color: var(--am-muted);
    font-size: 11px;
    font-weight: 850;
    line-height: 1.25;
  }
  .security-door-main,
  .security-door-sub {
    display: inline-flex;
    align-items: center;
    min-width: 0;
    max-width: 100%;
  }
  .security-door-sub {
    gap: 7px;
    flex-wrap: wrap;
  }
  .security-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
    max-width: 100%;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid rgba(52,211,153,.25);
    background: rgba(52,211,153,.22);
    color: #34d399;
    font-size: 11px;
    font-weight: 850;
    line-height: 1.1;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.18);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .security-pill.open {
    background: rgba(251,146,60,.15);
    border-color: rgba(251,146,60,.28);
    color: #fb923c;
  }
  /* Light-theme contrast — green/orange text needs to darken to stay readable
     on a light card surface. */
  .card.theme-light .security-pill {
    background: rgba(6,78,59,.18);
    border-color: rgba(6,78,59,.36);
    color: #064e3b;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.30);
  }
  .card.theme-light .security-pill.open {
    background: rgba(124,45,18,.16);
    border-color: rgba(124,45,18,.34);
    color: #7c2d12;
  }
  .security-dot {
    width: 6px;
    height: 6px;
    border-radius: 99px;
    background: currentColor;
    flex: 0 0 auto;
  }
  .security-battery {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex: 0 0 auto;
    min-width: 0;
  }
  .security-battery ha-icon {
    --mdc-icon-size: 13px;
    color: currentColor;
  }
  .security-sep {
    color: color-mix(in srgb, var(--am-muted) 62%, rgba(0,0,0,0));
  }
  .security-event {
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .security-panel {
    flex: 0 0 96px;
    width: 96px;
    min-width: 96px;
    align-self: stretch;
    display: grid;
    place-items: center;
    gap: 5px;
    padding-left: 14px;
    border-left: 1px solid var(--am-border);
  }
  .security-panel ha-icon {
    --mdc-icon-size: 28px;
  }
  .security-panel.armed {
    color: #f87171;
  }
  .security-panel.disarmed {
    color: #34d399;
  }
  .security-panel-text {
    color: var(--am-text);
    font-size: 11px;
    line-height: 1.1;
    font-weight: 900;
    text-align: center;
  }
  .waste-other {
    margin-top: 8px;
    color: var(--am-muted);
    font-size: 11px;
    line-height: 1.35;
    font-weight: 800;
    overflow-wrap: anywhere;
  }
  .waste-next {
    flex: 0 0 96px;
    width: 96px;
    min-width: 96px;
    margin-left: auto;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 6px;
    padding-left: 14px;
    border-left: 1px solid color-mix(in srgb, var(--primary-text-color, #fff) 10%, rgba(255,255,255,0.16));
    text-align: center;
  }
  .waste-next ha-icon {
    --mdc-icon-size: 28px;
    color: var(--am-accent);
    filter: drop-shadow(0 0 10px color-mix(in srgb, var(--am-accent) 42%, rgba(0,0,0,0)));
  }
  .waste-next-name {
    font-size: 11px;
    line-height: 1.1;
    font-weight: 900;
  }
  .waste-next-days {
    color: var(--am-text);
    font-size: 13px;
    line-height: 1.1;
    font-weight: 950;
  }
  .doors-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    max-width: 100%;
    margin-top: 8px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid transparent;
    background: color-mix(in srgb, var(--am-accent) 18%, rgba(255,255,255,.10));
    color: var(--am-text);
    font-size: 11px;
    font-weight: 850;
    line-height: 1.1;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.14);
    white-space: nowrap;
  }
  .doors-dot {
    width: 6px;
    height: 6px;
    border-radius: 99px;
    background: var(--am-accent);
    flex: 0 0 auto;
  }
  .doors-detail {
    margin-top: 8px;
    color: var(--am-muted);
    font-size: 11px;
    line-height: 1.35;
    font-weight: 800;
    overflow-wrap: anywhere;
  }
  .doors-panel {
    flex: 0 0 96px;
    width: 96px;
    min-width: 96px;
    margin-left: auto;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 5px;
    padding-left: 14px;
    border-left: 1px solid var(--am-border);
    text-align: center;
  }
  .doors-count {
    color: var(--am-text);
    font-size: 24px;
    line-height: 1;
    font-weight: 950;
  }
  .doors-label {
    color: var(--am-text);
    font-size: 11px;
    line-height: 1.1;
    font-weight: 900;
  }
  .lights-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    max-width: 100%;
    margin-top: 8px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid transparent;
    background: color-mix(in srgb, var(--am-accent) 18%, rgba(255,255,255,.10));
    color: var(--am-text);
    font-size: 11px;
    font-weight: 850;
    line-height: 1.1;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.14);
    white-space: nowrap;
  }
  .lights-dot {
    width: 6px;
    height: 6px;
    border-radius: 99px;
    background: var(--am-accent);
    flex: 0 0 auto;
  }
  .lights-detail {
    margin-top: 8px;
    color: var(--am-muted);
    font-size: 11px;
    line-height: 1.35;
    font-weight: 800;
    overflow-wrap: anywhere;
  }
  .lights-panel {
    flex: 0 0 96px;
    width: 96px;
    min-width: 96px;
    margin-left: auto;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 5px;
    padding-left: 14px;
    border-left: 1px solid var(--am-border);
    text-align: center;
  }
  .lights-count {
    color: var(--am-text);
    font-size: 24px;
    line-height: 1;
    font-weight: 950;
  }
  .lights-label {
    color: var(--am-text);
    font-size: 11px;
    line-height: 1.1;
    font-weight: 900;
  }
  .presence-people {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: nowrap;
  }
  .presence-person {
    --presence-glow: #34d399;
    flex: 0 1 var(--presence-icon-size, 46px);
    width: var(--presence-icon-size, 46px);
    max-width: var(--presence-icon-size, 46px);
    min-width: 28px;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    border-radius: 50%;
    container-type: size;
    background:
      radial-gradient(circle, color-mix(in srgb, var(--presence-glow) 26%, rgba(255,255,255,.18)), color-mix(in srgb, var(--presence-glow) 12%, rgba(255,255,255,.08)));
    box-shadow:
      inset 0 0 0 1px color-mix(in srgb, var(--presence-glow) 58%, rgba(255,255,255,.24)),
      0 0 0 2px color-mix(in srgb, var(--presence-glow) 24%, rgba(0,0,0,0)),
      0 0 16px -2px var(--presence-glow),
      0 0 34px -8px var(--presence-glow),
      0 10px 20px rgba(0,0,0,.16);
  }
  .presence-person.away {
    --presence-glow: #fb923c;
  }
  .presence-picture,
  .presence-fallback {
    width: 85%;
    height: 85%;
    border-radius: 50%;
  }
  .presence-picture {
    object-fit: cover;
  }
  .presence-fallback {
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--am-accent) 22%, rgba(255,255,255,.10));
  }
  .presence-fallback ha-icon {
    --mdc-icon-size: 50cqmin;
  }
  @media (max-width: 420px) {
    .presence-people { gap: 6px; }
    .presence-person { min-width: 24px; }
  }
  .presence-empty {
    color: var(--am-muted);
    font-size: 11px;
    font-weight: 800;
  }
  .variant-generic .content {
    min-height: var(--am-card-height, 120px);
    align-items: center;
    gap: 14px;
  }
  /* Primary line rendered as a pill. Each colour falls back to the card
     accent if no explicit override is set on the host. */
  .primary-pill {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    max-width: 100%;
    margin-top: 6px;
    padding: 4px 12px;
    border-radius: var(--am-pill-radius, 999px);
    border: 1px solid var(--am-pill-border, transparent);
    background: color-mix(in srgb, var(--am-pill-fill, var(--am-accent)) var(--am-pill-opacity, 18%), transparent);
    color: var(--am-text);
    font-size: 12px;
    font-weight: 700;
    line-height: 1.15;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .generic-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    width: fit-content;
    max-width: 100%;
    margin-top: 6px;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid color-mix(in srgb, var(--am-accent) 28%, rgba(255,255,255,0.16));
    background: color-mix(in srgb, var(--am-accent) 18%, rgba(255,255,255,.10));
    color: var(--am-text);
    font-size: 11px;
    font-weight: 850;
    line-height: 1.1;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.14);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .generic-dot {
    width: 6px;
    height: 6px;
    border-radius: 99px;
    background: var(--am-accent);
    flex: 0 0 auto;
  }
  .generic-attrs {
    margin-top: 6px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    color: var(--am-muted);
    font-size: 11px;
    font-weight: 800;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }
  .generic-sep {
    color: color-mix(in srgb, var(--am-muted) 60%, rgba(0,0,0,0));
  }
  /* Panel stretches to the full card height; its own content is centred
     inside via grid place-items. That way the border-left divider is always
     the full card height regardless of how little secondary content is
     present, and the value/descriptor sit centred against it. */
  .generic-panel {
    position: relative;
    flex: 0 0 96px;
    width: 96px;
    min-width: 96px;
    margin-left: auto;
    align-self: stretch;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 5px;
    padding-left: 14px;
    border-left: 1px solid var(--am-border);
    text-align: center;
  }
  .generic-panel.no-divider {
    border-left: 0;
    padding-left: 0;
  }
  /* Lean mode: hide the panel's own border-left on every variant that has a
     right-side panel. The leaning divider is drawn as a sibling of .content
     inside .card (see .lean-divider below) so it inherits ONLY the card's
     skewX(-12deg) — no counter-skew to undo it. */
  .variant-lean .generic-panel,
  .variant-lean .security-panel,
  .variant-lean .doors-panel,
  .variant-lean .lights-panel,
  .variant-lean .waste-next {
    border-left: 0;
  }
  /* .lean-divider sits inside .card but outside .content, so it picks up the
     card's leaning transform and nothing else. Positioned where the panel's
     left edge sits in the flex row (content padding 16px + panel width 96px
     from the right). Inset top/bottom by the same 16px content padding so the
     divider height matches the non-lean panel's natural border-left height. */
  .lean-divider {
    position: absolute;
    top: 16px;
    bottom: 16px;
    right: calc(96px + 16px);
    width: 1px;
    background: var(--am-border);
    z-index: 1;
    pointer-events: none;
  }
  .generic-secondary-icon {
    --mdc-icon-size: 28px;
    color: var(--am-accent);
    filter: drop-shadow(0 0 10px color-mix(in srgb, var(--am-accent) 42%, rgba(0,0,0,0)));
  }
  .generic-value {
    color: var(--am-text);
    font-size: 15px;
    line-height: 1.1;
    font-weight: 950;
    overflow-wrap: anywhere;
  }
  .generic-label {
    color: var(--am-text);
    font-size: 11px;
    line-height: 1.15;
    font-weight: 900;
  }
  .descriptor {
    margin-top: 6px;
    color: color-mix(in srgb, var(--am-muted) 86%, rgba(0,0,0,0));
    font-size: 11px;
    line-height: 1.25;
    font-weight: 750;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .badge {
    align-self: flex-start;
    display: inline-flex;
    align-items: center;
    min-height: 24px;
    max-width: 100%;
    padding: 3px 10px;
    border-radius: 999px;
    color: var(--am-text);
    background: color-mix(in srgb, var(--am-accent) 18%, rgba(255,255,255,.10));
    border: 1px solid transparent;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .state {
    margin-top: 12px;
    font-size: 24px;
    font-weight: 850;
    line-height: 1;
  }
  .variant-generic .state {
    margin-top: 0;
    font-size: 18px;
    align-self: center;
  }
  /* Square's bottom state row uses descriptor styling — the giant 24px state
     would dominate the compact tile. */
  .variant-square .state {
    margin-top: 6px;
    font-size: 11px;
    font-weight: 750;
    color: color-mix(in srgb, var(--am-muted) 86%, rgba(0,0,0,0));
    line-height: 1.25;
  }
  .right {
    position: relative;
    z-index: 1;
    margin-left: auto;
    display: flex;
    align-items: center;
  }
  .variant-square .right {
    margin-left: 0;
    align-items: flex-start;
  }
  @media (max-width: 520px) {
    .content { padding: 14px; }
    .variant-title-room .content { min-height: 100px; padding: 0; }
    .variant-title-room .name { font-size: 32px; }
    .variant-title-room .meta { font-size: 12px; }
    .variant-title-room .descriptor { margin-top: 14px; font-size: 14px; }
    .variant-nav .content { padding: 0 4px; }
    .variant-nav .name { font-size: 11px; max-width: 64px; }
  }
`;

class AveryModernCard extends HTMLElement {
  static getConfigElement() {
    return document.createElement('avery-modern-card-editor');
  }


  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    const merged = migrateLegacyConfig(config);

    this._config = merged;
    this._render();
    this._refreshSinceTicker();
  }

  connectedCallback() { this._refreshSinceTicker(); }
  disconnectedCallback() {
    if (this._sinceTimer) { clearInterval(this._sinceTimer); this._sinceTimer = null; }
  }

  // Re-render once a minute if any attribute slot is set to state_since,
  // otherwise the "Closed since 2 days, 4 hours" text would stay frozen until
  // the next hass state change.
  _refreshSinceTicker() {
    const usesSince = ['primary_attribute', 'primary_descriptor_attribute',
      'secondary_attribute', 'secondary_descriptor_attribute', 'badge_attribute']
      .some(field => this._config?.[field] === 'state_since');
    if (usesSince && !this._sinceTimer) {
      this._sinceTimer = setInterval(() => this._render(), 60000);
    } else if (!usesSince && this._sinceTimer) {
      clearInterval(this._sinceTimer);
      this._sinceTimer = null;
    }
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() {
    return this._config?.variant === 'hero' ? 3 : 2;
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    const cfg = this._config;
    // The primary entity drives everything: icon, name, the main readout line.
    // `entity` is kept on the config object only as a legacy alias — setConfig
    // copies it onto primary_entity at load time.
    const primaryId = cfg.primary_entity;
    const stateObj = primaryId ? this._hass?.states?.[primaryId] : null;
    const badgeObj = cfg.badge_entity ? this._hass?.states?.[cfg.badge_entity] : null;
    const name = cfg.name || stateObj?.attributes?.friendly_name || stateName(primaryId) || 'Avery Modern';
    const icon = cfg.icon || stateObj?.attributes?.icon || 'mdi:view-dashboard';
    const state = stateObj ? friendlyState(stateObj, this._hass) : '';
    // Build "<prefix> <attribute-value>" against the primary entity.
    const joinPrefixAttr = (prefix, attr, target = stateObj) => {
      const p = String(prefix || '').trim();
      const a = attr ? this._attrValue(target, attr) : '';
      return [p, a].filter(Boolean).join(' ');
    };
    const primaryLine = joinPrefixAttr(cfg.primary_prefix, cfg.primary_attribute);
    // Subtitle is the primary line; if both prefix and attribute are empty,
    // fall back to the entity's state so a bare entity card still says something.
    // No fallback to the entity's raw state — if the user didn't fill in a
    // primary prefix or attribute, the meta line stays empty.
    const subtitle = primaryLine;
    const descriptor = joinPrefixAttr(cfg.primary_descriptor_prefix, cfg.primary_descriptor_attribute);
    const badge = this._badgeText(cfg, badgeObj);
    const picture = cfg.show_entity_picture ? stateObj?.attributes?.entity_picture : '';
    const securityHtml = cfg.variant === 'security' ? this._securityHtml(cfg) : '';
    const styles = [
      cfg.height ? `--am-card-height:${escapeHtml(cfg.height)};` : '',
      cfg.corner_radius !== '' && cfg.corner_radius != null ? `--am-radius:${Number(cfg.corner_radius) || 0}px;` : '',
      cfg.accent_color ? `--am-accent:${escapeHtml(cfg.accent_color)};` : '',
      cfg.background_color ? `--am-bg:${escapeHtml(cfg.background_color)};` : '',
      cfg.glow_color_1 ? `--am-glow-1:${escapeHtml(cfg.glow_color_1)};` : '',
      cfg.glow_color_2 ? `--am-glow-2:${escapeHtml(cfg.glow_color_2)};` : '',
      cfg.glow_color_3 ? `--am-glow-3:${escapeHtml(cfg.glow_color_3)};` : '',
      cfg.presence_icon_size ? `--presence-icon-size:${Math.max(28, Math.min(72, Number(cfg.presence_icon_size) || DEFAULT_CONFIG.presence_icon_size))}px;` : '',
    ].join('');
    // The `square` host attribute (and aspect-ratio + host-width pin) is
    // driven entirely by `variant === 'square'`. Lean is an orthogonal
    // toggle — it composes onto any non-square variant without altering
    // dimensions.
    const isLean = cfg.lean === true;
    const isSquare = cfg.variant === 'square';
    this.toggleAttribute('square', isSquare);
    this.toggleAttribute('lean', isLean);
    // The leaning divider lives OUTSIDE .content (so it picks up only the
    // card's skewX(-12) and isn't undone by content's counter-skew). It fires
    // for every variant that has a right-side 96px panel:
    //   - generic: only when a secondary panel will actually be drawn
    //               (same predicate _genericHtml uses)
    //   - security / doors / lights / waste: always (panel is fixed)
    const panelVariants = new Set(['security', 'doors', 'lights', 'waste']);
    const showLeanDivider = isLean && (
      (cfg.variant === 'generic' && this._willRenderSecondaryPanel(cfg))
      || panelVariants.has(cfg.variant)
    );
    // The inline styles below are set on .card, but :host([square]) needs
    // --am-card-height too so it can shrink the host width to match. CSS
    // variables don't cascade upward from a child, so set it on the host.
    if (cfg.height) this.style.setProperty('--am-card-height', cfg.height);
    else this.style.removeProperty('--am-card-height');
    // Lean spacer width is set in CSS to match HA's default grid gap (8px).
    // The full skew silhouette is ~(H/2)·tan(12°) ≈ 13px at H=120, so ~5px
    // leaks past each spacer into the grid gap itself — which is empty, so
    // no overlap. Override --am-lean-pad if a denser layout needs more.
    // Primary-pill colour overrides — emitted as host vars so the .primary-pill
    // rule below picks them up. Each falls back to the card's accent if blank.
    if (cfg.primary_pill_border) this.style.setProperty('--am-pill-border', cfg.primary_pill_border);
    else this.style.removeProperty('--am-pill-border');
    if (cfg.primary_pill_fill) this.style.setProperty('--am-pill-fill', cfg.primary_pill_fill);
    else this.style.removeProperty('--am-pill-fill');
    if (cfg.primary_pill_opacity !== '' && cfg.primary_pill_opacity != null) {
      const n = Math.max(0, Math.min(100, Number(cfg.primary_pill_opacity)));
      if (Number.isFinite(n)) this.style.setProperty('--am-pill-opacity', `${n}%`);
      else this.style.removeProperty('--am-pill-opacity');
    } else {
      this.style.removeProperty('--am-pill-opacity');
    }
    if (cfg.primary_pill_radius !== '' && cfg.primary_pill_radius != null) {
      const r = Math.max(0, Number(cfg.primary_pill_radius));
      if (Number.isFinite(r)) this.style.setProperty('--am-pill-radius', `${r}px`);
      else this.style.removeProperty('--am-pill-radius');
    } else {
      this.style.removeProperty('--am-pill-radius');
    }
    // title-room may opt into a coloured title — flat colour, static gradient,
    // a random gradient generated per mount, or a moving/animated gradient.
    // Resolve once here so the CSS rules just consume the inline custom
    // properties and a single `title-color-<mode>` class.
    let titleColorMode = '';
    if (cfg.variant === 'title-room') {
      titleColorMode = ['static', 'random', 'dynamic'].includes(cfg.title_color_mode) ? cfg.title_color_mode : '';
      this._applyTitleStyleVars(cfg);
    } else {
      this._clearTitleStyleVars();
    }
    const cardClasses = [
      'card',
      themeClass(cfg.theme),
      `variant-${cfg.variant || 'tile'}`,
      isSquare ? 'square' : '',
      isLean ? 'variant-lean' : '',
      cfg.active ? 'active' : '',
      cfg.hide_glow ? 'hide-glow' : '',
      titleColorMode ? `title-color-${titleColorMode}` : '',
    ].filter(Boolean).join(' ');
    const contentHtml = cfg.variant === 'waste'
      ? this._wasteHtml(cfg, name, icon, picture)
      : cfg.variant === 'presence'
        ? this._presenceHtml(cfg, name, icon, picture)
        : cfg.variant === 'doors'
          ? this._doorsHtml(cfg, name, icon, picture)
          : cfg.variant === 'lights'
            ? this._lightsHtml(cfg, name, icon, picture)
            : cfg.variant === 'title-room'
              ? this._roomHtml(cfg, name)
              : cfg.variant === 'security'
                ? `
                  ${cfg.show_icon !== false ? `
                    <div class="icon-wrap">
                      ${picture ? `<img class="entity-picture" src="${escapeHtml(picture)}" alt="">` : `<ha-icon icon="${escapeHtml(icon)}"></ha-icon>`}
                    </div>` : ''}
                  <div class="text">
                    <div class="name">${escapeHtml(name)}</div>
                    ${securityHtml}
                    ${descriptor ? `<div class="descriptor">${escapeHtml(descriptor)}</div>` : ''}
                  </div>
                  ${cfg.show_badge && badge ? `<div class="right"><div class="badge">${escapeHtml(badge)}</div></div>` : ''}
                  ${this._securityPanelHtml(cfg)}`
                : cfg.variant === 'nav'
                  ? `
                    ${cfg.show_icon !== false ? `
                      <div class="icon-wrap">
                        ${picture ? `<img class="entity-picture" src="${escapeHtml(picture)}" alt="">` : `<ha-icon icon="${escapeHtml(icon)}"></ha-icon>`}
                      </div>` : ''}
                    <div class="text"><div class="name">${escapeHtml(name)}</div></div>`
                  : cfg.variant === 'square'
                    ? `
                      ${cfg.show_icon !== false ? `
                        <div class="icon-wrap">
                          ${picture ? `<img class="entity-picture" src="${escapeHtml(picture)}" alt="">` : `<ha-icon icon="${escapeHtml(icon)}"></ha-icon>`}
                        </div>` : ''}
                      <div class="text">
                        <div class="name">${escapeHtml(name)}</div>
                        ${subtitle ? (cfg.primary_pill ? `<div class="primary-pill">${escapeHtml(subtitle)}</div>` : `<div class="meta">${escapeHtml(subtitle)}</div>`) : ''}
                        ${descriptor ? `<div class="descriptor">${escapeHtml(descriptor)}</div>` : ''}
                        ${cfg.show_state && state ? `<div class="state">${escapeHtml(state)}</div>` : ''}
                      </div>
                      ${cfg.show_badge && badge ? `<div class="right"><div class="badge">${escapeHtml(badge)}</div></div>` : ''}`
                    : /* generic (the unified workhorse) */
                      `${this._genericHtml(cfg, name, icon, picture, subtitle, descriptor)}
                      ${cfg.show_badge && badge ? `<div class="right"><div class="badge">${escapeHtml(badge)}</div></div>` : ''}`;

    this.shadowRoot.innerHTML = `
      <style>${CSS}</style>
      <div class="card-row">
        <div class="lean-spacer" aria-hidden="true"></div>
        <div class="${cardClasses}" style="${styles}" tabindex="0" role="button" aria-label="${escapeHtml(name)}">
          ${cfg.background_image ? `<div class="bg-image" style="background-image:url('${escapeHtml(cfg.background_image)}')"></div>` : ''}
          <div class="glow"></div>
          ${showLeanDivider ? `<div class="lean-divider" aria-hidden="true"></div>` : ''}
          <div class="content">${contentHtml}</div>
        </div>
        <div class="lean-spacer" aria-hidden="true"></div>
      </div>
    `;
    this.shadowRoot.querySelector('.card')?.addEventListener('click', () => this._handleTap());
    this.shadowRoot.querySelector('.card')?.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this._handleTap();
      }
    });
    this.shadowRoot.querySelectorAll('.presence-person[data-entity]').forEach(el => {
      const open = event => {
        event.stopPropagation();
        const entityId = el.dataset.entity;
        if (entityId) fire(this, 'hass-more-info', { entityId });
      };
      el.addEventListener('click', open);
      el.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open(event);
        }
      });
    });
  }

  _badgeText(cfg, stateObj) {
    // Pure prefix + attribute. No fallback to the entity state — if neither
    // is configured, the badge stays empty (the .badge element won't render).
    const prefix = String(cfg.badge_text || '').trim();
    const attr = cfg.badge_attribute && stateObj ? this._attrValue(stateObj, cfg.badge_attribute) : '';
    return [prefix, attr].filter(Boolean).join(' ');
  }

  // Shared by _render (deciding whether to draw the lean divider) and
  // _genericHtml (deciding whether to draw the panel itself) so the two
  // never disagree. Returns true only when the user has actually configured
  // either the value or descriptor row in the Secondary section.
  _willRenderSecondaryPanel(cfg) {
    const id = cfg.secondary_use_primary ? cfg.primary_entity : cfg.secondary_entity;
    const state = id ? this._hass?.states?.[id] : null;
    if (!state) return false;
    const join = (prefix, attr) => {
      const p = String(prefix || '').trim();
      const a = attr ? this._attrValue(state, attr) : '';
      return (p || a) ? `${p} ${a}`.trim() : '';
    };
    return !!(join(cfg.secondary_prefix, cfg.secondary_attribute)
           || join(cfg.secondary_descriptor_prefix, cfg.secondary_descriptor_attribute));
  }

  _temperatureValue(cfg) {
    const entity = cfg.room_temperature_entity ? this._hass?.states?.[cfg.room_temperature_entity] : null;
    if (!entity) return '';
    return entity.attributes?.current_temperature ?? entity.attributes?.temperature ?? entity.state;
  }

  _humidityValue(cfg) {
    const entity = cfg.room_humidity_entity ? this._hass?.states?.[cfg.room_humidity_entity] : null;
    if (!entity) return '';
    return entity.attributes?.current_humidity ?? entity.attributes?.humidity ?? entity.state;
  }

  // Push title typography + gradient inputs onto :host custom properties so
  // the CSS rules can pick them up. Random mode is realised by picking three
  // fresh hex stops every time the card mounts (not per frame — that would
  // be jittery; the moving gradient is dynamic mode's job).
  _applyTitleStyleVars(cfg) {
    const setOrClear = (key, value) => {
      if (value === '' || value === undefined || value === null) this.style.removeProperty(key);
      else this.style.setProperty(key, String(value));
    };
    setOrClear('--am-title-font', cfg.title_font_family || '');
    setOrClear('--am-title-size', cfg.title_font_size || '');
    if (cfg.title_color_mode === 'static') {
      setOrClear('--am-title-color', cfg.title_color || '');
    } else {
      this.style.removeProperty('--am-title-color');
    }
    let g1 = cfg.title_gradient_1, g2 = cfg.title_gradient_2, g3 = cfg.title_gradient_3;
    if (cfg.title_color_mode === 'random') {
      const rand = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
      g1 = rand(); g2 = rand(); g3 = rand();
    }
    setOrClear('--am-title-g1', g1);
    setOrClear('--am-title-g2', g2);
    setOrClear('--am-title-g3', g3);
    if (cfg.title_color_mode === 'dynamic') {
      const secs = Number(cfg.title_animation_seconds);
      setOrClear('--am-title-anim', Number.isFinite(secs) && secs > 0 ? `${secs}s` : '');
    } else {
      this.style.removeProperty('--am-title-anim');
    }
  }

  _clearTitleStyleVars() {
    ['--am-title-font', '--am-title-size', '--am-title-color',
      '--am-title-g1', '--am-title-g2', '--am-title-g3', '--am-title-anim']
      .forEach(k => this.style.removeProperty(k));
  }

  _temperatureLabel(value) {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) return '';
    if (parsed >= 26) return 'VERY HOT';
    if (parsed >= 23) return 'WARM';
    if (parsed >= 19) return 'COMFORTABLE';
    if (parsed >= 16) return 'COOL';
    return 'COLD';
  }

  _humidityLabel(value) {
    const parsed = Number.parseFloat(value);
    if (!Number.isFinite(parsed)) return '';
    if (parsed < 35) return 'Humidity is low';
    if (parsed > 65) return 'Humidity is high';
    return 'Humidity is good';
  }

  _roomHtml(cfg, name) {
    const temp = this._temperatureValue(cfg);
    const humidity = this._humidityValue(cfg);
    const tempText = temp !== '' ? `${numberText(temp, 1)}° - ${this._temperatureLabel(temp)}` : cfg.subtitle;
    const humidityNumber = numberText(humidity, 0);
    const humidityText = humidityNumber ? `${this._humidityLabel(humidity)} at ${humidityNumber}%` : cfg.descriptor;
    return `
      <div class="text">
        ${tempText ? `<div class="meta">${escapeHtml(tempText)}</div>` : ''}
        <div class="name">${escapeHtml(name)}</div>
        ${humidityText ? `<div class="descriptor">${escapeHtml(humidityText)}</div>` : ''}
      </div>
    `;
  }

  _wasteItems(cfg) {
    const icons = {
      household: 'mdi:trash-can-outline',
      recycling: 'mdi:recycle',
      garden: 'mdi:leaf',
    };
    return listValue(cfg.waste_entities).map(entityId => {
      const stateObj = this._hass?.states?.[entityId];
      const name = stateObj?.attributes?.friendly_name || stateName(entityId);
      const key = name.toLowerCase().includes('recycling') ? 'recycling'
        : name.toLowerCase().includes('garden') ? 'garden'
          : 'household';
      const days = wasteDays(stateObj?.state);
      return {
        entityId,
        name,
        shortName: name.replace(/\s*waste\s*/i, '').trim() || name,
        state: stateObj?.state || 'Unknown',
        days,
        icon: icons[key],
      };
    }).filter(item => item.entityId);
  }

  _wasteHtml(cfg, name, icon, picture) {
    const items = this._wasteItems(cfg).sort((a, b) => a.days - b.days);
    const next = items[0] || { name: 'Collection', shortName: 'Waste', days: Number.POSITIVE_INFINITY, state: 'Unknown', icon: 'mdi:trash-can-outline' };
    const others = items.slice(1).map(item => `${item.name}: ${daysText(item.days, item.state)}`);
    return `
      ${cfg.show_icon !== false ? `
        <div class="icon-wrap">
          ${picture ? `<img class="entity-picture" src="${escapeHtml(picture)}" alt="">` : `<ha-icon icon="${escapeHtml(icon || 'mdi:delete-empty')}"></ha-icon>`}
        </div>
      ` : ''}
      <div class="text">
        <div class="name">${escapeHtml(name)}</div>
        <div class="meta">Next collection</div>
        <div class="waste-other">${escapeHtml(others.length ? others.join(' · ') : 'No other waste collections found')}</div>
      </div>
      <div class="waste-next">
        <ha-icon icon="${escapeHtml(next.icon)}"></ha-icon>
        <div class="waste-next-name">${escapeHtml(next.shortName)}</div>
        <div class="waste-next-days">${escapeHtml(daysText(next.days, next.state))}</div>
      </div>
    `;
  }

  _doorItems(cfg) {
    return listValue(cfg.door_entities).map(entityId => {
      const stateObj = this._hass?.states?.[entityId];
      const state = String(stateObj?.state || '').toLowerCase();
      return {
        entityId,
        open: state === 'on' || state === 'open',
        available: stateObj && !['unknown', 'unavailable'].includes(state),
      };
    }).filter(item => item.entityId);
  }

  _lowDoorBatteryCount(cfg) {
    return listValue(cfg.door_battery_entities).reduce((count, entityId) => {
      const state = this._hass?.states?.[entityId]?.state;
      const parsed = Number.parseFloat(state);
      return Number.isFinite(parsed) && parsed < 10 ? count + 1 : count;
    }, 0);
  }

  _doorsHtml(cfg, name, icon, picture) {
    const doors = this._doorItems(cfg);
    const total = doors.length;
    const open = doors.filter(door => door.open).length;
    const lowBattery = this._lowDoorBatteryCount(cfg);
    const batteryText = lowBattery === 1
      ? '1 door needs battery replacement'
      : `${lowBattery} doors need battery replacement`;
    return `
      ${cfg.show_icon !== false ? `
        <div class="icon-wrap">
          ${picture ? `<img class="entity-picture" src="${escapeHtml(picture)}" alt="">` : `<ha-icon icon="${escapeHtml(icon || 'mdi:door')}"></ha-icon>`}
        </div>
      ` : ''}
      <div class="text">
        <div class="name">${escapeHtml(name)}</div>
        <div class="doors-pill"><span class="doors-dot"></span>${escapeHtml(`${total} Total`)}</div>
        <div class="doors-detail">${escapeHtml(batteryText)}</div>
      </div>
      <div class="doors-panel">
        ${open > 0
          ? `<div class="doors-count">${escapeHtml(open)}</div><div class="doors-label">Open</div>`
          : '<div class="doors-label">All closed</div>'}
      </div>
    `;
  }

  _lightItems(cfg) {
    return listValue(cfg.light_entities).map(entityId => {
      const stateObj = this._hass?.states?.[entityId];
      const state = String(stateObj?.state || '').toLowerCase();
      return {
        entityId,
        on: state === 'on',
        unavailable: !stateObj || ['unknown', 'unavailable'].includes(state),
      };
    }).filter(item => item.entityId);
  }

  _lightsHtml(cfg, name, icon, picture) {
    const lights = this._lightItems(cfg);
    const total = lights.length;
    const on = lights.filter(light => light.on).length;
    const unavailable = lights.filter(light => light.unavailable).length;
    const detail = unavailable === 0
      ? 'All lights available'
      : unavailable === 1
        ? '1 light needs attention'
        : `${unavailable} lights need attention`;
    return `
      ${cfg.show_icon !== false ? `
        <div class="icon-wrap">
          ${picture ? `<img class="entity-picture" src="${escapeHtml(picture)}" alt="">` : `<ha-icon icon="${escapeHtml(icon || 'mdi:lightbulb-group-outline')}"></ha-icon>`}
        </div>
      ` : ''}
      <div class="text">
        <div class="name">${escapeHtml(name)}</div>
        <div class="lights-pill"><span class="lights-dot"></span>${escapeHtml(`${total} Total`)}</div>
        <div class="lights-detail">${escapeHtml(detail)}</div>
      </div>
      <div class="lights-panel">
        ${on > 0
          ? `<div class="lights-count">${escapeHtml(on)}</div><div class="lights-label">On</div>`
          : '<div class="lights-label">All off</div>'}
      </div>
    `;
  }

  _isPresent(state) {
    if (!state) return false;
    const domain = String(state.entity_id || '').split('.')[0];
    const value = String(state.state || '').toLowerCase();
    if (domain === 'person' || domain === 'device_tracker') return value === 'home';
    if (domain === 'binary_sensor') return value === 'on';
    return value === 'home' || value === 'on';
  }

  _presenceFallbackIcon(state) {
    if (state?.attributes?.icon) return state.attributes.icon;
    const domain = String(state?.entity_id || '').split('.')[0];
    if (domain === 'binary_sensor') return 'mdi:motion-sensor';
    return 'mdi:account';
  }

  _presencePersonHtml(state) {
    const present = this._isPresent(state);
    const picture = state.attributes?.entity_picture;
    const name = state.attributes?.friendly_name || stateName(state.entity_id);
    const fallbackIcon = this._presenceFallbackIcon(state);
    return `<span class="presence-person${present ? '' : ' away'}" data-entity="${escapeHtml(state.entity_id)}" role="button" tabindex="0" title="${escapeHtml(name)}" aria-label="${escapeHtml(name)}">
      ${picture ? `<img class="presence-picture" src="${escapeHtml(picture)}" alt=""${this._config?.demo ? ' style="filter:blur(7px)"' : ''}>` : `<span class="presence-fallback"><ha-icon icon="${escapeHtml(fallbackIcon)}"></ha-icon></span>`}
    </span>`;
  }

  _presenceHtml(cfg, name, icon, picture) {
    const people = listValue(cfg.presence_entities)
      .map(entityId => this._hass?.states?.[entityId])
      .filter(Boolean);
    return `
      ${cfg.show_icon !== false ? `
        <div class="icon-wrap">
          ${picture ? `<img class="entity-picture" src="${escapeHtml(picture)}" alt="">` : `<ha-icon icon="${escapeHtml(icon || 'mdi:home-account')}"></ha-icon>`}
        </div>
      ` : ''}
      <div class="presence-people">
        ${people.length ? people.map(person => this._presencePersonHtml(person)).join('') : '<span class="presence-empty">No tracked entities</span>'}
      </div>
    `;
  }

  _attrValue(state, attribute) {
    // Empty attribute means the user hasn't requested any value — return ''
    // so empty primary/secondary rows simply don't render.
    if (!attribute) return '';
    // Sibling-entity reference (eg. "sensor.foo_battery"): resolve to that
    // entity's state via friendly-state. If the referenced entity is missing,
    // the user has requested data we can't provide → report "Unavailable".
    if (typeof attribute === 'string' && attribute.includes('.')) {
      const sibling = this._hass?.states?.[attribute];
      if (!sibling) return 'Unavailable';
      return friendlyState(sibling, this._hass);
    }
    // No base entity yet (still being picked) — don't preemptively shout
    // "Unavailable"; just stay empty until something is selected.
    if (!state) return '';
    if (attribute === 'state') return friendlyState(state, this._hass);
    // Synthetic: state + duration since last_changed (e.g. "Closed since
    // 2 days, 4 hours"). Works for any entity. The card re-renders on every
    // hass state update so the duration is refreshed frequently; for
    // long-idle entities we also tick once a minute (see _startSinceTicker).
    if (attribute === 'state_since') {
      const st = friendlyState(state, this._hass);
      const dur = longDuration(state.last_changed);
      return dur ? `${st} since ${dur}` : st;
    }
    const raw = state.attributes?.[attribute];
    // Attribute key picked but not present on the entity → genuine miss.
    if (raw === undefined || raw === null || raw === '') return 'Unavailable';
    if (Array.isArray(raw)) return raw.join(', ');
    if (typeof raw === 'object') return JSON.stringify(raw);
    return String(raw);
  }

  _genericHtml(cfg, name, icon, picture, primaryLine, descriptor) {
    const primaryState = cfg.primary_entity ? this._hass?.states?.[cfg.primary_entity] : null;
    // "Use primary entity as secondary" — when ticked, the secondary side reads
    // from the primary entity. Otherwise it uses its own secondary_entity.
    const secondaryId = cfg.secondary_use_primary ? cfg.primary_entity : cfg.secondary_entity;
    const secondaryState = secondaryId ? this._hass?.states?.[secondaryId] : null;
    const join = (prefix, attr, target) => {
      const p = String(prefix || '').trim();
      const a = attr ? this._attrValue(target, attr) : '';
      return [p, a].filter(Boolean).join(' ');
    };
    const secondaryValue = join(cfg.secondary_prefix, cfg.secondary_attribute, secondaryState);
    const secondaryDesc  = join(cfg.secondary_descriptor_prefix, cfg.secondary_descriptor_attribute, secondaryState);
    const secondaryIcon  = secondaryState?.attributes?.icon || '';
    // Right panel is driven SOLELY by what the user explicitly configured in
    // the Secondary section (prefix/attribute and/or descriptor). The entity
    // having an icon attribute is not enough to trigger a panel, and there is
    // NO automatic primary-state fallback — empty secondary means nothing on
    // the right.
    const showSecondaryPanel = !!(secondaryState && (secondaryValue || secondaryDesc));
    const rightPanel = showSecondaryPanel
      ? `
        <div class="generic-panel${cfg.show_divider === false ? ' no-divider' : ''}">
          ${secondaryIcon ? `<ha-icon class="generic-secondary-icon" icon="${escapeHtml(secondaryIcon)}"></ha-icon>` : ''}
          ${secondaryValue ? `<div class="generic-value">${escapeHtml(secondaryValue)}</div>` : ''}
          ${secondaryDesc ? `<div class="generic-label">${escapeHtml(secondaryDesc)}</div>` : ''}
        </div>`
      : '';
    // Primary line is either a plain meta row or a pill when the user opts in.
    const primaryHtml = primaryLine
      ? (cfg.primary_pill
          ? `<div class="primary-pill">${escapeHtml(primaryLine)}</div>`
          : `<div class="meta">${escapeHtml(primaryLine)}</div>`)
      : '';
    return `
      ${cfg.show_icon !== false ? `
        <div class="icon-wrap">
          ${picture ? `<img class="entity-picture" src="${escapeHtml(picture)}" alt="">` : `<ha-icon icon="${escapeHtml(icon)}"></ha-icon>`}
        </div>
      ` : ''}
      <div class="text">
        <div class="name">${escapeHtml(name)}</div>
        ${primaryHtml}
        ${descriptor ? `<div class="descriptor">${escapeHtml(descriptor)}</div>` : ''}
      </div>
      ${rightPanel}
    `;
  }

  _securityDoorState(cfg) {
    const door = cfg.door_entity ? this._hass?.states?.[cfg.door_entity] : null;
    const battery = cfg.door_battery_entity ? this._hass?.states?.[cfg.door_battery_entity] : null;
    const unknown = !door || ['unknown', 'unavailable'].includes(door.state);
    const open = door?.state === 'on' || door?.state === 'open';
    const state = unknown ? 'Unknown' : open ? 'Open' : 'Locked';
    const event = unknown ? 'Updated' : open ? 'Opened' : 'Closed';
    const changed = relativeTime(door?.last_changed);
    return { state, open, battery: batteryText(battery), event: `${event}${changed ? ` ${changed}` : ''}` };
  }

  _securityHtml(cfg) {
    const door = this._securityDoorState(cfg);
    const subItems = [
      door.battery ? `<span class="security-battery"><ha-icon icon="mdi:battery"></ha-icon>${escapeHtml(door.battery)}</span>` : '',
      `<span class="security-event">${escapeHtml(door.event)}</span>`,
    ].filter(Boolean);
    return `<div class="security-door">
      <div class="security-door-main">
        <span class="security-pill${door.open ? ' open' : ''}"><span class="security-dot"></span>${escapeHtml(door.state)}</span>
      </div>
      <div class="security-door-sub">${subItems.join('<span class="security-sep">·</span>')}</div>
    </div>`;
  }

  _securityPanelHtml(cfg) {
    const security = cfg.security_entity ? this._hass?.states?.[cfg.security_entity] : (cfg.entity ? this._hass?.states?.[cfg.entity] : null);
    const raw = String(security?.state || '');
    const normalized = raw.toLowerCase();
    const armed = normalized.includes('armed') && normalized !== 'disarmed';
    const label = raw ? prettyState(raw) : 'Unknown';
    const icon = armed ? cfg.security_armed_icon : cfg.security_disarmed_icon;
    return `<div class="security-panel ${armed ? 'armed' : 'disarmed'}">
      <ha-icon icon="${escapeHtml(icon)}"></ha-icon>
      <div class="security-panel-text">${escapeHtml(label)}</div>
    </div>`;
  }

  _handleTap() {
    const cfg = this._config;
    if (cfg.tap_action === 'navigate' && cfg.navigation_path) {
      history.pushState(null, '', cfg.navigation_path);
      fire(window, 'location-changed', { replace: false });
      return;
    }
    if (cfg.tap_action === 'toggle' && cfg.entity && this._hass) {
      this._hass.callService('homeassistant', 'toggle', { entity_id: cfg.entity });
      return;
    }
    if (cfg.tap_action === 'none') return;
    if (cfg.entity) fire(this, 'hass-more-info', { entityId: cfg.entity });
  }
}

class AveryModernCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    // Run the same legacy migration the card runtime uses so the editor's
    // section guards see the migrated variant (otherwise a stored `wide` card
    // would never reveal the Primary/Secondary/Display sections).
    this._config = migrateLegacyConfig(config);
    if (!this._rendered) this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) {
      this._render();
      return;
    }
    this.shadowRoot?.querySelectorAll('ha-entity-picker, ha-icon-picker').forEach(el => {
      el.hass = hass;
    });
  }

  _render() {
    if (!this.shadowRoot || !this._config) return;
    const cfg = this._config;
    const v = cfg.variant || 'tile';
    const showIn = list => list.includes(v);

    // Section visibility — keyed off the unified variant set.
    // Display / Badge / Background show for every rectangular variant; nav is
    // the only chip-style variant where they don't apply.
    const rectVariants = ['generic', 'square', 'security', 'doors', 'lights', 'waste', 'presence', 'title-room'];
    const sectionPrimary    = showIn(['generic', 'square']);
    const sectionSecondary  = showIn(['generic']);
    // Display + Badge use the entity-level toggles (show_state / show_icon /
    // badge) and the generic card chrome. title-room renders its own
    // bespoke layout via _roomHtml — none of those toggles change anything
    // for it, so the sections are hidden to cut editor noise.
    const sectionDisplay    = showIn(rectVariants.filter(v => v !== 'title-room'));
    const sectionBadge      = showIn(rectVariants.filter(v => v !== 'title-room'));
    const sectionSecurity   = showIn(['security']);
    const sectionDoors      = showIn(['doors']);
    const sectionLights     = showIn(['lights']);
    // Waste + Presence are aggregation lists owned by their own variants;
    // they have no effect on the title-room layout, so omit them.
    const sectionWaste      = showIn(['waste']);
    const sectionPresence   = showIn(['presence']);
    const sectionRoom       = showIn(['title-room']);
    const sectionTitleStyle = showIn(['title-room']);
    const sectionNav        = showIn(['nav']);
    const sectionBackground = !showIn(['nav']);

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font: 13px var(--primary-font-family, system-ui);
          color: var(--primary-text-color, #fff);
        }
        .grid { display: grid; gap: 14px; }
        .row {
          display: grid;
          grid-template-columns: minmax(120px, 38%) minmax(0, 1fr);
          gap: 10px;
          align-items: center;
        }
        .row > * { min-width: 0; max-width: 100%; }
        label { font-weight: 600; }
        .section {
          display: grid; gap: 10px;
          padding: 14px 14px 12px;
          border: 1px solid var(--divider-color, rgba(255,255,255,.12));
          border-radius: 12px;
          background: color-mix(in srgb, var(--primary-text-color, #fff) 3%, rgba(0,0,0,0));
          margin: 0;
        }
        .section-title {
          margin: 0 0 4px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .06em;
          color: color-mix(in srgb, var(--primary-text-color, #fff) 70%, rgba(0,0,0,0));
        }
        input, select {
          width: 100%;
          box-sizing: border-box;
          min-height: 34px;
          padding: 6px 10px;
          border-radius: 8px;
          border: 1px solid var(--divider-color, rgba(255,255,255,.12));
          background: color-mix(in srgb, var(--primary-text-color, #fff) 4%, rgba(0,0,0,0));
          color: inherit;
          font: inherit;
          transition: border-color .15s, background .15s;
        }
        input:focus, select:focus {
          outline: none;
          border-color: color-mix(in srgb, var(--primary-color, #5b9cf6) 70%, rgba(255,255,255,0.16));
          background: color-mix(in srgb, var(--primary-text-color, #fff) 6%, rgba(0,0,0,0));
        }
        input[type="checkbox"] {
          width: 20px; height: 20px; min-height: 0; padding: 0;
          justify-self: start; cursor: pointer;
          accent-color: var(--primary-color, #5b9cf6);
        }
        input[type="color"] { min-height: 38px; padding: 2px; cursor: pointer; }
        ha-entity-picker, ha-icon-picker { display: block; min-width: 0; width: 100%; max-width: 100%; }
        .actions { display: flex; gap: 8px; flex-wrap: wrap; }
        button {
          border: 1px solid var(--divider-color, rgba(255,255,255,.12));
          border-radius: 8px;
          background: color-mix(in srgb, var(--primary-text-color, #fff) 4%, rgba(0,0,0,0));
          color: var(--primary-text-color);
          padding: 8px 14px;
          font: inherit;
          font-weight: 700;
          cursor: pointer;
          transition: background .15s, border-color .15s;
        }
        button:hover {
          background: color-mix(in srgb, var(--primary-text-color, #fff) 8%, rgba(0,0,0,0));
        }
        button.primary {
          background: linear-gradient(135deg,
            color-mix(in srgb, #22c55e 75%, rgba(0,0,0,0)),
            color-mix(in srgb, #16a34a 75%, rgba(0,0,0,0)));
          color: #fff;
          border-color: color-mix(in srgb, #16a34a 50%, rgba(255,255,255,0.16));
        }
        button.primary:hover {
          background: linear-gradient(135deg, #22c55e, #16a34a);
        }
        .split { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; min-width: 0; }
        .split > * { min-width: 0; max-width: 100%; }
        .presence-row { align-items: start; }
        .presence-list { display: flex; flex-direction: column; gap: 6px; min-width: 0; }
        .presence-picker-row { display: grid; grid-template-columns: 1fr auto; gap: 6px; align-items: center; }
        .presence-picker-row.presence-add-row { grid-template-columns: 1fr; }
        .presence-remove {
          padding: 4px 12px;
          background: color-mix(in srgb, var(--error-color, #ef4444) 18%, rgba(0,0,0,0));
          border-color: color-mix(in srgb, var(--error-color, #ef4444) 40%, rgba(255,255,255,0.16));
        }
        .presence-remove:hover {
          background: color-mix(in srgb, var(--error-color, #ef4444) 28%, rgba(0,0,0,0));
        }
        .variant-help {
          font-size: 11.5px;
          line-height: 1.45;
          color: color-mix(in srgb, var(--primary-text-color, #fff) 60%, rgba(0,0,0,0));
          margin-top: 4px;
          grid-column: 2;
        }
        @media (max-width: 760px) {
          .row { grid-template-columns: 1fr; }
          .variant-help { grid-column: 1; }
          .split { grid-template-columns: 1fr; }
        }
      </style>
      <div class="grid">
        <div class="section grid">
          <div class="section-title">General</div>
          <div class="row"><label>Card type</label><select data-field="variant">
            ${['generic', 'square', 'security', 'doors', 'lights', 'waste', 'presence', 'title-room', 'nav'].map(opt => `<option value="${opt}" ${v === opt ? 'selected' : ''}>${opt}</option>`).join('')}
          </select></div>
          <div class="row"><label></label><div class="variant-help">${this._variantHelp(v)}</div></div>
          <div class="row"><label>Name</label><input data-field="name" value="${escapeHtml(cfg.name)}"></div>
          <div class="row"><label>Icon</label><ha-icon-picker data-field="icon"></ha-icon-picker></div>
          <div class="row"><label>Theme</label><select data-field="theme">
            ${['dashboard', 'dark', 'light'].map(opt => `<option value="${opt}" ${cfg.theme === opt ? 'selected' : ''}>${opt}</option>`).join('')}
          </select></div>
          ${v !== 'title-room' ? `<div class="row"><label>Tap action</label><select data-field="tap_action">
            ${['more-info', 'toggle', 'navigate', 'none'].map(opt => `<option value="${opt}" ${cfg.tap_action === opt ? 'selected' : ''}>${opt}</option>`).join('')}
          </select></div>` : ''}
          ${v !== 'title-room' && (cfg.tap_action === 'navigate' || sectionNav) ? `<div class="row"><label>Navigation path</label><input data-field="navigation_path" value="${escapeHtml(cfg.navigation_path)}" placeholder="/avery-dashboard/home"></div>` : ''}
        </div>

        ${sectionPrimary ? `
        <div class="section grid">
          <div class="section-title">Primary</div>
          <div class="row"><label>Primary entity</label><ha-entity-picker data-field="primary_entity"></ha-entity-picker></div>
          <div class="row"><label>Primary</label>
            <div class="split">
              <input data-field="primary_prefix" value="${escapeHtml(cfg.primary_prefix)}" placeholder="Prefix (optional)">
              ${this._attrSelectHtml('primary_attribute', cfg.primary_attribute, cfg.primary_entity)}
            </div>
          </div>
          <div class="row"><label>Show as pill</label><input type="checkbox" data-field="primary_pill" ${cfg.primary_pill ? 'checked' : ''}></div>
          <div class="row"><label>Pill border</label><input type="color" data-field="primary_pill_border" value="${escapeHtml(cfg.primary_pill_border || '#a78bfa')}"></div>
          <div class="row"><label>Pill fill</label><input type="color" data-field="primary_pill_fill" value="${escapeHtml(cfg.primary_pill_fill || '#a78bfa')}"></div>
          <div class="row"><label>Pill fill opacity (%)</label><input type="number" min="0" max="100" step="1" data-field="primary_pill_opacity" value="${escapeHtml(cfg.primary_pill_opacity === '' || cfg.primary_pill_opacity == null ? 18 : cfg.primary_pill_opacity)}"></div>
          <div class="row"><label>Pill corner radius (px)</label><input type="number" min="0" max="999" step="1" data-field="primary_pill_radius" value="${escapeHtml(cfg.primary_pill_radius === '' || cfg.primary_pill_radius == null ? 999 : cfg.primary_pill_radius)}"></div>
          <div class="row"><label>Descriptor</label>
            <div class="split">
              <input data-field="primary_descriptor_prefix" value="${escapeHtml(cfg.primary_descriptor_prefix)}" placeholder="Prefix (optional)">
              ${this._attrSelectHtml('primary_descriptor_attribute', cfg.primary_descriptor_attribute, cfg.primary_entity)}
            </div>
          </div>
        </div>` : ''}

        ${sectionSecondary ? `
        <div class="section grid">
          <div class="section-title">Secondary</div>
          <div class="row"><label>Same entity as primary</label><input type="checkbox" data-field="secondary_use_primary" ${cfg.secondary_use_primary ? 'checked' : ''}></div>
          ${cfg.secondary_use_primary ? '' : `<div class="row"><label>Secondary entity</label><ha-entity-picker data-field="secondary_entity"></ha-entity-picker></div>`}
          <div class="row"><label>Secondary</label>
            <div class="split">
              <input data-field="secondary_prefix" value="${escapeHtml(cfg.secondary_prefix)}" placeholder="Prefix (optional)">
              ${this._attrSelectHtml('secondary_attribute', cfg.secondary_attribute, cfg.secondary_use_primary ? cfg.primary_entity : cfg.secondary_entity)}
            </div>
          </div>
          <div class="row"><label>Descriptor</label>
            <div class="split">
              <input data-field="secondary_descriptor_prefix" value="${escapeHtml(cfg.secondary_descriptor_prefix)}" placeholder="Prefix (optional)">
              ${this._attrSelectHtml('secondary_descriptor_attribute', cfg.secondary_descriptor_attribute, cfg.secondary_use_primary ? cfg.primary_entity : cfg.secondary_entity)}
            </div>
          </div>
          <div class="row"><label>Show divider</label><input type="checkbox" data-field="show_divider" ${cfg.show_divider !== false ? 'checked' : ''}></div>
        </div>` : ''}

        ${sectionDisplay ? `
        <div class="section grid">
          <div class="section-title">Display</div>
          <div class="row"><label>Show state</label><input type="checkbox" data-field="show_state" ${cfg.show_state ? 'checked' : ''}></div>
          <div class="row"><label>Show icon</label><input type="checkbox" data-field="show_icon" ${cfg.show_icon !== false ? 'checked' : ''}></div>
          <div class="row"><label>Entity picture</label><input type="checkbox" data-field="show_entity_picture" ${cfg.show_entity_picture ? 'checked' : ''}></div>
          ${showIn(rectVariants) ? `<div class="row"><label>Lean (skew)</label><input type="checkbox" data-field="lean" ${cfg.lean ? 'checked' : ''}></div>` : ''}
          <div class="row"><label>Active</label><input type="checkbox" data-field="active" ${cfg.active ? 'checked' : ''}></div>
          <div class="row"><label>Hide glow</label><input type="checkbox" data-field="hide_glow" ${cfg.hide_glow ? 'checked' : ''}></div>
        </div>` : ''}

        ${sectionBadge ? `
        <div class="section grid">
          <div class="section-title">Badge</div>
          <div class="row"><label>Show badge</label><input type="checkbox" data-field="show_badge" ${cfg.show_badge ? 'checked' : ''}></div>
          <div class="row"><label>Badge entity</label><ha-entity-picker data-field="badge_entity"></ha-entity-picker></div>
          <div class="row"><label>Badge text</label>
            <div class="split">
              <input data-field="badge_text" value="${escapeHtml(cfg.badge_text)}" placeholder="Prefix (optional)">
              ${this._attrSelectHtml('badge_attribute', cfg.badge_attribute, cfg.badge_entity)}
            </div>
          </div>
        </div>` : ''}

        ${sectionSecurity ? `
        <div class="section grid">
          <div class="section-title">Security</div>
          <div class="row"><label>Security entity</label><ha-entity-picker data-field="security_entity"></ha-entity-picker></div>
          <div class="row"><label>Armed icon</label><ha-icon-picker data-field="security_armed_icon"></ha-icon-picker></div>
          <div class="row"><label>Disarmed icon</label><ha-icon-picker data-field="security_disarmed_icon"></ha-icon-picker></div>
          <div class="row"><label>Door entity</label><ha-entity-picker data-field="door_entity"></ha-entity-picker></div>
          <div class="row"><label>Door battery</label><ha-entity-picker data-field="door_battery_entity"></ha-entity-picker></div>
        </div>` : ''}

        ${sectionDoors ? `
        <div class="section grid">
          <div class="section-title">Doors</div>
          <div class="row"><label>Door entities</label><input data-field="door_entities" value="${escapeHtml(cfg.door_entities)}" placeholder="binary_sensor.front_door_contact,..."></div>
          <div class="row"><label>Door batteries</label><input data-field="door_battery_entities" value="${escapeHtml(cfg.door_battery_entities)}" placeholder="sensor.front_door_battery,..."></div>
        </div>` : ''}

        ${sectionLights ? `
        <div class="section grid">
          <div class="section-title">Lights</div>
          <div class="row"><label>Light entities</label><input data-field="light_entities" value="${escapeHtml(cfg.light_entities)}" placeholder="light.kitchen,light.living_room,..."></div>
        </div>` : ''}

        ${sectionWaste ? `
        <div class="section grid">
          <div class="section-title">Waste</div>
          <div class="row"><label>Waste entities</label><input data-field="waste_entities" value="${escapeHtml(cfg.waste_entities)}" placeholder="sensor.household_waste,sensor.recycling,sensor.garden_waste"></div>
        </div>` : ''}

        ${sectionPresence ? `
        <div class="section grid">
          <div class="section-title">Presence</div>
          <div class="row presence-row"><label>Presence entities</label><div class="presence-list"></div></div>
          <div class="row"><label>Presence icon size</label><input type="number" min="28" max="72" step="1" data-field="presence_icon_size" value="${escapeHtml(cfg.presence_icon_size || DEFAULT_CONFIG.presence_icon_size)}"></div>
          <div class="row"><label>Demo mode (blur photos)</label><input type="checkbox" data-field="demo" ${cfg.demo ? 'checked' : ''}></div>
        </div>` : ''}

        ${sectionRoom ? `
        <div class="section grid">
          <div class="section-title">Room sensors</div>
          <div class="row"><label>Room temperature</label><ha-entity-picker data-field="room_temperature_entity"></ha-entity-picker></div>
          <div class="row"><label>Room humidity</label><ha-entity-picker data-field="room_humidity_entity"></ha-entity-picker></div>
          <div class="row"><label>Door entity</label><ha-entity-picker data-field="door_entity"></ha-entity-picker></div>
          <div class="row"><label>Door battery</label><ha-entity-picker data-field="door_battery_entity"></ha-entity-picker></div>
        </div>` : ''}

        ${sectionTitleStyle ? `
        <div class="section grid">
          <div class="section-title">Title style</div>
          <div class="row"><label>Font family</label>
            <select data-field="title_font_family" class="font-select">
              ${this._fontFamilyOptions(cfg.title_font_family || '')}
            </select>
          </div>
          <div class="row"><label>Font size</label>
            <select data-field="title_font_size">
              ${this._fontSizeOptions(cfg.title_font_size || '')}
            </select>
          </div>
          <div class="row"><label>Colour mode</label><select data-field="title_color_mode">
            ${[
              ['theme',   'Theme colour'],
              ['static',  'Static gradient (your colours)'],
              ['random',  'Random gradient (fresh per load)'],
              ['dynamic', 'Dynamic gradient (moving)'],
            ].map(([val, label]) => `<option value="${val}" ${cfg.title_color_mode === val ? 'selected' : ''}>${label}</option>`).join('')}
          </select></div>
          <div class="row"><label>Flat colour</label><input type="color" data-field="title_color" value="${escapeHtml(cfg.title_color || '#ffffff')}"></div>
          <div class="row"><label>Gradient stop 1</label><input type="color" data-field="title_gradient_1" value="${escapeHtml(cfg.title_gradient_1 || '#a78bfa')}"></div>
          <div class="row"><label>Gradient stop 2</label><input type="color" data-field="title_gradient_2" value="${escapeHtml(cfg.title_gradient_2 || '#60a5fa')}"></div>
          <div class="row"><label>Gradient stop 3</label><input type="color" data-field="title_gradient_3" value="${escapeHtml(cfg.title_gradient_3 || '#22d3ee')}"></div>
          <div class="row"><label>Animation seconds</label><input type="number" min="1" max="60" step="1" data-field="title_animation_seconds" value="${escapeHtml(cfg.title_animation_seconds || 8)}"></div>
        </div>` : ''}

        ${sectionBackground ? `
        <div class="section grid">
          <div class="section-title">Background</div>
          <div class="row"><label>Background image</label><input data-field="background_image" value="${escapeHtml(cfg.background_image)}" placeholder="/local/images/example.jpeg"></div>
          <div class="row"><label>Background colour</label><input type="color" data-field="background_color" value="${escapeHtml(cfg.background_color || '#0d1322')}"></div>
          <div class="actions">
            <button type="button" data-reset="background_color">Clear background colour</button>
          </div>
        </div>` : ''}

        ${v !== 'title-room' ? `
        <div class="section grid">
          <div class="section-title">Colours</div>
          <div class="row"><label>Accent colour</label><input type="color" data-field="accent_color" value="${escapeHtml(cfg.accent_color || '#f97316')}"></div>
          <div class="row"><label>Glow colour 1</label><input type="color" data-field="glow_color_1" value="${escapeHtml(cfg.glow_color_1 || '#f97316')}"></div>
          <div class="row"><label>Glow colour 2</label><input type="color" data-field="glow_color_2" value="${escapeHtml(cfg.glow_color_2 || '#06b6d4')}"></div>
          <div class="row"><label>Glow colour 3</label><input type="color" data-field="glow_color_3" value="${escapeHtml(cfg.glow_color_3 || '#a855f7')}"></div>
          <div class="actions">
            <button type="button" class="primary" data-randomise>🎲 Randomise colours</button>
            <button type="button" data-reset="accent_color">Reset accent</button>
            <button type="button" data-reset="glow_color_1">Reset glow 1</button>
            <button type="button" data-reset="glow_color_2">Reset glow 2</button>
            <button type="button" data-reset="glow_color_3">Reset glow 3</button>
          </div>
        </div>` : ''}

        <div class="section grid">
          <div class="section-title">Dimensions</div>
          <div class="row"><label>Height</label><input data-field="height" value="${escapeHtml(cfg.height)}" placeholder="auto, 90px, 18vh"></div>
          <div class="row"><label>Corner radius</label><input type="number" min="0" max="48" data-field="corner_radius" value="${escapeHtml(cfg.corner_radius)}" placeholder="Theme default"></div>
        </div>
      </div>
    `;
    this.shadowRoot.querySelectorAll('ha-entity-picker, ha-icon-picker').forEach(el => {
      if (this._hass) el.hass = this._hass;
      const field = el.dataset.field;
      el.value = cfg[field] || '';
      el.addEventListener('value-changed', event => this._update(field, event.detail?.value || ''));
      el.addEventListener('change', event => this._update(field, event.detail?.value ?? event.target?.value ?? ''));
    });
    this.shadowRoot.querySelectorAll('input, select').forEach(el => {
      el.addEventListener('change', () => this._updateFromInput(el));
      if (el.type !== 'checkbox') el.addEventListener('input', () => this._updateFromInput(el, true));
    });
    this.shadowRoot.querySelectorAll('[data-reset]').forEach(button => {
      button.addEventListener('click', () => this._update(button.dataset.reset, ''));
    });
    const randomiseBtn = this.shadowRoot.querySelector('[data-randomise]');
    if (randomiseBtn) randomiseBtn.addEventListener('click', () => this._randomiseColours());
    if (sectionPresence) this._renderPresencePickers();
    this._rendered = true;
  }

  _attributesFor(entityId) {
    if (!entityId || !this._hass) return [];
    const stateObj = this._hass.states[entityId];
    if (!stateObj || !stateObj.attributes) return [];
    return Object.keys(stateObj.attributes).filter(k => !k.startsWith('_'));
  }

  _siblingEntitiesFor(entityId) {
    // Returns [{entity_id, label}] for every other entity registered to the
    // same device as `entityId`. Labels are derived by stripping the longest
    // common prefix across the device's entity ids, so a battery sensor on a
    // door device shows as "Battery" rather than the full id.
    if (!entityId || !this._hass) return [];
    const reg = this._hass.entities;
    if (!reg) return [];
    const parent = reg[entityId];
    if (!parent?.device_id) return [];
    const dev = parent.device_id;
    const sibIds = Object.keys(reg).filter(id => reg[id]?.device_id === dev && id !== entityId);
    if (!sibIds.length) return [];
    const localId = id => id.split('.').slice(1).join('.');
    const all = [entityId, ...sibIds].map(localId);
    let prefix = all[0];
    for (const id of all.slice(1)) {
      let i = 0;
      while (i < prefix.length && i < id.length && prefix[i] === id[i]) i++;
      prefix = prefix.slice(0, i);
    }
    return sibIds.map(id => {
      const local = localId(id);
      const tail = local.startsWith(prefix) ? local.slice(prefix.length) : local;
      const label = (tail || local).replace(/_/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase()) || local;
      return { entity_id: id, label };
    }).sort((a, b) => a.label.localeCompare(b.label));
  }

  _attrSelectOptions(current, entityId) {
    const attrs = this._attributesFor(entityId);
    const siblings = this._siblingEntitiesFor(entityId);
    const isOrphan = current && current !== 'state' && current !== 'state_since'
      && !attrs.includes(current)
      && !siblings.some(s => s.entity_id === current);
    const opts = [`<option value=""${!current ? ' selected' : ''}>—</option>`];
    if (entityId) {
      opts.push(`<optgroup label="This entity">`);
      opts.push(`<option value="state"${current === 'state' ? ' selected' : ''}>state</option>`);
      opts.push(`<option value="state_since"${current === 'state_since' ? ' selected' : ''}>state since last change</option>`);
      attrs.forEach(a => opts.push(`<option value="${escapeHtml(a)}"${current === a ? ' selected' : ''}>${escapeHtml(a)}</option>`));
      opts.push(`</optgroup>`);
    }
    if (siblings.length) {
      opts.push(`<optgroup label="Related entities (same device)">`);
      siblings.forEach(s => opts.push(`<option value="${escapeHtml(s.entity_id)}"${current === s.entity_id ? ' selected' : ''}>${escapeHtml(s.label)}</option>`));
      opts.push(`</optgroup>`);
    }
    if (isOrphan) {
      opts.push(`<option value="${escapeHtml(current)}" selected>${escapeHtml(current)} (not found)</option>`);
    }
    return opts.join('');
  }

  _attrSelectHtml(field, current, entityId) {
    return `<select data-field="${field}">${this._attrSelectOptions(current, entityId)}</select>`;
  }

  _refreshAttrSelect(field, entityId) {
    const sel = this.shadowRoot?.querySelector(`select[data-field="${field}"]`);
    if (!sel) return;
    const current = this._config[field] || '';
    sel.innerHTML = this._attrSelectOptions(current, entityId);
    // Keep the actual selection in sync (selected attr in option is just a hint)
    if (current) sel.value = current;
  }

  // Font choices for the title-room style picker. The `inline` style on each
  // <option> renders the option's preview in its own face — works in Chromium
  // and Safari; Firefox falls back to the platform font but the label still
  // names it clearly. Order: a clean default first, then sans / serif /
  // mono / display, then a few common system faces.
  _fontFamilyOptions(current) {
    const fonts = [
      { value: '', label: 'Default (theme font)', preview: 'inherit' },
      { value: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', label: 'System UI', preview: 'system-ui' },
      { value: 'Inter, system-ui, sans-serif', label: 'Inter', preview: 'Inter, system-ui, sans-serif' },
      { value: '"Helvetica Neue", Helvetica, Arial, sans-serif', label: 'Helvetica', preview: '"Helvetica Neue", Helvetica' },
      { value: 'Arial, sans-serif', label: 'Arial', preview: 'Arial' },
      { value: 'Verdana, Geneva, sans-serif', label: 'Verdana', preview: 'Verdana' },
      { value: 'Georgia, "Times New Roman", serif', label: 'Georgia', preview: 'Georgia, serif' },
      { value: '"Times New Roman", Times, serif', label: 'Times', preview: '"Times New Roman", Times, serif' },
      { value: '"Courier New", Courier, monospace', label: 'Courier', preview: '"Courier New", Courier, monospace' },
      { value: 'ui-rounded, "Hiragino Sans", sans-serif', label: 'Rounded', preview: 'ui-rounded, "Hiragino Sans", sans-serif' },
      { value: 'cursive', label: 'Cursive', preview: 'cursive' },
      { value: 'fantasy', label: 'Fantasy', preview: 'fantasy' },
    ];
    const isOrphan = current && !fonts.some(f => f.value === current);
    const out = fonts.map(f =>
      `<option value="${escapeHtml(f.value)}" style="font-family:${f.preview};font-size:14px" ${current === f.value ? 'selected' : ''}>${f.label}</option>`
    );
    if (isOrphan) out.push(`<option value="${escapeHtml(current)}" selected>${escapeHtml(current)} (custom)</option>`);
    return out.join('');
  }

  // Size picker — "Auto" maps to an empty value which the CSS rule falls back
  // through to clamp(46px, 7vw, 92px). Anything else is a flat px size.
  _fontSizeOptions(current) {
    const sizes = [
      { value: '',     label: 'Auto (scales with width)' },
      { value: '24px', label: '24px — Small' },
      { value: '32px', label: '32px' },
      { value: '40px', label: '40px — Medium' },
      { value: '52px', label: '52px' },
      { value: '64px', label: '64px — Large' },
      { value: '80px', label: '80px — Extra large' },
      { value: '100px', label: '100px — Huge' },
    ];
    const isOrphan = current && !sizes.some(s => s.value === current);
    const out = sizes.map(s =>
      `<option value="${escapeHtml(s.value)}" ${current === s.value ? 'selected' : ''}>${s.label}</option>`
    );
    if (isOrphan) out.push(`<option value="${escapeHtml(current)}" selected>${escapeHtml(current)} (custom)</option>`);
    return out.join('');
  }

  _variantHelp(v) {
    const helps = {
      generic: 'Workhorse tile — icon, name, primary readout (+ optional descriptor) in the middle, and either a secondary entity panel or the primary entity state on the right. Toggle Lean to skew it.',
      square: 'Square tile — icon at the top, name + readout below. Width pinned to height.',
      security: 'Security tile — door pill + alarm panel.',
      doors: 'Doors overview — open count + low-battery total across N door sensors.',
      lights: 'Lights overview — on count + unavailable total across N lights.',
      waste: 'Waste collection — next bin + countdown to the others.',
      presence: 'Presence row — circle avatars per person, coloured by home/away.',
      'title-room': 'Title-room — big name, temperature + humidity, optional door. Typography + a gradient title (flat / static / random / dynamic) configurable below.',
      nav: 'Navigation chip — icon + label, no entity, marks active page.',
    };
    return helps[v] || '';
  }

  _randomiseColours() {
    const rand = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    this._config.accent_color = rand();
    this._config.glow_color_1 = rand();
    this._config.glow_color_2 = rand();
    this._config.glow_color_3 = rand();
    this._fireEvent();
    this._rendered = false;
    this._render();
  }

  _renderPresencePickers() {
    const container = this.shadowRoot?.querySelector('.presence-list');
    if (!container) return;
    const entities = listValue(this._config.presence_entities);
    container.innerHTML = `
      ${entities.map((e, i) => `
        <div class="presence-picker-row" data-idx="${i}">
          <ha-entity-picker data-presence-idx="${i}"></ha-entity-picker>
          <button type="button" class="presence-remove" data-presence-remove="${i}" aria-label="Remove">✕</button>
        </div>
      `).join('')}
      <div class="presence-picker-row presence-add-row">
        <ha-entity-picker data-presence-idx="new"></ha-entity-picker>
      </div>
    `;
    entities.forEach((entityId, i) => {
      const picker = container.querySelector(`ha-entity-picker[data-presence-idx="${i}"]`);
      if (!picker) return;
      if (this._hass) picker.hass = this._hass;
      picker.includeDomains = ['person', 'device_tracker', 'binary_sensor'];
      picker.value = entityId;
      picker.addEventListener('value-changed', event => {
        const value = event.detail?.value || '';
        const list = listValue(this._config.presence_entities);
        if (!value) list.splice(i, 1);
        else list[i] = value;
        this._config.presence_entities = list.join(',');
        this._fireEvent();
        this._renderPresencePickers();
      });
    });
    const addPicker = container.querySelector('ha-entity-picker[data-presence-idx="new"]');
    if (addPicker) {
      if (this._hass) addPicker.hass = this._hass;
      addPicker.includeDomains = ['person', 'device_tracker', 'binary_sensor'];
      addPicker.value = '';
      addPicker.addEventListener('value-changed', event => {
        const value = event.detail?.value || '';
        if (!value) return;
        const list = listValue(this._config.presence_entities);
        if (!list.includes(value)) list.push(value);
        this._config.presence_entities = list.join(',');
        this._fireEvent();
        this._renderPresencePickers();
      });
    }
    container.querySelectorAll('[data-presence-remove]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.presenceRemove, 10);
        const list = listValue(this._config.presence_entities);
        list.splice(idx, 1);
        this._config.presence_entities = list.join(',');
        this._fireEvent();
        this._renderPresencePickers();
      });
    });
  }

  _updateFromInput(el, defer = false) {
    const field = el.dataset.field;
    if (!field) return;
    const value = el.type === 'checkbox' ? el.checked : el.value;
    this._update(field, value, defer);
  }

  _update(field, value, defer = false) {
    this._config[field] = value;
    if (defer) {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => this._fireEvent(), 180);
    } else {
      this._fireEvent();
    }
    if (field === 'variant' || field === 'tap_action') {
      this._rendered = false;
      this._render();
    } else if (field === 'primary_entity') {
      // Targeted dropdown refresh keeps the picker the user is typing into alive.
      this._refreshAttrSelect('primary_attribute', value);
      this._refreshAttrSelect('primary_descriptor_attribute', value);
      // If secondary is mirroring primary, its dropdowns follow.
      if (this._config.secondary_use_primary) {
        this._refreshAttrSelect('secondary_attribute', value);
        this._refreshAttrSelect('secondary_descriptor_attribute', value);
      }
    } else if (field === 'secondary_entity') {
      this._refreshAttrSelect('secondary_attribute', value);
      this._refreshAttrSelect('secondary_descriptor_attribute', value);
    } else if (field === 'badge_entity') {
      this._refreshAttrSelect('badge_attribute', value);
    } else if (field === 'secondary_use_primary') {
      // Show/hide the secondary entity picker — needs a re-render of the section.
      this._rendered = false;
      this._render();
    }
  }

  _fireEvent() {
    fire(this, 'config-changed', { config: { ...DEFAULT_CONFIG, ...this._config } });
  }
}

customElements.define('avery-modern-card', AveryModernCard);
customElements.define('avery-modern-card-editor', AveryModernCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({ preview: false,
  type: 'avery-modern-card',
  name: 'Avery Modern Card',
  description: 'Reusable Avery Modern tile, status and hero card with GUI configuration',
});
