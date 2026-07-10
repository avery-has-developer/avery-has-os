"""Entitlement seam for the Avery HAS OS ecosystem.

Phase 1 is entirely free, so every feature is unlocked. This module exists as
the SINGLE swap point where the future licensed companion (Phase 2, only if the
ecosystem passes ~500 installs) will plug in real signed-key + Keygen.sh
validation. Backend platforms and the frontend runtime MUST query this rather
than assuming access, so the paywall can be introduced later with no rewrite of
any card or platform.

Do NOT inline `True` at call sites — always go through `is_unlocked()`.
"""
from __future__ import annotations

# Flipped to False (and given real logic) by the licensed companion in Phase 2.
FREE_PHASE = True


def is_unlocked(feature: str) -> bool:
    """Return whether a feature is available to this install.

    Free phase: always True. The `feature` argument is accepted now so call
    sites are already shaped for per-feature gating later.
    """
    if FREE_PHASE:
        return True
    # Phase 2 replaces this branch with signed-key / Keygen.sh checks.
    return False


def entitlements_snapshot() -> dict:
    """Serializable view of the current entitlement state for the frontend."""
    return {"free_phase": FREE_PHASE, "unlocked": "*" if FREE_PHASE else []}
