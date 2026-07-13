"""Bundled Avery themes — copied into config/themes and registered live.

Home Assistant only reads ``config/themes/*.yaml`` when the user has a
``frontend: themes: !include_dir_merge_named themes`` include in their
configuration.yaml, which freshly-onboarded configs do not have. So the
"one install includes the themes" promise can't rely on file-drop alone.

This module does both:
  1. Copies the bundled theme YAMLs into ``config/themes/avery_has_os/`` so a
     user can inspect/override them and so an existing ``frontend: themes:``
     include keeps them across a Reload Themes.
  2. Merges the parsed themes straight into the frontend's in-memory registry
     (``hass.data[DATA_THEMES]``) and fires ``EVENT_THEMES_UPDATED`` — so they
     appear in the theme selector immediately, no configuration.yaml edit
     required. Re-run on every setup, so a restart re-injects them.
"""
from __future__ import annotations

import logging
import shutil
from pathlib import Path
from typing import Any

import yaml

from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

BUNDLED_THEMES_DIR = Path(__file__).parent / "themes"
# Namespaced sub-folder inside the user's config/themes so we never collide with
# or clobber the user's own theme files.
DEST_SUBDIR = "avery_has_os"


def _load_and_copy(bundled_dir: Path, dest_dir: Path) -> dict[str, Any]:
    """Copy bundled theme files to dest and return the merged theme mapping.

    Runs in an executor — blocking file IO only. safe_load is deliberate: the
    Avery themes are plain var mappings with no HA custom YAML tags.
    """
    dest_dir.mkdir(parents=True, exist_ok=True)
    merged: dict[str, Any] = {}
    for src in sorted(bundled_dir.glob("*.yaml")):
        shutil.copyfile(src, dest_dir / src.name)
        data = yaml.safe_load(src.read_text(encoding="utf-8")) or {}
        if isinstance(data, dict):
            merged.update(data)
    return merged


async def async_register_themes(hass: HomeAssistant) -> int:
    """Copy bundled themes into config/themes and register them live.

    Never raises — theme delivery is a nice-to-have and must not block the
    integration from setting up. Returns the number of themes registered.
    """
    dest = Path(hass.config.path("themes")) / DEST_SUBDIR
    try:
        themes = await hass.async_add_executor_job(
            _load_and_copy, BUNDLED_THEMES_DIR, dest
        )
    except Exception:  # noqa: BLE001 - never block setup on theme IO
        _LOGGER.exception("Avery HAS OS: failed to load bundled themes")
        return 0

    if not themes:
        return 0

    try:
        # Imported lazily so a future frontend refactor can't break setup — the
        # files are already written, and an include would still pick them up.
        from homeassistant.components.frontend import (  # noqa: PLC0415
            DATA_THEMES,
            EVENT_THEMES_UPDATED,
        )

        registry = hass.data.get(DATA_THEMES)
        if registry is None:
            hass.data[DATA_THEMES] = registry = {}
        registry.update(themes)
        hass.bus.async_fire(EVENT_THEMES_UPDATED)
    except Exception:  # noqa: BLE001
        _LOGGER.warning(
            "Avery HAS OS wrote theme files to %s but could not register them "
            "live; add `frontend: themes: !include_dir_merge_named themes` to "
            "configuration.yaml to load them",
            dest,
        )
        return 0

    _LOGGER.info("Avery HAS OS registered %d themes", len(themes))
    return len(themes)
