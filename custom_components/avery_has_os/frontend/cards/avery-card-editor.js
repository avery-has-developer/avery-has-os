// Avery shared card-editor toolkit.
// Gives every card's config editor the same sectioned layout and the same generic
// option groups (Colours, Dimensions, Theme) so editors stop drifting apart.
// A card composes its own sections + these shared ones, then calls bindEditor() to
// wire all the inputs/pickers/randomise/reset in one go.

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
}

// Standard Avery (doors) gradient defaults — used for placeholders + reset.
export const AV_COLOR_DEFAULTS = {
  accent_color: '#f97316',
  glow_color_1: '#f97316',
  glow_color_2: '#06b6d4',
  glow_color_3: '#a855f7',
};

export const AV_EDITOR_CSS = `
  :host { display: block; padding: 8px 0; }
  .av-ed-section { border: 1px solid var(--divider-color, rgba(255,255,255,.12)); border-radius: 10px; padding: 12px 14px; margin-bottom: 12px; }
  .av-ed-title { color: var(--primary-text-color); font-size: 13px; font-weight: 800; margin: 0 0 10px; text-transform: uppercase; letter-spacing: .04em; }
  .av-ed-row { display: grid; grid-template-columns: minmax(120px, 38%) minmax(0, 1fr); gap: 12px; align-items: center; margin-bottom: 10px; }
  .av-ed-row:last-child { margin-bottom: 0; }
  .av-ed-row:has(avery-entities-chips) { align-items: start; padding-top: 2px; }
  .av-ed-row label { color: var(--secondary-text-color); font-size: 12px; font-weight: 700; }
  .av-ed-row:has(avery-entities-chips) label { padding-top: 9px; }
  .av-ed-row input, .av-ed-row select { width: 100%; box-sizing: border-box; min-height: 34px; padding: 6px 9px; border-radius: 8px; border: 1px solid var(--divider-color); background: var(--card-background-color); color: var(--primary-text-color); font: inherit; }
  .av-ed-row input[type="checkbox"] { width: 20px; height: 20px; min-height: 0; padding: 0; justify-self: start; cursor: pointer; }
  .av-ed-row input[type="color"] { min-height: 34px; padding: 2px; cursor: pointer; }
  .av-ed-hint { color: var(--secondary-text-color); font-size: 11px; margin: -4px 0 10px; }
  .av-ed-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  .av-ed-btn { height: 32px; padding: 0 12px; border-radius: 8px; border: 1px solid var(--divider-color, rgba(255,255,255,.12)); background: rgba(255,255,255,.06); color: var(--primary-text-color); font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
  .av-ed-btn:hover { background: rgba(255,255,255,.12); }
  .av-ed-btn.primary { background: linear-gradient(135deg, #a78bfa 0%, #818cf8 55%, #60a5fa 100%); color: #fff; border-color: rgba(255,255,255,.22); }
`;

// ---- AveryEntitiesChips — chip + search selector custom element ----------
// Renders selected entities as removable chips and a live-search input that
// filters hass.states by domain. Fires value-changed with an array of entity IDs.

const _esc = escapeHtml;

class AveryEntitiesChips extends HTMLElement {
  constructor() {
    super();
    this._value = [];
    this._hass = null;
    this._domains = [];
    this._deviceClasses = [];
    this._search = '';
    this._open = false;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._renderShell(); }

  set value(v) {
    this._value = Array.isArray(v) ? [...v] : [];
    this._renderChips();
  }
  get value() { return this._value; }

  set hass(h) { this._hass = h; }

  set includeDomains(d) {
    this._domains = Array.isArray(d) ? d : (d ? [d] : []);
  }

  set deviceClasses(dc) {
    this._deviceClasses = Array.isArray(dc) ? dc : (dc ? [dc] : []);
  }

  _emit() {
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: [...this._value] },
      bubbles: true, composed: true,
    }));
  }

  _add(entityId) {
    if (!entityId || this._value.includes(entityId)) return;
    this._value = [...this._value, entityId];
    this._search = '';
    const inp = this.shadowRoot.querySelector('#inp');
    if (inp) inp.value = '';
    this._renderChips();
    this._renderDrop(); // keep open so user can immediately pick another
    this._emit();
  }

  _remove(entityId) {
    this._value = this._value.filter(id => id !== entityId);
    this._renderChips();
    this._emit();
  }

  _renderShell() {
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .wrap { display: flex; flex-direction: column; gap: 6px; }
        .chips { display: flex; flex-wrap: wrap; gap: 5px; }
        .chip {
          display: inline-flex; align-items: center; gap: 3px;
          padding: 3px 5px 3px 10px; border-radius: 20px;
          background: rgba(var(--rgb-primary-color, 3,169,244), .12);
          border: 1px solid var(--primary-color, #6366f1);
          font-size: 12px; font-weight: 600; color: var(--primary-color, #6366f1);
        }
        .chip-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }
        .chip-rm {
          background: none; border: none; color: inherit; cursor: pointer;
          padding: 0 3px; font-size: 16px; line-height: 1; opacity: .65; flex-shrink: 0;
        }
        .chip-rm:hover { opacity: 1; }
        .search { position: relative; }
        .search input {
          width: 100%; box-sizing: border-box; padding: 7px 10px; border-radius: 8px;
          border: 1px solid var(--divider-color, rgba(255,255,255,.12));
          background: var(--card-background-color, #1c1c2e);
          color: var(--primary-text-color, #fff); font: inherit; font-size: 13px; outline: none;
        }
        .search input:focus { border-color: var(--primary-color, #6366f1); }
        .drop {
          position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 9999;
          background: var(--card-background-color, #1c1c2e);
          border: 1px solid var(--primary-color, #6366f1);
          border-radius: 8px; max-height: 200px; overflow-y: auto;
          box-shadow: 0 8px 24px rgba(0,0,0,.5);
        }
        .opt { padding: 8px 12px; cursor: pointer; }
        .opt:hover { background: rgba(var(--rgb-primary-color, 3,169,244), .12); }
        .opt-name { font-size: 13px; font-weight: 500; color: var(--primary-text-color, #fff); }
        .opt-id { font-size: 11px; color: var(--secondary-text-color, rgba(255,255,255,.55)); margin-top: 1px; }
        .no-results { padding: 10px 12px; font-size: 13px; color: var(--secondary-text-color, rgba(255,255,255,.55)); }
      </style>
      <div class="wrap">
        <div class="chips" id="chips"></div>
        <div class="search">
          <input type="text" id="inp" placeholder="Search and add entities…" autocomplete="off">
          <div class="drop" id="drop" style="display:none"></div>
        </div>
      </div>
    `;
    const inp  = this.shadowRoot.querySelector('#inp');
    const drop = this.shadowRoot.querySelector('#drop');
    inp.addEventListener('focus', () => { this._open = true; this._renderDrop(); });
    inp.addEventListener('blur',  () => { setTimeout(() => { this._open = false; drop.style.display = 'none'; }, 150); });
    inp.addEventListener('input', e => { this._search = e.target.value; this._renderDrop(); });
    this._renderChips();
  }

  _renderChips() {
    const el = this.shadowRoot.querySelector('#chips');
    if (!el) return;
    el.innerHTML = this._value.map(id => {
      const name = this._hass?.states?.[id]?.attributes?.friendly_name || id;
      return `<span class="chip">
        <span class="chip-name" title="${_esc(id)}">${_esc(name)}</span>
        <button class="chip-rm" data-rm="${_esc(id)}" type="button" aria-label="Remove">×</button>
      </span>`;
    }).join('');
    el.querySelectorAll('.chip-rm').forEach(b =>
      b.addEventListener('click', () => this._remove(b.dataset.rm))
    );
  }

  _renderDrop() {
    const drop = this.shadowRoot.querySelector('#drop');
    if (!drop) return;
    if (!this._open || !this._hass) { drop.style.display = 'none'; return; }
    const term     = this._search.toLowerCase();
    const selected = new Set(this._value);
    const domains  = this._domains;
    const dcs = this._deviceClasses;
    const results  = Object.values(this._hass.states)
      .filter(s => {
        if (selected.has(s.entity_id)) return false;
        if (domains.length && !domains.includes(s.entity_id.split('.')[0])) return false;
        if (dcs.length && !dcs.includes(s.attributes?.device_class)) return false;
        if (!term) return true;
        const name = (s.attributes.friendly_name || s.entity_id).toLowerCase();
        return name.includes(term) || s.entity_id.includes(term);
      })
      .sort((a, b) =>
        (a.attributes.friendly_name || a.entity_id)
          .localeCompare(b.attributes.friendly_name || b.entity_id)
      )
      .slice(0, 25);

    if (!results.length) {
      drop.innerHTML = `<div class="no-results">No results</div>`;
    } else {
      drop.innerHTML = results.map(s => {
        const name = s.attributes.friendly_name || s.entity_id;
        return `<div class="opt" data-eid="${_esc(s.entity_id)}">
          <div class="opt-name">${_esc(name)}</div>
          <div class="opt-id">${_esc(s.entity_id)}</div>
        </div>`;
      }).join('');
      drop.querySelectorAll('.opt[data-eid]').forEach(el =>
        el.addEventListener('mousedown', e => { e.preventDefault(); this._add(el.dataset.eid); })
      );
    }
    drop.style.display = 'block';
  }

  _closeDrop() {
    const drop = this.shadowRoot.querySelector('#drop');
    if (drop) drop.style.display = 'none';
  }
}

if (!customElements.get('avery-entities-chips'))
  customElements.define('avery-entities-chips', AveryEntitiesChips);

// ---- AveryDeviceChips — device-level chip selector -------------------------
// Stores device IDs. Dropdown shows device names, filtered to devices that
// have at least one entity matching requireDomain + requireDeviceClass.
// Chips show the device's friendly name.

const CHIP_CSS = `
  :host { display: block; }
  .wrap { display: flex; flex-direction: column; gap: 6px; }
  .chips { display: flex; flex-wrap: wrap; gap: 5px; }
  .chip {
    display: inline-flex; align-items: center; gap: 3px;
    padding: 3px 5px 3px 10px; border-radius: 20px;
    background: rgba(var(--rgb-primary-color,3,169,244),.12);
    border: 1px solid var(--primary-color,#6366f1);
    font-size: 12px; font-weight: 600; color: var(--primary-color,#6366f1);
  }
  .chip-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; }
  .chip-rm {
    background: none; border: none; color: inherit; cursor: pointer;
    padding: 0 3px; font-size: 16px; line-height: 1; opacity: .65; flex-shrink: 0;
  }
  .chip-rm:hover { opacity: 1; }
  .search { position: relative; }
  .search input {
    width: 100%; box-sizing: border-box; padding: 7px 10px; border-radius: 8px;
    border: 1px solid var(--divider-color,rgba(255,255,255,.12));
    background: var(--card-background-color,#1c1c2e);
    color: var(--primary-text-color,#fff); font: inherit; font-size: 13px; outline: none;
  }
  .search input:focus { border-color: var(--primary-color,#6366f1); }
  .drop {
    position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 9999;
    background: var(--card-background-color,#1c1c2e);
    border: 1px solid var(--primary-color,#6366f1);
    border-radius: 8px; max-height: 200px; overflow-y: auto;
    box-shadow: 0 8px 24px rgba(0,0,0,.5);
  }
  .opt { padding: 8px 12px; cursor: pointer; }
  .opt:hover { background: rgba(var(--rgb-primary-color,3,169,244),.12); }
  .opt-name { font-size: 13px; font-weight: 500; color: var(--primary-text-color,#fff); }
  .opt-sub  { font-size: 11px; color: var(--secondary-text-color,rgba(255,255,255,.55)); margin-top: 1px; }
  .no-results { padding: 10px 12px; font-size: 13px; color: var(--secondary-text-color,rgba(255,255,255,.55)); }
`;

class AveryDeviceChips extends HTMLElement {
  constructor() {
    super();
    this._value = [];        // array of device IDs
    this._hass = null;
    this._requireDomain = '';
    this._requireDeviceClasses = [];
    this._search = '';
    this._open = false;
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this._renderShell(); }

  set value(v) {
    this._value = Array.isArray(v) ? [...v] : [];
    this._renderChips();
  }
  get value() { return this._value; }

  set hass(h) { this._hass = h; }

  set requireDomain(d) { this._requireDomain = d || ''; }
  set requireDeviceClasses(dc) {
    this._requireDeviceClasses = Array.isArray(dc) ? dc : (dc ? String(dc).split(',') : []);
  }

  _devName(deviceId) {
    const d = this._hass?.devices?.[deviceId];
    return d ? (d.name_by_user || d.name || deviceId) : deviceId;
  }

  // Returns { deviceId → deviceName } for devices that have at least one
  // entity matching the domain + device_class constraints.
  _candidateDevices() {
    const hass = this._hass;
    if (!hass?.entities || !hass?.devices) return {};
    const out = {};
    for (const s of Object.values(hass.states)) {
      if (this._requireDomain && !s.entity_id.startsWith(this._requireDomain + '.')) continue;
      if (this._requireDeviceClasses.length && !this._requireDeviceClasses.includes(s.attributes?.device_class)) continue;
      const reg = hass.entities[s.entity_id];
      if (!reg?.device_id) continue;
      const dev = hass.devices[reg.device_id];
      if (!dev) continue;
      out[reg.device_id] = dev.name_by_user || dev.name || reg.device_id;
    }
    return out;
  }

  _emit() {
    this.dispatchEvent(new CustomEvent('value-changed', {
      detail: { value: [...this._value] },
      bubbles: true, composed: true,
    }));
  }

  _add(deviceId) {
    if (!deviceId || this._value.includes(deviceId)) return;
    this._value = [...this._value, deviceId];
    this._search = '';
    const inp = this.shadowRoot.querySelector('#inp');
    if (inp) inp.value = '';
    this._renderChips();
    this._renderDrop();
    this._emit();
  }

  _remove(deviceId) {
    this._value = this._value.filter(id => id !== deviceId);
    this._renderChips();
    this._emit();
  }

  _renderShell() {
    this.shadowRoot.innerHTML = `
      <style>${CHIP_CSS}</style>
      <div class="wrap">
        <div class="chips" id="chips"></div>
        <div class="search">
          <input type="text" id="inp" placeholder="Search devices…" autocomplete="off">
          <div class="drop" id="drop" style="display:none"></div>
        </div>
      </div>
    `;
    const inp  = this.shadowRoot.querySelector('#inp');
    const drop = this.shadowRoot.querySelector('#drop');
    inp.addEventListener('focus', () => { this._open = true; this._renderDrop(); });
    inp.addEventListener('blur',  () => { setTimeout(() => { this._open = false; drop.style.display = 'none'; }, 150); });
    inp.addEventListener('input', e => { this._search = e.target.value; this._renderDrop(); });
    this._renderChips();
  }

  _renderChips() {
    const el = this.shadowRoot.querySelector('#chips');
    if (!el) return;
    el.innerHTML = this._value.map(id => {
      const name = this._devName(id);
      return `<span class="chip">
        <span class="chip-name" title="${_esc(id)}">${_esc(name)}</span>
        <button class="chip-rm" data-rm="${_esc(id)}" type="button" aria-label="Remove">×</button>
      </span>`;
    }).join('');
    el.querySelectorAll('.chip-rm').forEach(b =>
      b.addEventListener('click', () => this._remove(b.dataset.rm))
    );
  }

  _renderDrop() {
    const drop = this.shadowRoot.querySelector('#drop');
    if (!drop) return;
    if (!this._open || !this._hass) { drop.style.display = 'none'; return; }
    const term      = this._search.toLowerCase();
    const selected  = new Set(this._value);
    const candidates = this._candidateDevices();

    const results = Object.entries(candidates)
      .filter(([id, name]) => !selected.has(id) && (!term || name.toLowerCase().includes(term)))
      .sort(([, a], [, b]) => a.localeCompare(b))
      .slice(0, 25);

    if (!results.length) {
      drop.innerHTML = `<div class="no-results">${this._hass.entities ? 'No matching devices' : 'Device registry not available'}</div>`;
    } else {
      drop.innerHTML = results.map(([id, name]) =>
        `<div class="opt" data-did="${_esc(id)}">
          <div class="opt-name">${_esc(name)}</div>
          <div class="opt-sub">${_esc(id)}</div>
        </div>`
      ).join('');
      drop.querySelectorAll('.opt[data-did]').forEach(el =>
        el.addEventListener('mousedown', e => { e.preventDefault(); this._add(el.dataset.did); })
      );
    }
    drop.style.display = 'block';
  }
}

if (!customElements.get('avery-device-chips'))
  customElements.define('avery-device-chips', AveryDeviceChips);

// ---- HTML builders -------------------------------------------------------

export function section(title, inner) {
  return `<div class="av-ed-section"><div class="av-ed-title">${escapeHtml(title)}</div>${inner}</div>`;
}
export function row(label, inner) {
  return `<div class="av-ed-row"><label>${escapeHtml(label)}</label>${inner}</div>`;
}
export function hint(text) {
  return `<div class="av-ed-hint">${text}</div>`;
}
export function textField(field, cfg, placeholder = '') {
  return `<input data-field="${field}" value="${escapeHtml(cfg[field] || '')}" placeholder="${escapeHtml(placeholder)}">`;
}
export function numberField(field, cfg, { min = 0, max = 999, placeholder = '' } = {}) {
  return `<input type="number" min="${min}" max="${max}" data-field="${field}" value="${cfg[field] ?? ''}" placeholder="${escapeHtml(placeholder)}">`;
}
export function checkboxField(field, cfg, def = false) {
  const on = cfg[field] === undefined ? def : !!cfg[field];
  return `<input type="checkbox" data-field="${field}" ${on ? 'checked' : ''}>`;
}
export function colorField(field, cfg, def) {
  return `<input type="color" data-field="${field}" value="${escapeHtml(cfg[field] || def || '#000000')}">`;
}
export function selectField(field, cfg, options) {
  return `<select data-field="${field}">${options.map(o => `<option value="${escapeHtml(o)}" ${cfg[field] === o ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('')}</select>`;
}
export function entityPicker(field, domains) {
  return `<ha-entity-picker data-field="${field}"${domains ? ` data-domains="${domains}"` : ''}></ha-entity-picker>`;
}
// Chip + search multi-entity selector (uses AveryEntitiesChips custom element).
// domain: comma-string of domains to filter ('light', 'binary_sensor', …)
// deviceClasses: comma-string of device_class values to filter ('door', 'window', …)
export function entitiesChips(field, domain, deviceClasses) {
  return `<avery-entities-chips data-field="${field}"${domain ? ` data-domains="${domain}"` : ''}${deviceClasses ? ` data-device-classes="${deviceClasses}"` : ''}></avery-entities-chips>`;
}
// Device-level chip selector — stores device IDs, shows device names.
// requireDomain: entities of this domain must exist on the device (e.g. 'binary_sensor')
// requireDeviceClasses: comma-string of device_class values (e.g. 'door,window,opening')
export function deviceChips(field, requireDomain, requireDeviceClasses) {
  return `<avery-device-chips data-field="${field}"${requireDomain ? ` data-require-domain="${requireDomain}"` : ''}${requireDeviceClasses ? ` data-require-device-classes="${requireDeviceClasses}"` : ''}></avery-device-chips>`;
}
export function iconPicker(field) {
  return `<ha-icon-picker data-field="${field}"></ha-icon-picker>`;
}

// ---- Shared generic sections --------------------------------------------

export function colorsSection(cfg, defaults = AV_COLOR_DEFAULTS) {
  return section('Colours',
    row('Accent colour', colorField('accent_color', cfg, defaults.accent_color)) +
    row('Glow colour 1', colorField('glow_color_1', cfg, defaults.glow_color_1)) +
    row('Glow colour 2', colorField('glow_color_2', cfg, defaults.glow_color_2)) +
    row('Glow colour 3', colorField('glow_color_3', cfg, defaults.glow_color_3)) +
    `<div class="av-ed-actions">
      <button type="button" class="av-ed-btn primary" data-randomise>🎲 Randomise</button>
      <button type="button" class="av-ed-btn" data-reset="accent_color">Reset accent</button>
      <button type="button" class="av-ed-btn" data-reset="glow_color_1">Reset 1</button>
      <button type="button" class="av-ed-btn" data-reset="glow_color_2">Reset 2</button>
      <button type="button" class="av-ed-btn" data-reset="glow_color_3">Reset 3</button>
    </div>`
  );
}

export function dimensionsSection(cfg, { height = 120, radius = 10 } = {}) {
  return section('Dimensions',
    row('Height (px)', numberField('height', cfg, { min: 44, max: 400, placeholder: String(height) })) +
    row('Corner radius', numberField('corner_radius', cfg, { min: 0, max: 48, placeholder: String(radius) }))
  );
}

export function themeRow(cfg, themes = ['dashboard', 'dark', 'light']) {
  return row('Theme', selectField('theme', cfg, themes));
}

// ---- Wiring --------------------------------------------------------------

// Wire every input/select/picker/randomise/reset in one call.
//   update(field, value): merge into config + emit config-changed
//   rerender(): re-render the editor (used for checkbox/randomise/reset)
export function bindEditor(shadow, { hass, cfg, update, rerender, colorDefaults = AV_COLOR_DEFAULTS } = {}) {
  shadow.querySelectorAll('ha-entity-picker, ha-icon-picker').forEach(el => {
    if (hass) el.hass = hass;
    const field = el.dataset.field;
    el.value = (cfg && cfg[field]) || '';
    if (el.dataset.domains) el.includeDomains = el.dataset.domains.split(',');
    el.addEventListener('value-changed', e => update(field, e.detail?.value || ''));
  });
  shadow.querySelectorAll('avery-entities-chips').forEach(el => {
    if (hass) el.hass = hass;
    const field = el.dataset.field;
    const cur = cfg && cfg[field];
    el.value = Array.isArray(cur) ? cur : (cur ? String(cur).split(',').map(s => s.trim()).filter(Boolean) : []);
    if (el.dataset.domains) el.includeDomains = el.dataset.domains.split(',');
    if (el.dataset.deviceClasses) el.deviceClasses = el.dataset.deviceClasses.split(',');
    el.addEventListener('value-changed', e => update(field, e.detail?.value ?? []));
  });
  shadow.querySelectorAll('avery-device-chips').forEach(el => {
    if (hass) el.hass = hass;
    const field = el.dataset.field;
    const cur = cfg && cfg[field];
    el.value = Array.isArray(cur) ? cur : [];
    if (el.dataset.requireDomain) el.requireDomain = el.dataset.requireDomain;
    if (el.dataset.requireDeviceClasses) el.requireDeviceClasses = el.dataset.requireDeviceClasses;
    el.addEventListener('value-changed', e => update(field, e.detail?.value ?? []));
  });
  shadow.querySelectorAll('input, select').forEach(el => {
    const field = el.dataset.field;
    if (!field) return;
    if (el.type === 'checkbox') {
      el.addEventListener('change', () => { update(field, el.checked); rerender && rerender(); });
    } else if (el.type === 'number') {
      const send = () => update(field, el.value === '' ? undefined : Number(el.value));
      el.addEventListener('input', send);
      el.addEventListener('change', send);
    } else {
      el.addEventListener('input',  () => { clearTimeout(shadow._edTimer); shadow._edTimer = setTimeout(() => update(field, el.value), 180); });
      el.addEventListener('change', () => { clearTimeout(shadow._edTimer); update(field, el.value); });
    }
  });
  const rnd = shadow.querySelector('[data-randomise]');
  if (rnd) rnd.addEventListener('click', () => {
    const rand = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    update('accent_color', rand());
    update('glow_color_1', rand());
    update('glow_color_2', rand());
    update('glow_color_3', rand());
    rerender && rerender();
  });
  shadow.querySelectorAll('[data-reset]').forEach(b => b.addEventListener('click', () => {
    update(b.dataset.reset, colorDefaults[b.dataset.reset] || '');
    rerender && rerender();
  }));
}
