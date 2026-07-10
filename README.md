<!-- Banner: replace images/banner.png with a wide hero (≈1280×400) -->
<p align="center">
  <img src="images/banner.png" alt="Avery HAS OS" width="100%">
</p>

<h1 align="center">Avery Core</h1>

<p align="center">
  <strong>The foundation of the Avery HAS OS ecosystem —<br>
  a designed, cohesive suite of cards, themes, and plugins for Home Assistant.</strong>
</p>

<p align="center">
  <a href="https://github.com/hacs/integration"><img src="https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge" alt="HACS Custom"></a>
  <img src="https://img.shields.io/badge/Home%20Assistant-2024.4%2B-41BDF5.svg?style=for-the-badge&logo=home-assistant&logoColor=white" alt="Home Assistant 2024.4+">
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge" alt="License Apache 2.0">
  <a href="https://github.com/avery-has-developer/avery-core/actions/workflows/validate.yml"><img src="https://img.shields.io/github/actions/workflow/status/avery-has-developer/avery-core/validate.yml?style=for-the-badge&label=validation" alt="Validation"></a>
</p>

---

## What is Avery Core?

**Avery Core** is the shared runtime that powers the **Avery HAS OS** ecosystem —
a growing collection of beautifully designed Home Assistant cards, themes, and
plugins that feel like one product instead of a pile of parts.

Install Core once, and every Avery card and theme builds on the same foundation:
a consistent design language, shared helpers, and a common runtime. It's small,
fast, and stays out of your way.

> **Install this first.** Avery cards and themes depend on Avery Core being present.

<!-- Hero screenshot: replace images/dashboard.png with your Avery dashboard -->
<p align="center">
  <img src="images/dashboard.png" alt="An Avery HAS OS dashboard" width="100%">
</p>

## Why Avery Core?

- 🎨 **One cohesive design system** — every Avery card and theme shares the same
  tokens, spacing, and polish, so your dashboards look intentional.
- 🧩 **A true foundation** — cards register against a single shared runtime
  (`window.AveryCore`) instead of re-implementing the basics.
- 🪶 **Light and native** — a standard Home Assistant integration with a tiny
  footprint. No cloud, no account, no tracking.
- 🔓 **Free and open source** — Apache-2.0 licensed. The framework, cards, and
  themes are free to use.
- 🛡️ **Built to a standard** — validated on every change with Home Assistant's
  own `hassfest` and HACS checks.

## Installation

### HACS (recommended)

1. In HACS, open the **⋮** menu → **Custom repositories**.
2. Add `https://github.com/avery-has-developer/avery-core` with category
   **Integration**.
3. Search for **Avery Core** in HACS and **Download** it.
4. **Restart Home Assistant.**
5. Go to **Settings → Devices & Services → Add Integration → Avery Core**.

> Once Avery HAS OS is in the HACS default store, steps 1–2 won't be needed —
> you'll find it by searching HACS directly.

### Manual

Copy `custom_components/avery_core` into your Home Assistant `config/custom_components/`
directory, restart, then add the integration as above.

## Configuration

None. Avery Core sets itself up with a single click — there's nothing to configure.
It exposes an `Avery Core` device with a **Version** sensor so you can see what's
installed at a glance.

## The Avery HAS OS ecosystem

Avery Core is the first piece. The suite of Avery cards and themes builds on top
of it — a clock, weather, and more, all sharing this foundation.

Avery HAS OS is **free today**, and the framework, cards, and themes here are
open source. A paid tier of *additional* cards **may** be offered in the future.
If it ever is, it will be clearly optional, and everything currently free will
stay free. We'll always be upfront about it. This is a labour of love, built in
the open.

## Support

- 🐛 Found a bug or have an idea? [Open an issue](https://github.com/avery-has-developer/avery-core/issues).

## Credits & license

Licensed under the **Apache License 2.0** — see [`LICENSE`](LICENSE) and
[`NOTICE`](NOTICE).

Built for [Home Assistant](https://www.home-assistant.io/), drawing on patterns
from the Home Assistant project and its community, with thanks.
