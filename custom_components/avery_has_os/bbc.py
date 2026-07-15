"""Server-side BBC 'now playing' proxy for the Avery BBC Radio card.

BBC's now-playing API (rms.api.bbc.co.uk) is fine to call server-side but returns
HTTP 403 to any non-BBC browser Origin, and the live streams carry no in-band
metadata. So the card can't fetch programme/track info itself. This view fetches
it on the server and hands the dashboard a small normalised JSON payload,
same-origin (no CORS). Data is public BBC schedule info; the view is unauthenticated
so a plain fetch() from the card works, and `service` is whitelisted to BBC ids
so it can't be used to reach arbitrary URLs.
"""
from __future__ import annotations

import logging
import re
import time

from aiohttp import web

from homeassistant.components.http import HomeAssistantView
from homeassistant.helpers.aiohttp_client import async_get_clientsession

_LOGGER = logging.getLogger(__name__)

_SERVICE_RE = re.compile(r"^bbc_[a-z0-9_]+$")
_IMG_RECIPE = "480x480"
_CACHE_TTL = 20.0  # seconds — one upstream call per service per ~20s, all clients share it

# service -> (expiry_ts, payload)
_cache: dict[str, tuple[float, dict]] = {}


def _image(tpl: str | None) -> str | None:
    return tpl.replace("{recipe}", _IMG_RECIPE) if tpl else None


async def _fetch_now_playing(hass, service: str) -> dict:
    """Return {line, title, artist, image, kind} for a BBC service."""
    session = async_get_clientsession(hass)
    empty = {"line": None, "title": None, "artist": None, "image": None, "kind": None}

    # 1) Current track (music stations) — the 'now_playing' segment.
    seg = (
        f"https://rms.api.bbc.co.uk/v2/services/{service}/segments/latest"
        "?experience=domestic&offset=0&limit=4"
    )
    try:
        async with session.get(seg, timeout=8) as r:
            if r.status == 200:
                data = await r.json()
                for it in data.get("data", []):
                    if (it.get("offset") or {}).get("now_playing"):
                        t = it.get("titles", {})
                        artist, track = t.get("primary"), t.get("secondary")
                        if track:
                            return {
                                "line": f"{artist} — {track}" if artist else track,
                                "title": track,
                                "artist": artist,
                                "image": _image(it.get("image_url")),
                                "kind": "track",
                            }
    except Exception as err:  # noqa: BLE001 - upstream flakiness must not 500 us
        _LOGGER.debug("BBC segments fetch failed for %s: %s", service, err)

    # 2) Current programme (talk stations, or no track playing).
    br = f"https://rms.api.bbc.co.uk/v2/broadcasts/latest?service={service}"
    try:
        async with session.get(br, timeout=8) as r:
            if r.status == 200:
                data = await r.json()
                items = data.get("data") or []
                if items:
                    p = items[0].get("programme", {})
                    t = p.get("titles", {})
                    primary, secondary = t.get("primary"), t.get("secondary")
                    imgs = p.get("images") or []
                    img = (imgs[0].get("url") if imgs else None) or p.get("image_url")
                    if primary:
                        return {
                            "line": f"{primary} — {secondary}" if secondary else primary,
                            "title": primary,
                            "artist": secondary,
                            "image": _image(img),
                            "kind": "programme",
                        }
    except Exception as err:  # noqa: BLE001
        _LOGGER.debug("BBC broadcast fetch failed for %s: %s", service, err)

    return empty


class AveryBBCNowPlayingView(HomeAssistantView):
    """GET /avery_has_os/bbc/nowplaying?service=bbc_radio_one."""

    url = "/avery_has_os/bbc/nowplaying"
    name = "avery_has_os:bbc_nowplaying"
    requires_auth = False

    async def get(self, request: web.Request) -> web.Response:
        service = request.query.get("service", "")
        if not _SERVICE_RE.match(service) or len(service) > 40:
            return web.json_response({"error": "invalid service"}, status=400)

        now = time.monotonic()
        cached = _cache.get(service)
        if cached and cached[0] > now:
            payload = cached[1]
        else:
            hass = request.app["hass"]
            payload = await _fetch_now_playing(hass, service)
            _cache[service] = (now + _CACHE_TTL, payload)

        return web.json_response(
            payload, headers={"Cache-Control": "public, max-age=20"}
        )
