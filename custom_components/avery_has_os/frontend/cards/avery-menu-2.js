const ROOT_PARENT = '0';

const CSS = `
  :host {
    display: block;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  }
  .menu-card {
    --am-title: var(--primary-text-color, #e9edf7);
    --am-meta: var(--secondary-text-color, #94a3b8);
    --am-icon-bg: color-mix(in srgb, var(--primary-text-color, #fff) 8%, rgba(0,0,0,0));
    --am-icon-color: color-mix(in srgb, var(--primary-text-color, #fff) 45%, rgba(0,0,0,0));
    --am-item-color: color-mix(in srgb, var(--primary-text-color, #fff) 78%, rgba(0,0,0,0));
    --am-hover-bg: color-mix(in srgb, var(--primary-text-color, #fff) 7%, rgba(0,0,0,0));
    --am-border: color-mix(in srgb, var(--primary-text-color, #fff) 10%, rgba(255,255,255,0.16));
    --am-active-bg: color-mix(in srgb, var(--accent-color, #4f8cff) 18%, rgba(0,0,0,0));
    --am-active-border: color-mix(in srgb, var(--accent-color, #4f8cff) 35%, rgba(255,255,255,0.16));
    --am-active: var(--accent-color, #4f8cff);
    --am-tile-bg: color-mix(in srgb, var(--card-background-color, #000) 70%, rgba(0,0,0,0));
    --am-divider: color-mix(in srgb, var(--primary-text-color, #fff) 8%, rgba(0,0,0,0));
    --am-sub-border: color-mix(in srgb, var(--accent-color, #4f8cff) 35%, rgba(255,255,255,0.16));
    --am-sub-color: color-mix(in srgb, var(--primary-text-color, #fff) 68%, rgba(0,0,0,0));
    --am-dot: color-mix(in srgb, var(--primary-text-color, #fff) 28%, rgba(0,0,0,0));
    --am-icon-glow: conic-gradient(from 150deg, #22c55e, #06b6d4, #3b82f6, #f59e0b, #ef4444, #22c55e);
    position: relative;
    overflow: visible;
  }
  .menu-card.theme-dark {
    --am-title: #fff;
    --am-meta: #94a3b8;
    --am-icon-bg: rgba(255,255,255,0.06);
    --am-icon-color: rgba(255,255,255,0.45);
    --am-item-color: rgba(255,255,255,0.78);
    --am-hover-bg: rgba(255,255,255,0.06);
    --am-border: rgba(255,255,255,0.09);
    --am-active-bg: rgba(79,140,255,0.15);
    --am-active-border: rgba(79,140,255,0.28);
    --am-active: #4f8cff;
    --am-tile-bg: rgba(0,0,0,0.3);
    --am-divider: rgba(255,255,255,0.07);
    --am-sub-border: rgba(79,140,255,0.35);
    --am-sub-color: rgba(255,255,255,0.68);
    --am-dot: rgba(255,255,255,0.28);
    --am-icon-glow: conic-gradient(from 150deg, #22c55e, #06b6d4, #3b82f6, #f59e0b, #ef4444, #22c55e);
  }
  .menu-card.theme-light {
    --am-title: #1f2937;
    --am-meta: #64748b;
    --am-icon-bg: rgba(15,23,42,0.06);
    --am-icon-color: rgba(15,23,42,0.54);
    --am-item-color: rgba(15,23,42,0.82);
    --am-hover-bg: rgba(15,23,42,0.06);
    --am-border: rgba(15,23,42,0.10);
    --am-active-bg: rgba(37,99,235,0.12);
    --am-active-border: rgba(37,99,235,0.28);
    --am-active: #2563eb;
    --am-tile-bg: rgba(255,255,255,0.86);
    --am-divider: rgba(15,23,42,0.10);
    --am-sub-border: rgba(37,99,235,0.32);
    --am-sub-color: rgba(15,23,42,0.68);
    --am-dot: rgba(15,23,42,0.32);
    --am-icon-glow: conic-gradient(from 150deg, #16a34a, #0891b2, #2563eb, #d97706, #dc2626, #16a34a);
  }
  .title-card {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 56px;
    padding: 8px 0 8px 6px;
    background: transparent;
    border: none;
    box-shadow: none;
    overflow: visible;
  }
  .title-card.no-title .text-col,
  .title-card.no-header-icon .icon-wrap,
  .title-card.no-secondary .meta {
    display: none;
  }
  .title-card.no-title {
    min-height: 42px;
    padding: 0;
  }
  /* === Right-aligned status block === */
  .am-status {
    margin-left: auto;
    display: flex; flex-direction: column;
    align-items: flex-end;
    gap: 2px;
    padding-right: 6px;
    white-space: nowrap;
    line-height: 1;
    flex: 0 0 auto;
    color: var(--am-title);
  }
  .am-status .row1 {
    display: inline-flex; align-items: center;
    gap: 8px;
    font-size: calc(14px * var(--menu-scale, 1));
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .am-status .row1 > * { display: inline-flex; align-items: center; line-height: 1; }
  .am-status .row2 {
    display: inline-flex; align-items: center;
    gap: 8px;
    font-size: calc(10px * var(--menu-scale, 1));
    font-weight: 600;
    color: var(--am-meta);
    text-transform: uppercase;
    letter-spacing: .1em;
    white-space: nowrap;
  }
  .am-status .battery ha-icon {
    --mdc-icon-size: calc(18px * var(--menu-scale, 1));
    width: calc(18px * var(--menu-scale, 1));
    height: calc(18px * var(--menu-scale, 1));
    line-height: 1;
    display: inline-flex; align-items: center; justify-content: center;
    color: currentColor;
  }
  .am-status .battery.charging ha-icon { color: #34c759; }
  .am-status .battery.low:not(.charging) ha-icon { color: #ffb340; }
  .am-status .battery.critical:not(.charging) ha-icon { color: #ff4d4f; }
  .am-status .net.offline { color: #ff4d4f; font-weight: 700; }
  .am-status [hidden] { display: none !important; }
  /* Don't show under collapsed hamburger if the title-card is super tight */
  .menu-card.layout-hamburger.no-title .am-status .row2 { display: none; }
  .icon-wrap {
    position: relative;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
  }
  .home-tile {
    position: relative;
    z-index: 0;
    width: 40px;
    height: 40px;
    border-radius: 14px;
    background: var(--am-icon-bg);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 0 1px var(--am-border), 0 0 20px -8px rgba(255,255,255,0.55);
    border: 1px solid var(--am-border);
    color: var(--am-title);
    cursor: pointer;
    transition: background .15s, color .15s, box-shadow .15s, transform .15s;
  }
  .home-tile::before {
    content: "";
    position: absolute;
    inset: -7px;
    z-index: -1;
    border-radius: 19px;
    background: var(--am-icon-glow);
    filter: blur(16px);
    opacity: .82;
    pointer-events: none;
  }
  .home-tile::after {
    content: "";
    position: absolute;
    inset: 1px;
    z-index: -1;
    border-radius: 13px;
    background: color-mix(in srgb, var(--am-tile-bg) 74%, rgba(0,0,0,0));
    pointer-events: none;
  }
  .home-tile:hover {
    transform: translateY(-1px);
    box-shadow: inset 0 0 0 1px var(--am-border), 0 0 26px -8px rgba(255,255,255,0.65);
  }
  .home-tile ha-icon {
    --mdc-icon-size: 20px;
    color: var(--am-title);
  }
  .home-tile svg,
  .icon-preview svg {
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
    color: var(--am-title);
    font-weight: 600;
    font-size: calc(16px * var(--menu-scale, 1));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .meta {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 4px;
    font-size: calc(12px * var(--menu-scale, 1));
    color: var(--am-meta);
    min-width: 0;
    white-space: nowrap;
  }
  .meta.plain {
    overflow: hidden;
    text-overflow: ellipsis;
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
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 9999px;
    background: #34d399;
    box-shadow: 0 0 6px rgba(52,211,153,0.9);
  }
  .chip.open .status-dot {
    background: #f87171;
    box-shadow: 0 0 6px rgba(248,113,113,0.9);
  }
  .battery {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--am-meta);
    flex-shrink: 0;
  }
  .event-text {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .meta-sep { color: var(--am-dot); }
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
    color: var(--am-title);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: background .15s, color .15s;
  }
  .hamburger:hover { background: var(--am-hover-bg); color: var(--am-title); }
  .hamburger.open { background: var(--am-active-bg); color: var(--am-title); }
  .menu-card.align-left .hamburger {
    margin-left: 0;
    margin-right: auto;
  }
  .menu-card.align-center .hamburger {
    margin-left: auto;
    margin-right: auto;
  }
  .menu-card.align-right .hamburger {
    margin-left: auto;
    margin-right: 0;
  }
  .desktop-menu {
    display: none;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    min-width: 0;
    overflow: visible;
  }
  .menu-card.align-left .desktop-menu {
    margin-left: 0;
    margin-right: auto;
  }
  .menu-card.align-center .desktop-menu {
    margin-left: auto;
    margin-right: auto;
  }
  .menu-card.align-right .desktop-menu {
    margin-left: auto;
    margin-right: 0;
  }
  .desktop-item-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .desktop-item {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 38px;
    padding: 8px 10px;
    border: 0;
    border-radius: 0;
    background: transparent;
    color: color-mix(in srgb, var(--am-title) 62%, rgba(0,0,0,0));
    font: inherit;
    font-size: calc(13px * var(--menu-scale, 1));
    font-weight: 800;
    letter-spacing: 0;
    cursor: pointer;
    white-space: nowrap;
    transition: color .16s ease, background .16s ease;
  }
  .desktop-item:hover,
  .desktop-item.open,
  .desktop-item.active {
    color: var(--am-title);
    background: transparent;
  }
  .desktop-item.active::after,
  .desktop-item.open::after {
    content: "";
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: -5px;
    height: 2px;
    border-radius: 999px;
    background: var(--am-title);
    box-shadow: 0 0 14px color-mix(in srgb, var(--am-active) 70%, rgba(0,0,0,0));
  }
  .desktop-item ha-icon {
    --mdc-icon-size: 17px;
    color: currentColor;
  }
  .desktop-item.no-icon ha-icon,
  .item.no-icon .icon {
    display: none;
  }
  .desktop-chevron {
    width: 12px;
    height: 12px;
    display: inline-flex;
    color: color-mix(in srgb, currentColor 55%, rgba(0,0,0,0));
    transform: rotate(90deg);
  }
  .desktop-dropdown {
    position: absolute;
    z-index: 20;
    top: calc(100% + 12px);
    left: 50%;
    min-width: 180px;
    padding: 8px;
    border: 1px solid var(--am-border);
    border-radius: 14px;
    background: color-mix(in srgb, var(--card-background-color, #111827) 80%, rgba(0,0,0,0));
    box-shadow: 0 18px 46px rgba(0,0,0,.34);
    backdrop-filter: blur(18px) saturate(1.25);
    -webkit-backdrop-filter: blur(18px) saturate(1.25);
    transform: translateX(-50%);
  }
  .desktop-subitem {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 9px;
    width: 100%;
    min-height: 36px;
    padding: 8px 10px;
    border-radius: 10px;
    color: var(--am-sub-color);
    font-size: calc(12.5px * var(--menu-scale, 1));
    font-weight: 750;
    cursor: pointer;
    white-space: nowrap;
  }
  .desktop-subitem:hover,
  .desktop-subitem.active {
    color: var(--am-title);
    background: var(--am-hover-bg);
  }
  .desktop-subitem ha-icon {
    --mdc-icon-size: 15px;
    color: currentColor;
  }
  .menu-wrap {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows .22s ease;
  }
  .menu-wrap.open { grid-template-rows: 1fr; }
  .menu-inner { overflow: hidden; }
  .menu {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 6px 0 6px;
  }
  .item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 10px;
    border-radius: 10px;
    cursor: pointer;
    color: var(--am-item-color);
    font-size: 13px;
    font-weight: 500;
    background: transparent;
    border: 1px solid transparent;
    transition: background .15s, border-color .15s;
    user-select: none;
  }
  .item:hover,
  .item.active:hover { background: var(--am-hover-bg); border-color: var(--am-border); }
  .item.active { background: transparent; border-color: transparent; color: var(--am-title); }
  .item .icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--am-icon-bg);
    color: var(--am-icon-color);
    flex-shrink: 0;
    transition: background .15s, color .15s, box-shadow .15s;
  }
  .item .icon ha-icon { --mdc-icon-size: 16px; }
  .item:hover .icon { color: var(--am-title); }
  .item.active .icon {
    background: var(--am-icon-bg);
    color: var(--am-title);
    box-shadow: none;
  }
  .item .label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .item .chevron {
    color: var(--am-dot);
    transition: transform .22s ease;
    flex-shrink: 0;
  }
  .item.submenu-open .chevron {
    transform: rotate(90deg);
  }
  .submenu-wrap {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows .22s ease;
  }
  .submenu-wrap.open { grid-template-rows: 1fr; }
  .submenu-inner { overflow: hidden; }
  .submenu {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 3px 0 5px 10px;
    margin: 0 4px 2px 16px;
    border-left: 2px solid var(--am-sub-border);
  }
  .submenu-btn {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 7px 10px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--am-sub-color);
    font-size: 12.5px;
    font-weight: 500;
    background: transparent;
    border: 1px solid transparent;
    transition: background .15s, color .15s, border-color .15s;
    user-select: none;
  }
  .submenu-btn:hover,
  .submenu-btn.active:hover { background: var(--am-hover-bg); border-color: var(--am-border); color: var(--am-title); }
  .submenu-btn.active { background: transparent; border-color: transparent; color: var(--am-title); }
  .submenu-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--am-dot);
    flex-shrink: 0;
    transition: background .15s, transform .15s, box-shadow .15s;
  }
  .submenu-btn.active .submenu-dot {
    background: var(--am-title);
    transform: scale(1.2);
    box-shadow: none;
  }
  .divider {
    height: 1px;
    background: var(--am-divider);
    margin: 4px 2px;
  }
  @media (min-width: 760px) {
    .menu-card.layout-responsive .hamburger,
    .menu-card.layout-horizontal .hamburger,
    .menu-card.layout-horizontal .menu-wrap {
      display: none;
    }
    .menu-card.layout-responsive .menu-wrap {
      display: none;
    }
    .menu-card.layout-responsive .desktop-menu,
    .menu-card.layout-horizontal .desktop-menu {
      display: flex;
    }
  }
  @media (max-width: 759px) {
    .menu-card.layout-horizontal .desktop-menu {
      display: none;
    }
  }
  .menu-card.layout-hamburger .desktop-menu {
    display: none;
  }
`;

const EDITOR_CSS = `
  :host {
    display: block;
    padding: 8px 0;
    font: 13px/1.45 var(--ha-font-family-body, system-ui, sans-serif);
    color: var(--primary-text-color, #fff);
  }
  .editor { display: grid; gap: 14px; }

  /* === Section frame === */
  .section {
    padding: 14px 14px 12px;
    border: 1px solid var(--divider-color, rgba(255,255,255,.10));
    border-radius: 12px;
    background: color-mix(in srgb, var(--primary-text-color, #fff) 3%, rgba(0,0,0,0));
    display: grid;
    gap: 12px;
  }
  h3 {
    margin: 0;
    font-size: 11px;
    font-weight: 800;
    color: var(--secondary-text-color, #9aa3bd);
    text-transform: uppercase;
    letter-spacing: .06em;
  }

  /* === Row === */
  .row {
    display: grid;
    grid-template-columns: minmax(120px, 38%) minmax(0, 1fr);
    align-items: center;
    gap: 12px;
  }
  label {
    font-size: 12px;
    font-weight: 700;
    color: var(--secondary-text-color, #9aa3bd);
    letter-spacing: .02em;
  }

  /* === Inputs === */
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
    justify-self: start; cursor: pointer; accent-color: var(--primary-color, #5b9cf6);
  }
  input:disabled, select:disabled { opacity: .4; cursor: not-allowed; }
  .row.disabled label { opacity: .55; }
  .row label small {
    display: block;
    font-size: 10px;
    font-weight: 600;
    text-transform: none;
    letter-spacing: 0;
    color: color-mix(in srgb, var(--primary-text-color, #fff) 50%, rgba(0,0,0,0));
    margin-top: 2px;
  }

  ha-icon-picker, ha-entity-picker { width: 100%; display: block; }
  .icon-row { grid-template-columns: minmax(120px, 38%) minmax(0, 1fr) 44px; }
  .icon-preview {
    width: 36px; height: 36px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    color: #fff;
    background: rgba(0,0,0,0.3);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.1), 0 0 24px -4px #2196F3, 0 0 34px -12px #64B5F6;
  }
  .icon-preview ha-icon { --mdc-icon-size: 19px; }

  /* === Buttons === */
  button {
    min-height: 32px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--divider-color, rgba(255,255,255,.14));
    background: color-mix(in srgb, var(--primary-text-color, #fff) 5%, rgba(0,0,0,0));
    color: inherit;
    font: inherit; font-weight: 700; font-size: 12px;
    cursor: pointer;
    transition: background .15s, border-color .15s;
  }
  button:hover { background: color-mix(in srgb, var(--primary-text-color, #fff) 10%, rgba(0,0,0,0)); }
  button.add {
    width: 100%;
    color: #fff;
    border-color: rgba(34,197,94,.55);
    background: linear-gradient(135deg, rgba(34,197,94,.45) 0%, rgba(20,184,166,.32) 100%);
  }
  button.add:hover {
    background: linear-gradient(135deg, rgba(34,197,94,.60) 0%, rgba(20,184,166,.45) 100%);
  }

  /* === Menu items list === */
  .menu-list { display: grid; gap: 12px; }
  .menu-item {
    display: grid;
    gap: 10px;
    padding: 12px;
    border-radius: 12px;
    background: color-mix(in srgb, var(--primary-text-color, #fff) 2.5%, rgba(0,0,0,0));
    border: 1px solid color-mix(in srgb, var(--primary-text-color, #fff) 8%, rgba(255,255,255,0.16));
  }
  .mi-header {
    display: grid;
    grid-template-columns: minmax(72px, auto) minmax(0, 1fr);
    gap: 8px;
    align-items: center;
  }
  .mi-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 10px;
  }
  .mi-grid label {
    display: grid;
    gap: 4px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: color-mix(in srgb, var(--primary-text-color, #fff) 65%, rgba(0,0,0,0));
  }
  .mi-grid label > input,
  .mi-grid label > select,
  .mi-grid label > ha-icon-picker { width: 100%; min-width: 0; max-width: 100%; box-sizing: border-box; }
  .mi-grid label.full { grid-column: 1 / -1; }
  .mi-grid label > ha-icon-picker { display: block; }
  .mi-footer {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: center;
    padding-top: 4px;
    border-top: 1px solid color-mix(in srgb, var(--primary-text-color, #fff) 7%, rgba(255,255,255,0.16));
    margin-top: 2px;
    padding-top: 10px;
  }
  .move-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; max-width: 200px; }
  .mi-footer button.remove {
    background: color-mix(in srgb, var(--error-color, #ef4444) 18%, rgba(0,0,0,0));
    border-color: color-mix(in srgb, var(--error-color, #ef4444) 40%, rgba(255,255,255,0.16));
    color: var(--primary-text-color);
    font-weight: 700;
  }
  .mi-footer button.remove:hover {
    background: color-mix(in srgb, var(--error-color, #ef4444) 28%, rgba(0,0,0,0));
  }
  .id-badge {
    min-height: 32px;
    padding: 6px 12px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-color, #5b9cf6) 22%, rgba(0,0,0,0));
    border: 1px solid color-mix(in srgb, var(--primary-color, #5b9cf6) 36%, rgba(255,255,255,0.16));
    color: var(--primary-text-color);
    font-size: 11.5px;
    font-weight: 700;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    text-align: center;
    display: inline-flex; align-items: center; justify-content: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .divider-label {
    height: 1px;
    background: var(--divider-color, rgba(255,255,255,.18));
    align-self: center;
  }
  .menu-item input, .menu-item select { min-width: 0; }

  @media (max-width: 760px) {
    .row { grid-template-columns: 1fr; }
    .mi-grid { grid-template-columns: 1fr; }
    .mi-footer { grid-template-columns: 1fr; }
    .move-controls { max-width: none; }
  }
`;

const IC = {
  hamburger: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>`,
  close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  titleHome: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>`,
  chevron: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  battery: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="16" height="10" rx="2"/><line x1="22" y1="11" x2="22" y2="13"/></svg>`,
};

const DEFAULT_CONFIG = {
  type: 'custom:avery-menu-2',
  title: 'Menu',
  icon: '',
  theme: 'dashboard',
  layout: 'responsive',
  menu_align: 'right',
  expanded_desktop_submenus: '',
  variable_name: 'selected_menu',
  entity: '',
  navigate_on_select: false,
  show_title: true,
  show_header_icon: true,
  show_menu_icons: true,
  show_secondary_info: true,
  show_door_status: true,
  door_entity: 'binary_sensor.front_door_contact',
  door_battery_entity: 'sensor.front_door_battery',
  // Typography scale — 1 = current sizing. 1.2 makes everything 20% bigger,
  // 0.85 makes it tighter. Multiplies through a CSS custom property on the
  // menu-card host; clamped 0.6–2 in cloneConfig.
  font_scale: 1,
  // Right-aligned 2-line status block inside the menu bar.
  show_status_bar: false,
  show_status_battery: true,
  show_status_clock: true,
  show_status_device: true,
  show_status_network: true,
  status_clock_format: '24h',
  status_show_seconds: false,
  menus: [
    { id: '1', parent: ROOT_PARENT, label: 'Home', icon: 'mdi:home' },
    { id: '2', parent: ROOT_PARENT, label: 'Rooms', icon: 'mdi:door' },
    { id: '3', parent: '2', label: 'Living Room', icon: 'mdi:sofa' },
    { id: '4', parent: '2', label: 'Kitchen', icon: 'mdi:silverware-fork-knife' },
    { divider: true },
    { id: '5', parent: ROOT_PARENT, label: 'Calendar', icon: 'mdi:calendar' },
  ],
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);
}

// Registered "special" actions that menu items can fire instead of navigating.
// Each entry is `{ label, activeLabel?, activeIcon?, isAvailable, isActive?, run }`.
//   isAvailable: probes for the helper that powers the action (the menu hides
//     items and greys out the editor option when this returns false).
//   isActive: probes for "is the action currently in effect" — when true, the
//     item renders with activeLabel/activeIcon so the user has a visible way
//     to toggle back off.
const ACTION_REGISTRY = {
  'kiosk-preview': {
    label: 'Kiosk Preview',
    activeLabel: 'Exit Kiosk Preview',
    activeIcon: 'mdi:fullscreen-exit',
    isAvailable: () => typeof window.AveryKioskPreviewToggle === 'function',
    isActive: () => !!(document.fullscreenElement || document.webkitFullscreenElement),
    run: () => window.AveryKioskPreviewToggle?.(),
  },
};

function isActionAvailable(action) {
  if (!action) return true;
  return !!ACTION_REGISTRY[action]?.isAvailable?.();
}

function runItemAction(action) {
  ACTION_REGISTRY[action]?.run?.();
}

// Resolve label/icon at render time so action items can swap to their
// active-state versions (e.g. "Kiosk Preview" → "Exit Kiosk Preview").
function displayLabel(item) {
  if (item?.action) {
    const def = ACTION_REGISTRY[item.action];
    if (def?.isActive?.() && def.activeLabel) return def.activeLabel;
  }
  return item?.label || 'Menu item';
}

function displayIcon(item) {
  if (item?.action) {
    const def = ACTION_REGISTRY[item.action];
    if (def?.isActive?.() && def.activeIcon) return def.activeIcon;
  }
  return item?.icon || 'mdi:menu';
}

function normalizeParent(value) {
  if (value === undefined || value === null || value === '') return ROOT_PARENT;
  return String(value);
}

function legacyParentFromValue(value) {
  const parts = String(value ?? '').split('.');
  return parts.length > 1 ? parts.slice(0, -1).join('.') : ROOT_PARENT;
}

function normalizeMenus(menus) {
  const source = Array.isArray(menus) ? menus : DEFAULT_CONFIG.menus;
  const hasParentModel = source.some((item) => item && (item.id !== undefined || item.parent !== undefined));
  return source.map((item, index) => {
    if (item?.divider) return { divider: true };
    const fallbackId = String(index + 1);
    const id = String(item?.id ?? (hasParentModel ? item?.value ?? fallbackId : item?.value ?? fallbackId));
    const parent = normalizeParent(item?.parent ?? (hasParentModel ? ROOT_PARENT : legacyParentFromValue(item?.value ?? fallbackId)));
    return {
      id,
      parent: parent === id ? ROOT_PARENT : parent,
      label: item?.label || '',
      icon: item?.icon || 'mdi:menu',
      navigation_path: item?.navigation_path || '',
      action: item?.action || '',
    };
  });
}

function cloneConfig(config) {
    return {
      ...DEFAULT_CONFIG,
      ...(config || {}),
      icon: config?.icon ?? DEFAULT_CONFIG.icon,
      theme: config?.theme || 'dashboard',
      layout: config?.layout || 'responsive',
      menu_align: config?.menu_align || DEFAULT_CONFIG.menu_align,
      expanded_desktop_submenus: config?.expanded_desktop_submenus || DEFAULT_CONFIG.expanded_desktop_submenus,
      show_title: config?.show_title ?? DEFAULT_CONFIG.show_title,
      show_header_icon: config?.show_header_icon ?? DEFAULT_CONFIG.show_header_icon,
      show_menu_icons: config?.show_menu_icons ?? DEFAULT_CONFIG.show_menu_icons,
      show_secondary_info: config?.show_secondary_info ?? DEFAULT_CONFIG.show_secondary_info,
      show_door_status: config?.show_door_status ?? DEFAULT_CONFIG.show_door_status,
      navigate_on_select: config?.navigate_on_select ?? DEFAULT_CONFIG.navigate_on_select,
      font_scale: Math.max(0.6, Math.min(2, Number(config?.font_scale) || DEFAULT_CONFIG.font_scale)),
      show_status_bar: config?.show_status_bar ?? DEFAULT_CONFIG.show_status_bar,
      show_status_battery: config?.show_status_battery ?? DEFAULT_CONFIG.show_status_battery,
      show_status_clock: config?.show_status_clock ?? DEFAULT_CONFIG.show_status_clock,
      show_status_device: config?.show_status_device ?? DEFAULT_CONFIG.show_status_device,
      show_status_network: config?.show_status_network ?? DEFAULT_CONFIG.show_status_network,
      status_clock_format: config?.status_clock_format || DEFAULT_CONFIG.status_clock_format,
      status_show_seconds: config?.status_show_seconds ?? DEFAULT_CONFIG.status_show_seconds,
      menus: normalizeMenus(config?.menus),
    };
  }

function headerIconHtml(icon) {
  return icon ? `<ha-icon icon="${escapeHtml(icon)}"></ha-icon>` : IC.titleHome;
}

// --- status bar helpers ----------------------------------------------------
const STATUS_DEVICE_ID_KEY = 'avery-tablet-device-id';
function statusGetDeviceId() {
  let id = '';
  try { id = localStorage.getItem(STATUS_DEVICE_ID_KEY) || ''; } catch {}
  if (!id) {
    id = 'device-' + Math.random().toString(36).slice(2, 8);
    try { localStorage.setItem(STATUS_DEVICE_ID_KEY, id); } catch {}
  }
  return id;
}
function statusBatteryMdi(pct, charging) {
  if (!Number.isFinite(pct)) return charging ? 'mdi:battery-charging-outline' : 'mdi:battery-unknown';
  const step = Math.max(0, Math.min(100, Math.round(pct / 10) * 10));
  if (charging) {
    if (step >= 100) return 'mdi:battery-charging-100';
    if (step <= 10) return 'mdi:battery-charging-10';
    return `mdi:battery-charging-${step}`;
  }
  if (step >= 100) return 'mdi:battery';
  if (step <= 0) return 'mdi:battery-outline';
  return `mdi:battery-${step}`;
}

function menuValue(item) {
  return String(item.id);
}

function menuLabel(item) {
  return String(item?.label || 'Menu item');
}

function normalizePath(path) {
  const value = String(path || '').trim();
  if (!value) return '';
  const withoutOrigin = value.replace(/^https?:\/\/[^/]+/i, '');
  const withoutHash = withoutOrigin.split('#')[0].split('?')[0];
  return withoutHash.replace(/\/+$/, '') || '/';
}

function nextMenuId(menus) {
  const used = new Set(menus.filter((item) => !item.divider).map((item) => String(item.id)));
  let next = 1;
  while (used.has(String(next))) next += 1;
  return String(next);
}

function themeClass(theme) {
  if (theme === 'dark') return 'theme-dark';
  if (theme === 'light') return 'theme-light';
  return 'theme-dashboard';
}

function splitIds(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  return String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
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

class AveryMenu2 extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._config = cloneConfig();
    this._hass = null;
    this._open = false;
    this._openSubmenus = new Set();
    this._selectedValue = undefined;
    this._handleLocationChange = () => this._render();
  }

  connectedCallback() {
    window.addEventListener('location-changed', this._handleLocationChange);
    window.addEventListener('popstate', this._handleLocationChange);
    // Re-render when fullscreen flips so action items can swap their
    // label/icon to the "active" version (e.g. Kiosk Preview → Exit
    // Kiosk Preview). Bound here so the same fn ref can be removed later.
    this._handleFsChange = () => this._render();
    document.addEventListener('fullscreenchange', this._handleFsChange);
    document.addEventListener('webkitfullscreenchange', this._handleFsChange);
    // Close any open submenu / hamburger when the user clicks anywhere
    // outside the menu card. event.composedPath() lets us see through the
    // shadow boundary; if our host element isn't on the path, the click was
    // outside us.
    this._handleOutsideClick = (event) => {
      if (!this._openSubmenus.size && !this._open) return;
      const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
      if (path.includes(this)) return;
      this._openSubmenus.clear();
      this._open = false;
      this._render();
      this._notifyLayoutChanged();
    };
    document.addEventListener('pointerdown', this._handleOutsideClick, true);
    // Status-bar monitors — clock tick + network + battery handle. All cheap.
    this._statusNetHandler = () => this._refreshStatusBar();
    window.addEventListener('online', this._statusNetHandler);
    window.addEventListener('offline', this._statusNetHandler);
    this._statusClockTimer = setInterval(() => this._refreshStatusBar(), 15000);
    this._ensureStatusBattery();
  }

  disconnectedCallback() {
    window.removeEventListener('location-changed', this._handleLocationChange);
    window.removeEventListener('popstate', this._handleLocationChange);
    if (this._handleFsChange) {
      document.removeEventListener('fullscreenchange', this._handleFsChange);
      document.removeEventListener('webkitfullscreenchange', this._handleFsChange);
      this._handleFsChange = null;
    }
    if (this._handleOutsideClick) {
      document.removeEventListener('pointerdown', this._handleOutsideClick, true);
      this._handleOutsideClick = null;
    }
    if (this._statusNetHandler) {
      window.removeEventListener('online', this._statusNetHandler);
      window.removeEventListener('offline', this._statusNetHandler);
      this._statusNetHandler = null;
    }
    if (this._statusClockTimer) { clearInterval(this._statusClockTimer); this._statusClockTimer = null; }
    if (this._statusBattery && this._statusBatteryHandler) {
      ['levelchange', 'chargingchange'].forEach(ev => this._statusBattery.removeEventListener(ev, this._statusBatteryHandler));
      this._statusBatteryHandler = null;
    }
  }

  async _ensureStatusBattery() {
    if (this._statusBattery) { this._refreshStatusBar(); return; }
    if (typeof navigator.getBattery !== 'function') { this._refreshStatusBar(); return; }
    try {
      this._statusBattery = await navigator.getBattery();
      this._statusBatteryHandler = () => this._refreshStatusBar();
      ['levelchange', 'chargingchange'].forEach(ev => this._statusBattery.addEventListener(ev, this._statusBatteryHandler));
      this._refreshStatusBar();
    } catch { this._refreshStatusBar(); }
  }

  _refreshStatusBar() {
    if (!this._shadow) return;
    const cfg = this._config;
    if (!cfg?.show_status_bar) return;
    // Clock
    const clockEl = this._shadow.querySelector('.am-status .clock');
    if (clockEl && cfg.show_status_clock) {
      const now = new Date();
      const opts = { hour: '2-digit', minute: '2-digit', hour12: cfg.status_clock_format === '12h' };
      if (cfg.status_show_seconds) opts.second = '2-digit';
      let s = now.toLocaleTimeString([], opts);
      if (cfg.status_clock_format === '24h') s = s.replace(/\s?(AM|PM)$/i, '');
      clockEl.textContent = s;
    }
    // Battery
    const batWrap = this._shadow.querySelector('.am-status .battery');
    if (batWrap && cfg.show_status_battery) {
      if (this._statusBattery) {
        const pct = Math.round((this._statusBattery.level ?? 0) * 100);
        const charging = !!this._statusBattery.charging;
        const icon = batWrap.querySelector('ha-icon');
        if (icon) icon.setAttribute('icon', statusBatteryMdi(pct, charging));
        const pctEl = batWrap.querySelector('.bat-pct');
        if (pctEl) pctEl.textContent = `${pct}%`;
        batWrap.classList.toggle('charging', charging);
        batWrap.classList.toggle('low', !charging && pct <= 30 && pct > 15);
        batWrap.classList.toggle('critical', !charging && pct <= 15);
        batWrap.hidden = false;
      } else {
        batWrap.hidden = true;
      }
    }
    // Net
    const netEl = this._shadow.querySelector('.am-status .net');
    if (netEl && cfg.show_status_network) {
      const online = navigator.onLine !== false;
      netEl.textContent = online ? 'online' : 'offline';
      netEl.classList.toggle('offline', !online);
    }
  }

  setConfig(config) {
    this._config = cloneConfig(config);
    this._syncSelectedFromState();
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._syncSelectedFromState();
    this._render();
  }

  getConfig() {
    return this._config;
  }

  static getConfigElement() {
    return document.createElement('avery-menu-2-editor');
  }


  getCardSize() {
    return this._layoutRows();
  }

  _layoutRows() {
    if (this._config.layout === 'horizontal') return 1;
    if (!this._open) return 1;
    const visibleMenuRows = (this._config.menus || []).reduce((count, item) => {
      if (item.divider) return count + 0.35;
      if (String(item.parent) !== ROOT_PARENT) return count;
      const children = this._openSubmenus.has(String(item.id)) ? this._childrenOf(item.id).length : 0;
      return count + 0.75 + (children * 0.55);
    }, 0);
    return Math.max(2, Math.ceil(1 + visibleMenuRows));
  }

  _store() {
    window.__averyMenuState = window.__averyMenuState || {};
    return window.__averyMenuState;
  }

  _syncSelectedFromState() {
    const store = this._store();
    const entity = this._config.entity;
    const entityState = entity ? this._hass?.states?.[entity]?.state : undefined;
    if (entityState && !['unknown', 'unavailable'].includes(entityState)) {
      this._selectedValue = this._resolveSelection(entityState);
      store[this._config.variable_name] = this._selectedLabel();
      return;
    }
    if (store[this._config.variable_name] === undefined && this._config.menus.length > 0) {
      const first = this._config.menus.find((item) => !item.divider);
      if (first) store[this._config.variable_name] = menuLabel(first);
    }
    this._selectedValue = this._resolveSelection(store[this._config.variable_name]);
  }

  _resolveSelection(value) {
    const selection = String(value ?? '');
    const menus = this._config.menus.filter((item) => !item.divider);
    const byId = menus.find((item) => menuValue(item) === selection);
    if (byId) return menuValue(byId);
    const byLabel = menus.find((item) => menuLabel(item) === selection);
    if (byLabel) return menuValue(byLabel);
    const byNormalizedLabel = menus.find((item) => menuLabel(item).toLowerCase() === selection.toLowerCase());
    if (byNormalizedLabel) return menuValue(byNormalizedLabel);
    return selection;
  }

  _getLevel(item, seen = new Set()) {
    if (!item || item.parent === ROOT_PARENT || seen.has(item.id)) return 0;
    seen.add(item.id);
    const parent = this._config.menus.find((candidate) => !candidate.divider && String(candidate.id) === String(item.parent));
    return parent ? Math.min(4, 1 + this._getLevel(parent, seen)) : 0;
  }

  _selectedLabel() {
    const selected = this._config.menus.find((item) => !item.divider && menuValue(item) === String(this._selectedValue));
    return selected ? menuLabel(selected) : 'Nothing selected';
  }

  _childrenOf(parentId) {
    if (String(parentId) === ROOT_PARENT) return [];
    return this._config.menus.filter((item) =>
      !item.divider
      && String(item.parent) === String(parentId)
      && isActionAvailable(item.action),
    );
  }

  _homeItem() {
    return this._config.menus.find((item) => !item.divider && menuLabel(item).toLowerCase() === 'home')
      || this._config.menus.find((item) => !item.divider && String(item.parent) === ROOT_PARENT)
      || this._config.menus.find((item) => !item.divider);
  }

  _hasActiveChild(item) {
    const activeValue = this._activeValue();
    return this._childrenOf(item.id).some((child) => menuValue(child) === String(activeValue));
  }

  _activeValueFromLocation() {
    const current = normalizePath(window.location?.pathname || '');
    if (!current) return '';
    const menus = this._config.menus.filter((item) => !item.divider && item.navigation_path);
    const exact = menus.find((item) => normalizePath(item.navigation_path) === current);
    if (exact) return menuValue(exact);
    const currentTail = current.split('/').filter(Boolean).pop();
    const tail = menus.find((item) => normalizePath(item.navigation_path).split('/').filter(Boolean).pop() === currentTail);
    return tail ? menuValue(tail) : '';
  }

  _activeValue() {
    return this._activeValueFromLocation() || String(this._selectedValue ?? '');
  }

  _select(value) {
    const selected = this._config.menus.find(
      (item) => !item.divider && menuValue(item) === String(value),
    );
    if (selected?.action) {
      // Special menu items fire a registered action instead of navigating /
      // updating the selection. We still close the menu so the UI dismisses.
      runItemAction(selected.action);
      this._open = false;
      this._openSubmenus.clear();
      this._render();
      return;
    }
    this._setSelected(value);
    this._navigateSelected(value);
    this._open = false;
    this._openSubmenus.clear();
    this._render();
  }

  _setSelected(value) {
    const selectedValue = this._resolveSelection(value);
    const selectedPayload = this._selectedPayloadForValue(selectedValue);
    this._selectedValue = selectedValue;
    this._store()[this._config.variable_name] = selectedPayload;
    this._writeSelectionEntity(selectedPayload);
    window.dispatchEvent(new CustomEvent('avery-menu-selected', {
      detail: {
        variable_name: this._config.variable_name,
        entity: this._config.entity || null,
        value: selectedPayload,
        id: selectedValue,
        label: selectedPayload,
      },
    }));
  }

  _selectedPayloadForValue(value) {
    const selected = this._config.menus.find((item) => !item.divider && menuValue(item) === String(value));
    return selected ? menuLabel(selected) : String(value ?? '');
  }

  _writeSelectionEntity(value) {
    const entity = this._config.entity;
    if (!this._hass || !entity) return;
    if (entity.startsWith('input_text.')) {
      this._hass.callService('input_text', 'set_value', { entity_id: entity, value });
    } else if (entity.startsWith('input_select.')) {
      this._hass.callService('input_select', 'select_option', { entity_id: entity, option: value });
    }
  }

  _navigateSelected(value) {
    if (!this._config.navigate_on_select) return;
    const selectedValue = this._resolveSelection(value);
    const selected = this._config.menus.find((item) => !item.divider && menuValue(item) === String(selectedValue));
    if (!selected?.navigation_path) return;
    history.pushState(null, '', selected.navigation_path);
    window.dispatchEvent(new CustomEvent('location-changed', {
      detail: { replace: false },
      bubbles: true,
      composed: true,
    }));
  }

  _metaHtml() {
    const cfg = this._config;
    if (!cfg.show_secondary_info) return '';
    if (!cfg.show_door_status) return `<span class="meta plain">${escapeHtml(this._selectedLabel())}</span>`;

    const door = this._hass?.states?.[cfg.door_entity];
    const battery = this._hass?.states?.[cfg.door_battery_entity];
    const doorOpen = door?.state === 'on';
    const doorUnavailable = !door || door.state === 'unavailable' || door.state === 'unknown';
    const statusText = doorUnavailable ? 'Unknown' : doorOpen ? 'Open' : 'Locked';
    const eventVerb = doorUnavailable ? 'Updated' : doorOpen ? 'Opened' : 'Closed';
    const eventTime = relativeTime(door?.last_changed);
    const batteryText = battery && !['unknown', 'unavailable'].includes(battery.state) ? `${parseInt(battery.state, 10)}%` : '--%';

    return `<div class="meta">
      <span class="chip${doorOpen ? ' open' : ''}"><span class="status-dot"></span>${escapeHtml(statusText)}</span>
      <span class="battery">${IC.battery}${escapeHtml(batteryText)}</span>
      <span class="meta-sep">·</span>
      <span class="event-text">${escapeHtml(eventVerb)}${eventTime ? ` ${escapeHtml(eventTime)}` : ''}</span>
    </div>`;
  }

  _toggle() {
    this._open = !this._open;
    if (!this._open) this._openSubmenus.clear();
    this._updateOpenState();
    this._notifyLayoutChanged();
  }

  _toggleSubmenu(id, event) {
    event?.stopPropagation();
    const submenuId = String(id);
    const wasOpen = this._openSubmenus.has(submenuId);
    const item = this._config.menus.find((candidate) => !candidate.divider && menuValue(candidate) === submenuId);
    if (item && menuLabel(item).toLowerCase() === 'home') this._setSelected(id);
    this._openSubmenus.clear();
    if (!wasOpen) this._openSubmenus.add(submenuId);
    this._render();
    this._notifyLayoutChanged();
  }

  _notifyLayoutChanged() {
    this._applyGridSpan();
    requestAnimationFrame(() => {
      this._applyGridSpan();
      this.dispatchEvent(new Event('iron-resize', { bubbles: true, composed: true }));
    });
  }

  _applyGridSpan() {
    const span = this._layoutRows();
    [this, this.parentElement, this.parentElement?.parentElement].forEach((el) => {
      if (el?.style) el.style.gridRowEnd = `span ${span}`;
    });
  }

  _updateOpenState() {
    const btn = this._shadow.querySelector('.hamburger');
    const wrap = this._shadow.querySelector('.menu-wrap');
    if (btn) {
      btn.classList.toggle('open', this._open);
      btn.innerHTML = this._open ? IC.close : IC.hamburger;
    }
    if (wrap) wrap.classList.toggle('open', this._open);
  }

  _render() {
    const cfg = this._config;
    // Hide menu items whose registered action isn't available right now
    // (e.g. a "Kiosk Preview" item when the kiosk-preview card isn't loaded).
    const items = (cfg.menus || []).filter(
      (item) => item.divider || isActionAvailable(item.action),
    );
    this._applyGridSpan();
    const showMenuIcons = cfg.show_menu_icons !== false;
    const expandedDesktopSubmenus = new Set(splitIds(cfg.expanded_desktop_submenus));
    const activeValue = this._activeValue();
    const renderTopItem = (item) => {
      if (item.divider) return '<div class="divider"></div>';
      if (item.parent !== ROOT_PARENT) return '';

      const value = menuValue(item);
      const children = this._childrenOf(item.id);
      const hasChildren = children.length > 0;
      const submenuOpen = this._openSubmenus.has(String(item.id));
      const active = value === String(activeValue) || this._hasActiveChild(item);
      const top = `<div class="item${active ? ' active' : ''}${submenuOpen ? ' submenu-open' : ''}${showMenuIcons ? '' : ' no-icon'}" data-value="${escapeHtml(value)}" ${hasChildren ? `data-submenu="${escapeHtml(item.id)}"` : ''}>
        <span class="icon"><ha-icon icon="${escapeHtml(displayIcon(item))}"></ha-icon></span>
        <span class="label">${escapeHtml(displayLabel(item))}</span>
        ${hasChildren ? `<span class="chevron">${IC.chevron}</span>` : ''}
      </div>`;

      if (!hasChildren) return top;

      const childRows = children.map((child) => {
        const childValue = menuValue(child);
        const childActive = childValue === String(activeValue);
        return `<div class="submenu-btn${childActive ? ' active' : ''}" data-value="${escapeHtml(childValue)}">
          <span class="submenu-dot"></span>${escapeHtml(displayLabel(child))}
        </div>`;
      }).join('');

      return `${top}
        <div class="submenu-wrap${submenuOpen ? ' open' : ''}">
          <div class="submenu-inner">
            <div class="submenu">${childRows}</div>
          </div>
        </div>`;
    };

    const renderDesktopItem = (item, forceTop = false) => {
      if (item.divider || (!forceTop && item.parent !== ROOT_PARENT)) return '';
      const value = menuValue(item);
      const children = this._childrenOf(item.id);
      const hasChildren = children.length > 0;
      const open = this._openSubmenus.has(String(item.id));
      const active = value === String(activeValue) || this._hasActiveChild(item);
      const childRows = children.map((child) => {
        const childValue = menuValue(child);
        const childActive = childValue === String(activeValue);
        return `<div class="desktop-subitem${childActive ? ' active' : ''}${showMenuIcons ? '' : ' no-icon'}" data-value="${escapeHtml(childValue)}">
          ${showMenuIcons ? `<ha-icon icon="${escapeHtml(displayIcon(child))}"></ha-icon>` : ''}
          <span>${escapeHtml(displayLabel(child))}</span>
        </div>`;
      }).join('');
      return `<div class="desktop-item-wrap">
        <button class="desktop-item${active ? ' active' : ''}${open ? ' open' : ''}${showMenuIcons ? '' : ' no-icon'}" type="button" data-value="${escapeHtml(value)}" ${hasChildren ? `data-submenu="${escapeHtml(item.id)}"` : ''}>
          ${showMenuIcons ? `<ha-icon icon="${escapeHtml(displayIcon(item))}"></ha-icon>` : ''}
          <span>${escapeHtml(displayLabel(item))}</span>
          ${hasChildren ? `<span class="desktop-chevron">${IC.chevron}</span>` : ''}
        </button>
        ${hasChildren && open ? `<div class="desktop-dropdown">${childRows}</div>` : ''}
      </div>`;
    };
    const desktopItems = items.flatMap((item) => {
      if (item.divider || item.parent !== ROOT_PARENT) return [];
      const children = this._childrenOf(item.id);
      if (children.length && expandedDesktopSubmenus.has(String(item.id))) return children;
      return [item];
    });

    this._shadow.innerHTML = `<style>${CSS}</style>
      <div class="menu-card ${themeClass(cfg.theme)} layout-${escapeHtml(cfg.layout || 'responsive')} align-${escapeHtml(cfg.menu_align || 'right')}" style="--menu-scale:${cfg.font_scale || 1}">
        <div class="title-card${cfg.show_title === false ? ' no-title' : ''}${cfg.show_header_icon === false ? ' no-header-icon' : ''}${cfg.show_secondary_info === false ? ' no-secondary' : ''}">
          <div class="icon-wrap">
            <div class="home-tile" role="button" tabindex="0" aria-label="Select home">${headerIconHtml(cfg.icon)}</div>
          </div>
          <div class="text-col">
            <span class="title">${escapeHtml(cfg.title || 'Menu')}</span>
            ${this._metaHtml()}
          </div>
          <div class="desktop-menu">${desktopItems.map((item) => renderDesktopItem(item, item.parent !== ROOT_PARENT)).join('')}</div>
          <button class="hamburger${this._open ? ' open' : ''}" type="button" aria-label="Toggle menu">${this._open ? IC.close : IC.hamburger}</button>
          ${cfg.show_status_bar ? `<div class="am-status">
            <div class="row1">
              <span class="battery" ${cfg.show_status_battery ? '' : 'hidden'}>
                <ha-icon icon="mdi:battery-unknown"></ha-icon>
                <span class="bat-pct">--%</span>
              </span>
              <span class="clock" ${cfg.show_status_clock ? '' : 'hidden'}>--:--</span>
            </div>
            <div class="row2">
              <span class="device" ${cfg.show_status_device ? '' : 'hidden'}>${escapeHtml(statusGetDeviceId())}</span>
              <span class="net" ${cfg.show_status_network ? '' : 'hidden'}>online</span>
            </div>
          </div>` : ''}
        </div>
        <div class="menu-wrap${this._open ? ' open' : ''}">
          <div class="menu-inner">
            <div class="menu">
              ${items.map(renderTopItem).join('')}
            </div>
          </div>
        </div>
      </div>`;

    if (cfg.show_status_bar) this._refreshStatusBar();
    this._shadow.querySelector('.hamburger')?.addEventListener('click', () => this._toggle());
    this._shadow.querySelector('.home-tile')?.addEventListener('click', () => {
      const home = this._homeItem();
      if (home) this._select(menuValue(home));
    });
    this._shadow.querySelector('.home-tile')?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      const home = this._homeItem();
      if (home) this._select(menuValue(home));
    });
    this._shadow.querySelectorAll('.item[data-submenu]').forEach((el) => {
      el.addEventListener('click', (event) => this._toggleSubmenu(el.dataset.submenu, event));
    });
    this._shadow.querySelectorAll('.item:not([data-submenu]), .submenu-btn').forEach((el) => {
      el.addEventListener('click', () => this._select(el.dataset.value));
    });
    this._shadow.querySelectorAll('.desktop-item[data-submenu]').forEach((el) => {
      el.addEventListener('click', (event) => this._toggleSubmenu(el.dataset.submenu, event));
    });
    this._shadow.querySelectorAll('.desktop-item:not([data-submenu]), .desktop-subitem').forEach((el) => {
      el.addEventListener('click', () => this._select(el.dataset.value));
    });
  }
}

class AveryMenu2Editor extends HTMLElement {
  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'open' });
    this._config = cloneConfig();
  }

  set hass(hass) {
    this._hass = hass;
    this._shadow.querySelectorAll('ha-icon-picker').forEach((picker) => {
      picker.hass = hass;
    });
    this._shadow.querySelectorAll('ha-entity-picker').forEach((picker) => {
      picker.hass = hass;
    });
  }

  setConfig(config) {
    this._config = cloneConfig(config);
    if (!this._rendered) this._render();
  }

  _parentOptions(currentIndex) {
    const current = this._config.menus[currentIndex];
    return [
      `<option value="${ROOT_PARENT}" ${current?.parent === ROOT_PARENT ? 'selected' : ''}>0 - Top level</option>`,
      ...this._config.menus
        .map((item, index) => ({ item, index }))
        .filter(({ item, index }) => !item.divider && index !== currentIndex && item.id !== current?.id && !this._isDescendant(item.id, current?.id))
        .map(({ item }) => `<option value="${escapeHtml(item.id)}" ${String(current?.parent) === String(item.id) ? 'selected' : ''}>${escapeHtml(item.id)} - ${escapeHtml(item.label || 'Menu item')}</option>`),
    ].join('');
  }

  _isDescendant(candidateId, currentId, seen = new Set()) {
    if (!candidateId || !currentId || seen.has(candidateId)) return false;
    if (String(candidateId) === String(currentId)) return true;
    seen.add(candidateId);
    const candidate = this._config.menus.find((item) => !item.divider && String(item.id) === String(candidateId));
    if (!candidate || candidate.parent === ROOT_PARENT) return false;
    return this._isDescendant(candidate.parent, currentId, seen);
  }

  _render() {
    const cfg = this._config;
    const menus = cfg.menus || [];

    this._shadow.innerHTML = `<style>${EDITOR_CSS}</style>
      <div class="editor">
        <div class="section">
          <h3>Settings</h3>
          <div class="row">
            <label>Title<small>Brand text on the left of the bar. Hide it with “Show title” below.</small></label>
            <input value="${escapeHtml(cfg.title)}" onchange="window._averyMenu2Update('title', this.value)">
          </div>
          <div class="row icon-row">
            <label>Header icon<small>Icon shown in the tile beside the title.</small></label>
            <ha-icon-picker data-field="icon"></ha-icon-picker>
            <span class="icon-preview">${headerIconHtml(cfg.icon)}</span>
          </div>
          <div class="row">
            <label>Theme<small>Follow the dashboard theme, or force dark/light for this bar.</small></label>
            <select onchange="window._averyMenu2Update('theme', this.value)">
              <option value="dashboard" ${cfg.theme === 'dashboard' ? 'selected' : ''}>Use dashboard theme</option>
              <option value="dark" ${cfg.theme === 'dark' ? 'selected' : ''}>Dark</option>
              <option value="light" ${cfg.theme === 'light' ? 'selected' : ''}>Light</option>
            </select>
          </div>
          <div class="row">
            <label>Layout<small>Responsive adapts to width · Hamburger collapses to a button · Horizontal keeps one row.</small></label>
            <select onchange="window._averyMenu2Update('layout', this.value)">
              <option value="responsive" ${cfg.layout === 'responsive' ? 'selected' : ''}>Responsive</option>
              <option value="hamburger" ${cfg.layout === 'hamburger' ? 'selected' : ''}>Hamburger</option>
              <option value="horizontal" ${cfg.layout === 'horizontal' ? 'selected' : ''}>Horizontal</option>
            </select>
          </div>
          <div class="row">
            <label>Menu align<small>Where the nav items sit in the bar — left, centre, or right.</small></label>
            <select onchange="window._averyMenu2Update('menu_align', this.value)">
              <option value="left" ${cfg.menu_align === 'left' ? 'selected' : ''}>Left</option>
              <option value="center" ${cfg.menu_align === 'center' ? 'selected' : ''}>Center</option>
              <option value="right" ${(cfg.menu_align || 'right') === 'right' ? 'selected' : ''}>Right</option>
            </select>
          </div>
          <div class="row">
            <label>Font scale<small>Overall size multiplier — 1 is default, 1.2 is 20% larger.</small></label>
            <input type="number" min="0.6" max="2" step="0.05" value="${escapeHtml(cfg.font_scale ?? 1)}" placeholder="1" onchange="window._averyMenu2Update('font_scale', Number(this.value) || 1)">
          </div>
          <div class="row">
            <label>Expanded desktop submenus<small>Comma-separated parent labels/ids to keep open on desktop, e.g. rooms,apps.</small></label>
            <input value="${escapeHtml(cfg.expanded_desktop_submenus || '')}" placeholder="rooms,apps" onchange="window._averyMenu2Update('expanded_desktop_submenus', this.value)">
          </div>
          <div class="row">
            <label>Variable name<small>Dashboard variable this menu sets to the selected item’s id.</small></label>
            <input value="${escapeHtml(cfg.variable_name)}" onchange="window._averyMenu2Update('variable_name', this.value)">
          </div>
          <div class="row">
            <label>State entity<small>Optional entity to store/read the active selection (instead of a variable).</small></label>
            <ha-entity-picker data-field="entity"></ha-entity-picker>
          </div>
          <div class="row">
            <label>Navigate on select<small>Also navigate to the item’s path when it’s chosen.</small></label>
            <input type="checkbox" ${cfg.navigate_on_select ? 'checked' : ''} onchange="window._averyMenu2Update('navigate_on_select', this.checked)">
          </div>
          <div class="row">
            <label>Show title<small>Show the brand text on the left. Off = nav items start at the edge.</small></label>
            <input type="checkbox" ${cfg.show_title !== false ? 'checked' : ''} onchange="window._averyMenu2Update('show_title', this.checked)">
          </div>
          <div class="row">
            <label>Show header icon<small>Show or hide the icon tile beside the title.</small></label>
            <input type="checkbox" ${cfg.show_header_icon !== false ? 'checked' : ''} onchange="window._averyMenu2Update('show_header_icon', this.checked)">
          </div>
          <div class="row">
            <label>Menu icons<small>Show an icon next to each menu item’s label.</small></label>
            <input type="checkbox" ${cfg.show_menu_icons !== false ? 'checked' : ''} onchange="window._averyMenu2Update('show_menu_icons', this.checked)">
          </div>
          <div class="row">
            <label>Secondary info<small>Show the small status line under the title.</small></label>
            <input type="checkbox" ${cfg.show_secondary_info !== false ? 'checked' : ''} onchange="window._averyMenu2Update('show_secondary_info', this.checked)">
          </div>
          <div class="row">
            <label>Door status<small>Show front-door open/closed and its battery in the bar.</small></label>
            <input type="checkbox" ${cfg.show_door_status ? 'checked' : ''} onchange="window._averyMenu2Update('show_door_status', this.checked)">
          </div>
          <div class="row">
            <label>Door entity<small>Contact/binary sensor read for the door open/closed state.</small></label>
            <ha-entity-picker data-field="door_entity"></ha-entity-picker>
          </div>
          <div class="row">
            <label>Battery entity<small>Battery level for the door sensor above.</small></label>
            <ha-entity-picker data-field="door_battery_entity"></ha-entity-picker>
          </div>
        </div>
        <div class="section">
          <h3>Status Bar</h3>
          <div class="row">
            <label>Show status bar<small>A right-aligned block showing this device’s battery, clock, name and connection — separate from “Secondary info”.</small></label>
            <input type="checkbox" ${cfg.show_status_bar ? 'checked' : ''} onchange="window._averyMenu2Update('show_status_bar', this.checked)">
          </div>
          <div class="row">
            <label>Battery<small>Show this device’s battery level.</small></label>
            <input type="checkbox" ${cfg.show_status_battery !== false ? 'checked' : ''} onchange="window._averyMenu2Update('show_status_battery', this.checked)">
          </div>
          <div class="row">
            <label>Clock<small>Show the current time.</small></label>
            <input type="checkbox" ${cfg.show_status_clock !== false ? 'checked' : ''} onchange="window._averyMenu2Update('show_status_clock', this.checked)">
          </div>
          <div class="row">
            <label>Clock format<small>12- or 24-hour time.</small></label>
            <select onchange="window._averyMenu2Update('status_clock_format', this.value)">
              <option value="24h" ${cfg.status_clock_format === '24h' ? 'selected' : ''}>24-hour</option>
              <option value="12h" ${cfg.status_clock_format === '12h' ? 'selected' : ''}>12-hour</option>
            </select>
          </div>
          <div class="row">
            <label>Clock seconds<small>Include seconds in the time.</small></label>
            <input type="checkbox" ${cfg.status_show_seconds ? 'checked' : ''} onchange="window._averyMenu2Update('status_show_seconds', this.checked)">
          </div>
          <div class="row">
            <label>Device name<small>Show the browser/device name (from the HA companion app).</small></label>
            <input type="checkbox" ${cfg.show_status_device !== false ? 'checked' : ''} onchange="window._averyMenu2Update('show_status_device', this.checked)">
          </div>
          <div class="row">
            <label>Network status<small>Show an online/offline connection indicator.</small></label>
            <input type="checkbox" ${cfg.show_status_network !== false ? 'checked' : ''} onchange="window._averyMenu2Update('show_status_network', this.checked)">
          </div>
        </div>
        <div class="section">
          <h3>Menu Items</h3>
          <div class="menu-list">
            ${menus.map((item, index) => item.divider
              ? `<div class="menu-item">
                  <div class="mi-header">
                    <span class="id-badge">divider</span>
                    <div class="divider-label"></div>
                  </div>
                  <div class="mi-footer">
                    <div class="move-controls">
                      <button type="button" onclick="window._averyMenu2MoveItem(${index}, -1)" ${index === 0 ? 'disabled' : ''}>Up</button>
                      <button type="button" onclick="window._averyMenu2MoveItem(${index}, 1)" ${index === menus.length - 1 ? 'disabled' : ''}>Down</button>
                    </div>
                    <button type="button" class="remove" onclick="window._averyMenu2RemoveItem(${index})">Remove</button>
                  </div>
                </div>`
              : `<div class="menu-item">
                  <div class="mi-header">
                    <span class="id-badge">${escapeHtml(item.id)}</span>
                    <input placeholder="Label" value="${escapeHtml(item.label)}" onchange="window._averyMenu2UpdateItem(${index}, 'label', this.value)">
                  </div>
                  <div class="mi-grid">
                    <label class="full">Icon
                      <ha-icon-picker data-index="${index}" data-field="item-icon"></ha-icon-picker>
                    </label>
                    <label>Level
                      <select onchange="window._averyMenu2UpdateItem(${index}, 'parent', this.value)">
                        ${this._parentOptions(index)}
                      </select>
                    </label>
                    <label>Navigation path
                      <input placeholder="/lovelace/home" value="${escapeHtml(item.navigation_path || '')}" onchange="window._averyMenu2UpdateItem(${index}, 'navigation_path', this.value)" ${item.action ? 'disabled' : ''}>
                    </label>
                    <label>Action
                      <select onchange="window._averyMenu2UpdateItem(${index}, 'action', this.value)" title="Special action — overrides navigation when set">
                        <option value="" ${!item.action ? 'selected' : ''}>(navigate)</option>
                        ${Object.entries(ACTION_REGISTRY).map(([key, def]) => {
                          const available = def.isAvailable?.();
                          const selected = item.action === key;
                          return `<option value="${escapeHtml(key)}" ${selected ? 'selected' : ''} ${available ? '' : 'disabled'}>${escapeHtml(def.label)}${available ? '' : ' (card not loaded)'}</option>`;
                        }).join('')}
                      </select>
                    </label>
                  </div>
                  <div class="mi-footer">
                    <div class="move-controls">
                      <button type="button" onclick="window._averyMenu2MoveItem(${index}, -1)" ${index === 0 ? 'disabled' : ''}>Up</button>
                      <button type="button" onclick="window._averyMenu2MoveItem(${index}, 1)" ${index === menus.length - 1 ? 'disabled' : ''}>Down</button>
                    </div>
                    <button type="button" class="remove" onclick="window._averyMenu2RemoveItem(${index})">Remove</button>
                  </div>
                </div>`
            ).join('')}
          </div>
          <button class="add" type="button" onclick="window._averyMenu2AddItem()">Add Menu Item</button>
          <button class="add" type="button" onclick="window._averyMenu2AddDivider()">Add Divider</button>
        </div>
      </div>`;

    window._averyMenu2Update = (field, value) => {
      this._config[field] = value;
      this._fireEvent();
    };
    window._averyMenu2UpdateItem = (index, field, value) => {
      if (!this._config.menus[index]) return;
      this._config.menus[index][field] = field === 'parent' ? normalizeParent(value) : String(value);
      this._fireEvent();
    };
    window._averyMenu2MoveItem = (index, direction) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= this._config.menus.length) return;
      const [item] = this._config.menus.splice(index, 1);
      this._config.menus.splice(nextIndex, 0, item);
      this._render();
      this._fireEvent();
    };
    window._averyMenu2RemoveItem = (index) => {
      const removed = this._config.menus[index];
      this._config.menus.splice(index, 1);
      if (removed?.id) {
        this._config.menus.forEach((item) => {
          if (!item.divider && String(item.parent) === String(removed.id)) item.parent = ROOT_PARENT;
        });
      }
      this._render();
      this._fireEvent();
    };
    window._averyMenu2AddItem = () => {
      this._config.menus.push({ id: nextMenuId(this._config.menus), parent: ROOT_PARENT, label: '', icon: 'mdi:menu' });
      this._render();
      this._fireEvent();
    };
    window._averyMenu2AddDivider = () => {
      this._config.menus.push({ divider: true });
      this._render();
      this._fireEvent();
    };

    this._wireIconPickers();
    this._wireEntityPickers();
    this._rendered = true;
  }

  _wireIconPickers() {
    this._shadow.querySelectorAll('ha-icon-picker').forEach((picker) => {
      const index = picker.dataset.index;
      const isHeader = picker.dataset.field === 'icon';
      picker.hass = this._hass;
      picker.value = isHeader ? this._config.icon || '' : this._config.menus[index]?.icon || 'mdi:menu';
      picker.label = '';
      const handler = (event) => {
        const value = event.detail?.value ?? event.target?.value;
        if (!value) return;
        if (isHeader) this._config.icon = value;
        else if (this._config.menus[index]) this._config.menus[index].icon = value;
        this._fireEvent();
      };
      picker.addEventListener('value-changed', handler);
      picker.addEventListener('change', handler);
    });
  }

  _wireEntityPickers() {
    this._shadow.querySelectorAll('ha-entity-picker').forEach((picker) => {
      const field = picker.dataset.field;
      picker.hass = this._hass;
      picker.value = this._config[field] || '';
      picker.allowCustomEntity = true;
      const handler = (event) => {
        const value = event.detail?.value ?? event.target?.value ?? '';
        this._config[field] = value;
        this._fireEvent();
      };
      picker.addEventListener('value-changed', handler);
      picker.addEventListener('change', handler);
    });
  }

  _fireEvent() {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    }));
  }
}

if (!customElements.get('avery-menu-2')) customElements.define('avery-menu-2', AveryMenu2);
if (!customElements.get('avery-menu-2-editor')) customElements.define('avery-menu-2-editor', AveryMenu2Editor);

window.customCards = window.customCards || [];
window.customCards.push({ preview: false,
  type: 'avery-menu-2',
  name: 'Avery Menu 2',
  description: 'Configurable local-state menu based on Avery Divider Card',
});
