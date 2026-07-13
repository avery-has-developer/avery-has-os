const PANEL_SELECT   = 'input_select.calendar_panel';
const EXPAND_BOOL    = 'input_boolean.calendar_expanded';

const CSS = `
  :host {
    display: block;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }

  .title-card {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 8px 0 8px 6px;
    background: transparent;
    backdrop-filter: none;
    border: none;
    border-radius: 0;
    box-shadow: none;
    overflow: visible;
  }
  .icon-wrap {
    position: relative;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }
  .glow {
    position: absolute;
    inset: -2px;
    border-radius: 14px;
    background: transparent;
    box-shadow: none;
  }
  .home-tile {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 14px;
    background: rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1), 0 0 24px -4px #2196F3, 0 0 34px -12px #64B5F6;
    border: 0;
    cursor: pointer;
  }
  .home-tile svg {
    width: 18px;
    height: 18px;
  }
  .text-col {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    line-height: 1.15;
  }
  .title {
    color: #fff;
    font-weight: 600;
    font-size: 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    font-size: 12px;
    color: #94a3b8;
    min-width: 0;
    white-space: nowrap;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(16,185,129,0.15);
    color: #6ee7b7;
    padding: 2px 8px;
    border-radius: 9999px;
    font-weight: 500;
    border: 1px solid rgba(52,211,153,0.2);
    flex-shrink: 0;
  }
  .chip.open {
    background: rgba(248,113,113,0.14);
    color: #fca5a5;
    border-color: rgba(248,113,113,0.25);
  }
  .dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: #34d399;
    box-shadow: 0 0 6px rgba(52,211,153,0.9);
  }
  .chip.open .dot {
    background: #f87171;
    box-shadow: 0 0 6px rgba(248,113,113,0.9);
  }
  .battery {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: #cbd5e1;
    flex-shrink: 0;
  }
  .event-text {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .meta-sep { color: #64748b; }
  @media (max-width: 480px) {
    .event-text { display: none; }
    .meta-sep { display: none; }
  }
  .hamburger {
    margin-left: 8px;
    width: 36px;
    height: 36px;
    border: 0;
    background: transparent;
    border-radius: 8px;
    color: #cbd5e1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background .15s, color .15s;
  }
  .hamburger:hover { background: rgba(255,255,255,0.05); color: #fff; }
  .hamburger.open { background: rgba(79,140,255,0.18); color: #7aadff; }

  /* ── Dropdown wrapper ── */
  .menu-wrap {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows .22s ease;
  }
  .menu-wrap.open { grid-template-rows: 1fr; }
  .menu-inner { overflow: hidden; }
  .menu { display: flex; flex-direction: column; gap: 3px; padding: 6px 0 6px; }

  /* ── Menu items ── */
  .item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 10px; border-radius: 10px; cursor: pointer;
    color: rgba(255,255,255,0.78); font-size: 13px; font-weight: 500;
    background: transparent; border: 1px solid transparent;
    transition: background .15s, border-color .15s;
    user-select: none;
  }
  .item:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.09); }
  .item.active { background: rgba(79,140,255,0.15); border-color: rgba(79,140,255,0.28); color: #fff; }
  .item .icon {
    width: 28px; height: 28px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.45);
    flex-shrink: 0;
    transition: background .15s, color .15s, box-shadow .15s;
  }
  .item:hover .icon { color: rgba(255,255,255,0.8); }
  .item.active .icon { background: #4f8cff; color: #fff; box-shadow: 0 0 14px rgba(79,140,255,.42); }
  .item .label { flex: 1; }
  .item .chevron { color: rgba(255,255,255,0.28); transition: transform .22s ease; flex-shrink: 0; }
  .item.submenu-open .chevron { transform: rotate(90deg); }

  /* ── Rooms submenu ── */
  .submenu-wrap {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows .22s ease;
  }
  .submenu-wrap.open { grid-template-rows: 1fr; }
  .submenu-inner { overflow: hidden; }
  .submenu {
    display: flex; flex-direction: column; gap: 2px;
    padding: 3px 0 5px 10px;
    margin: 0 4px 2px 16px;
    border-left: 2px solid rgba(79,140,255,0.35);
  }
  .room-btn {
    display: flex; align-items: center; gap: 8px;
    padding: 7px 10px; border-radius: 8px; cursor: pointer;
    color: rgba(255,255,255,0.68); font-size: 12.5px; font-weight: 500;
    background: transparent; border: 1px solid transparent;
    transition: background .15s, color .15s, border-color .15s;
    user-select: none;
  }
  .room-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }
  .room-btn.active { background: rgba(79,140,255,0.13); border-color: rgba(79,140,255,0.25); color: #fff; }
  .room-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: rgba(255,255,255,0.28); flex-shrink: 0;
    transition: background .15s, transform .15s, box-shadow .15s;
  }
  .room-btn.active .room-dot {
    background: #4f8cff;
    transform: scale(1.4);
    box-shadow: 0 0 8px rgba(79,140,255,.5);
  }

  .divider { height: 1px; background: rgba(255,255,255,0.07); margin: 4px 2px; }
`;

const IC = {
  hamburger: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,
  close:     `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  titleHome: `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>`,
  battery:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>`,
  home:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5L12 4l9 7.5"/><path d="M5 10v10h14V10"/></svg>`,
  rooms:     `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  grocery:   `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h2l2.4 12.2a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 2-1.5L22 7H6"/><circle cx="9" cy="21" r="1.5"/><circle cx="18" cy="21" r="1.5"/></svg>`,
  todo:      `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3 8-8"/><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/></svg>`,
  calendar:  `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4.5" width="18" height="17" rx="3"/><path d="M3 9.5h18"/><path d="M8 3v3M16 3v3"/></svg>`,
  chevron:   `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
};

const ROOMS = ['Living Room'];

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

class AveryDividerCard extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._hass = null;
    this._config = {};
    this._panelState = null;
    this._open = false;
    this._roomsOpen = false;
    this._lastNav = 'home'; // 'home' | 'room:Living Room' | 'grocery' | 'todo' | 'calendar'
    this._built = false;
  }

  setConfig(config) {
    this._config = config || {};
  }

  set hass(hass) {
    this._hass = hass;
    const s = hass.states[PANEL_SELECT]?.state;
    if (!this._built || s !== this._panelState) {
      this._panelState = s;
      this._render();
    }
  }

  getCardSize() { return 1; }

  _setPanel(value, nav, expand = false) {
    this._lastNav = nav;
    this._hass.callService('input_select', 'select_option', { entity_id: PANEL_SELECT, option: value });
    this._hass.callService('input_boolean', expand ? 'turn_on' : 'turn_off', { entity_id: EXPAND_BOOL });
    this._open = false;
    this._roomsOpen = false;
    this._render();
  }

  _toggleMenu() {
    this._open = !this._open;
    if (!this._open) this._roomsOpen = false;
    this._updateMenuState();
  }

  _toggleRooms(e) {
    e.stopPropagation();
    this._roomsOpen = !this._roomsOpen;
    this._updateRoomsState();
  }

  // Light DOM updates (no full re-render) for toggle actions
  _updateMenuState() {
    const sh = this._shadow;
    const btn  = sh.querySelector('.hamburger');
    const wrap = sh.querySelector('.menu-wrap');
    if (btn)  { btn.classList.toggle('open', this._open); btn.innerHTML = this._open ? IC.close : IC.hamburger; }
    if (wrap) wrap.classList.toggle('open', this._open);
    if (!this._open) this._updateRoomsState();
  }

  _updateRoomsState() {
    const sh = this._shadow;
    const roomsItem = sh.querySelector('.rooms-item');
    const roomsWrap = sh.querySelector('.submenu-wrap');
    if (roomsItem) roomsItem.classList.toggle('submenu-open', this._roomsOpen);
    if (roomsWrap) roomsWrap.classList.toggle('open', this._roomsOpen);
  }

  _isRoomActive(room) {
    return this._lastNav === `room:${room}` && this._panelState === 'Calendar';
  }

  _isHomeActive() {
    return this._lastNav === 'home' && this._panelState === 'Calendar';
  }

  _render() {
    this._built = true;
    const cfg  = this._config;
    const icon = cfg.icon || 'mdi:home';
    const cur  = this._panelState;
    const name = cfg.dynamic_name
      ? (cur === 'Todo' ? 'To Do' : cur === 'Shopping' ? 'Shopping List' : (cfg.name || 'Calendar'))
      : (cfg.name || '');
    const homeActive = this._isHomeActive();
    const calActive  = this._lastNav === 'calendar' && cur === 'Calendar';
    const roomsRowActive = ROOMS.some(r => this._isRoomActive(r));
    const door = this._hass?.states['binary_sensor.front_door_contact'];
    const battery = this._hass?.states['sensor.front_door_battery'];
    const doorOpen = door?.state === 'on';
    const doorUnavailable = !door || door.state === 'unavailable' || door.state === 'unknown';
    const statusText = doorUnavailable ? 'Unknown' : doorOpen ? 'Open' : 'Locked';
    const eventVerb = doorUnavailable ? 'Updated' : doorOpen ? 'Opened' : 'Closed';
    const eventTime = relativeTime(door?.last_changed);
    const batteryText = battery && !['unknown', 'unavailable'].includes(battery.state) ? `${parseInt(battery.state, 10)}%` : '--%';

    const roomsHtml = ROOMS.map(room => `
      <div class="room-btn${this._isRoomActive(room) ? ' active' : ''}" data-room="${room}">
        <span class="room-dot"></span>${room}
      </div>`).join('');

    this._shadow.innerHTML = `<style>${CSS}</style>
      <div class="title-card">
        <div class="icon-wrap">
          <div class="glow"></div>
          <div class="home-tile">${IC.titleHome}</div>
        </div>
        <div class="text-col">
          <span class="title">${name}</span>
          <div class="meta">
            <span class="chip${doorOpen ? ' open' : ''}"><span class="dot"></span>${statusText}</span>
            <span class="battery">${IC.battery}${batteryText}</span>
            <span class="meta-sep">·</span>
            <span class="event-text">${eventVerb}${eventTime ? ` ${eventTime}` : ''}</span>
          </div>
        </div>
        <div class="hamburger${this._open ? ' open' : ''}">${this._open ? IC.close : IC.hamburger}</div>
      </div>
      <div class="menu-wrap${this._open ? ' open' : ''}">
        <div class="menu-inner"><div class="menu">

          <div class="item${homeActive ? ' active' : ''}" data-nav="home">
            <div class="icon">${IC.home}</div>
            <span class="label">Home</span>
          </div>

          <div class="item rooms-item${roomsRowActive ? ' active' : ''}${this._roomsOpen ? ' submenu-open' : ''}">
            <div class="icon">${IC.rooms}</div>
            <span class="label">Rooms</span>
            <span class="chevron">${IC.chevron}</span>
          </div>
          <div class="submenu-wrap${this._roomsOpen ? ' open' : ''}">
            <div class="submenu-inner">
              <div class="submenu">${roomsHtml}</div>
            </div>
          </div>

          <div class="divider"></div>

          <div class="item${cur === 'Shopping' ? ' active' : ''}" data-nav="grocery">
            <div class="icon">${IC.grocery}</div>
            <span class="label">Grocery List</span>
          </div>

          <div class="item${cur === 'Todo' ? ' active' : ''}" data-nav="todo">
            <div class="icon">${IC.todo}</div>
            <span class="label">ToDo List</span>
          </div>

          <div class="item${calActive ? ' active' : ''}" data-nav="calendar">
            <div class="icon">${IC.calendar}</div>
            <span class="label">Calendar</span>
          </div>

        </div></div>
      </div>`;

    // Wire tile → navigate home (always collapses calendar expanded view)
    this._shadow.querySelector('.home-tile')
      .addEventListener('click', () => this._setPanel('Calendar', 'home', false));

    // Wire hamburger
    this._shadow.querySelector('.hamburger')
      .addEventListener('click', () => this._toggleMenu());

    // Wire top-level items
    this._shadow.querySelectorAll('.item[data-nav]').forEach(el => {
      el.addEventListener('click', () => {
        const nav = el.dataset.nav;
        if (nav === 'home')     this._setPanel('Calendar', 'home');
        if (nav === 'grocery')  this._setPanel('Shopping', 'grocery');
        if (nav === 'todo')     this._setPanel('Todo', 'todo');
        if (nav === 'calendar') this._setPanel('Calendar', 'calendar', true);
      });
    });

    // Wire Rooms toggle (no data-nav)
    this._shadow.querySelector('.rooms-item')
      .addEventListener('click', (e) => this._toggleRooms(e));

    // Wire room buttons
    this._shadow.querySelectorAll('.room-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._setPanel('Calendar', `room:${btn.dataset.room}`);
      });
    });
  }
}

customElements.define('avery-divider-card', AveryDividerCard);
window.customCards = window.customCards || [];
window.customCards.push({ preview: false, type: 'avery-divider-card', name: 'Avery Divider Card' });
