"""Avery HAS OS — shared runtime + entitlement seam for the Avery HAS OS ecosystem.

Responsibilities (v0.1):
  - Serve the shared frontend runtime (avery-has-os.js) and auto-load it on every
    HA page, so cards can depend on `window.Avery` (design tokens, helpers,
    and the entitlement seam) being present.
  - Expose the entitlement seam to the frontend over a WebSocket command.
  - Register a version/health sensor. Because Avery HAS OS is a real integration
    (not just frontend resources), installs are counted in Home Assistant's
    public analytics — the ecosystem's adoption signal.

All feature access flows through entitlements.is_unlocked(); Phase 1 is free so
it always returns True. See entitlements.py.
"""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components import frontend, websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback

from .const import CARDS, CARDS_URL_BASE, DOMAIN, FRONTEND_SCRIPT, URL_BASE, VERSION
from .entitlements import entitlements_snapshot
from .themes import async_register_themes

_LOGGER = logging.getLogger(__name__)

PLATFORMS = ["sensor"]

# Module-global guards so the static path / WS command / extra-JS URL are only
# registered once per HA run even if the entry is reloaded.
_FRONTEND_REGISTERED = False
_WS_REGISTERED = False


def _asset_versions(frontend_dir: Path) -> dict[str, int | str]:
    """Return a {filename: cache-bust token} map from file mtimes.

    Runs in an executor (blocking stat IO). Falls back to the integration
    VERSION if a file can't be stat'd, so a URL is always produced.
    """
    versions: dict[str, int | str] = {}

    def _mtime(path: Path) -> int | str:
        try:
            return int(path.stat().st_mtime)
        except OSError:
            return VERSION

    versions[FRONTEND_SCRIPT] = _mtime(frontend_dir / FRONTEND_SCRIPT)
    for card in CARDS:
        versions[card] = _mtime(frontend_dir / "cards" / card)
    return versions


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Avery HAS OS from a config entry."""
    global _FRONTEND_REGISTERED, _WS_REGISTERED

    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = {"version": VERSION}

    if not _FRONTEND_REGISTERED:
        frontend_dir = Path(__file__).parent / "frontend"
        await hass.http.async_register_static_paths(
            [
                StaticPathConfig(URL_BASE, str(frontend_dir), cache_headers=False),
                StaticPathConfig(
                    CARDS_URL_BASE, str(frontend_dir / "cards"), cache_headers=False
                ),
            ]
        )
        # Load the shared runtime first, then every bundled free card — all as ES
        # modules, on every frontend page. Each card self-registers into the
        # ＋ Add Card picker, so a single install exposes the whole free suite
        # with no manual resource management.
        #
        # The ?v= cache-bust token is derived from each file's modification time,
        # not the integration version. This means an updated card (new release,
        # or a hot-swapped file during dev) always gets a fresh URL and browsers
        # refetch it — a version-only token would leave stale modules cached
        # whenever a file changed without a version bump.
        versions = await hass.async_add_executor_job(_asset_versions, frontend_dir)
        frontend.add_extra_js_url(
            hass, f"{URL_BASE}/{FRONTEND_SCRIPT}?v={versions[FRONTEND_SCRIPT]}"
        )
        for card in CARDS:
            frontend.add_extra_js_url(
                hass, f"{CARDS_URL_BASE}/{card}?v={versions[card]}"
            )
        _FRONTEND_REGISTERED = True
        _LOGGER.info(
            "Avery HAS OS frontend runtime + %d free cards registered at %s",
            len(CARDS),
            URL_BASE,
        )

    if not _WS_REGISTERED:
        websocket_api.async_register_command(hass, ws_entitlements)
        _WS_REGISTERED = True

    # Deliver the bundled Avery themes so a single install populates the theme
    # selector too — no separate HACS theme repo, no configuration.yaml edit.
    await async_register_themes(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry.

    The frontend static path / extra-JS URL and the WS command are process-wide
    and cheap to leave registered; only the sensor platform is torn down.
    """
    ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if ok:
        hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    return ok


@websocket_api.websocket_command({"type": "avery_has_os/entitlements"})
@callback
def ws_entitlements(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Return the current entitlement snapshot to the frontend runtime."""
    connection.send_result(
        msg["id"], {"version": VERSION, **entitlements_snapshot()}
    )
