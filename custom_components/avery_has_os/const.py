"""Constants for Avery HAS OS."""
from __future__ import annotations

DOMAIN = "avery_has_os"
VERSION = "0.1.0"

# Frontend runtime served by this integration and auto-loaded on every HA page.
URL_BASE = "/avery_has_os"
FRONTEND_SCRIPT = "avery-has-os.js"

# Free-tier cards bundled with the integration. Each is served from the
# frontend/cards/ directory and auto-loaded on every page, so it self-registers
# (customElements.define + window.customCards.push) into the ＋ Add Card picker
# with nothing else to download. This is the "one install, every free card"
# promise. Paid cards are NOT bundled — they will be fetched on valid key entry
# (Phase 2), gated through Avery.isUnlocked() in the runtime.
CARDS_URL_BASE = f"{URL_BASE}/cards"
CARDS = [
    "avery-modern-card.js",
    "avery-pixel-clock-card.js",
    "avery-weather-card.js",
    "avery-menu-2.js",
    "avery-divider-card.js",
    "avery-bbc-radio-card.js",
]
