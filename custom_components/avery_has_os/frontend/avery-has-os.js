// Avery HAS OS — shared frontend runtime for the Avery HAS OS ecosystem.
//
// Served by the avery_has_os integration and auto-loaded on every Home Assistant
// page. Every Avery card depends on `window.Avery` being present for shared
// design tokens, helpers, and — critically — the ENTITLEMENT SEAM.
//
// Phase 1 is entirely free, so isUnlocked() always returns true. This is the
// single swap point where the future licensed companion (Phase 2, only if the
// ecosystem passes ~500 installs) will plug in real signed-key validation.
// Cards MUST call Avery.isUnlocked(feature) rather than assuming access, so
// the paywall can be introduced later with zero card rewrites.

(() => {
  const VERSION = '0.1.0';

  // Idempotent: HA may inject this script more than once across navigations.
  if (window.Avery && window.Avery.version === VERSION) return;

  const Avery = {
    version: VERSION,

    // ---- Entitlement seam -------------------------------------------------
    // Free phase: everything unlocked. Do NOT hard-code `true` in cards —
    // always route through this so the Phase 2 license check is a drop-in.
    _freePhase: true,
    isUnlocked(_feature) {
      return this._freePhase;
    },

    // Refresh entitlement state from the backend (no-op result in free phase,
    // but wires the round-trip cards will rely on later). Safe to call early;
    // resolves to the snapshot or a free-phase default if the WS isn't ready.
    async refreshEntitlements(hass) {
      try {
        const res = await hass.connection.sendMessagePromise({
          type: 'avery_has_os/entitlements',
        });
        this._freePhase = !!res.free_phase;
        return res;
      } catch (_e) {
        // Backend not reachable yet — stay in the safe free-phase default.
        return { version: VERSION, free_phase: this._freePhase, unlocked: '*' };
      }
    },
  };

  window.Avery = Avery;
  console.info(`[Avery HAS OS] v${VERSION} runtime loaded`);
})();
