# Avery Core

The shared runtime for the **Avery HAS OS** ecosystem — a suite of designed,
cohesive Home Assistant cards, themes, and plugins.

Avery Core is a small integration that:

- serves a shared frontend runtime (`window.AveryCore`) that every Avery card
  builds on — design tokens, helpers, and a common base;
- provides the ecosystem's version/health entity.

Install this first; the Avery cards and themes depend on it.

## Install (HACS)

1. Add this repository to HACS (or install from the HACS default store once
   listed).
2. Install **Avery Core**.
3. Restart Home Assistant.
4. Settings → Devices & Services → **Add Integration** → **Avery Core**.

## Status & roadmap

Avery HAS OS is **free** today. The framework, cards, and themes are open source
and free to use. A paid tier of additional cards *may* be offered in the future;
if it ever is, it will be clearly optional and everything currently free will
stay free. We'll always be upfront about it.

## License & credits

Licensed under the Apache License 2.0. See [`LICENSE`](LICENSE).

Avery Core and the Avery HAS OS ecosystem are built for Home Assistant and draw
on patterns from the Home Assistant project and its community, with thanks.
