<p align="center">
  <a href="https://avery-has-developer.github.io/avery-has-os/"><strong>🌐 See the full experience →</strong></a>
</p>

<p align="center">
  <a href="https://github.com/hacs/integration"><img src="https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge" alt="HACS Custom"></a>
  <img src="https://img.shields.io/badge/Home%20Assistant-2024.4%2B-41BDF5.svg?style=for-the-badge&logo=home-assistant&logoColor=white" alt="Home Assistant 2024.4+">
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge" alt="License Apache 2.0">
  <a href="https://github.com/avery-has-developer/avery-has-os/actions/workflows/validate.yml"><img src="https://img.shields.io/github/actions/workflow/status/avery-has-developer/avery-has-os/validate.yml?style=for-the-badge&label=validation" alt="Validation"></a>
</p>

---

## Why Avery HAS OS?

Avery HAS OS is a **standard, scalable platform for building beautiful dashboards.**
At its heart is the **Avery Modern Card** — a generic card system that can be
customised to display *any* entity in your Home Assistant. Around it sits a suite of
**20+ beautifully themed, animated cards and apps** that transform your dashboard
into a genuinely functional, usable system.

- ⛅ **Animated Weather** — realistic animations for sun, rain, and lightning.
- 🕹️ **Pixel Clock** — an animated LED clock showing the time *and* your named timers.
- 🤖 **Jarvis-II** turns a tablet into an intelligent voice assistant; the **Avery
  Assist** card makes it smarter still, with Alexa Mode and wake-word integration.

…and it all comes **from a single integration** — no tracking multiple updates, no
modifying resources, no managing customisations by hand.

- 🧱 **Completely self-contained** — no other cards or add-ons required. No card-mod,
  no custom CSS, no YAML. Every card is fully configurable right in the dashboard UI.
- 🪶 **Light & private** — no cloud, no account, no tracking. It just runs.
- 🔓 **Free forever core** — the baseline is open source and free. Always.

## ✨ Included — free with every install

The free baseline — one install brings the whole suite, with the themes in your
theme selector and every card in your **＋ Add Card** picker. Nothing else to
download. Rolling out card by card; the flagship Modern Card is live today.

| | Card | What it does | Status |
|---|------|--------------|--------|
| 🧩 | **Modern Card** | The flagship — tile, status, and hero/room views in one, with climate, security, presence, and lights. | ✅ Available |
| 🕹️ | **Pixel Clock** | An LED-matrix clock with built-in named timers & alarms. | 🔜 Coming soon |
| ⛅ | **Weather** | A clean, designed weather card. | 🔜 Coming soon |
| ☰ | **Menu** | A sleek navigation menu for moving around your dashboards. | 🔜 Coming soon |
| 🏷️ | **Room Name** | A tidy room/section header to label areas of your home. | 🔜 Coming soon |
| ➖ | **Divider** | Elegant section dividers to structure your dashboards. | 🔜 Coming soon |
| 🎨 | **Themes** | *Avery*, *Avery Frosted Glass*, and *Avery Dark Glass* — the signature Avery look. | 🔜 Coming soon |

<p align="center">
  <img src="https://raw.githubusercontent.com/avery-has-developer/avery-has-os/main/images/avery-screen-6.png" alt="Avery HAS OS — one install, every room" width="100%">
</p>

## 🔑 Avery Premium — unlock the full suite

Want more? **Avery Premium** adds a whole collection of richer cards. Buy a key,
paste it into Avery HAS OS, and they instantly appear as configurable cards in your
dashboards — no extra installs, no fuss. No key, no clutter: you only ever see what
you own.

Every premium card is **in active development** — not yet purchasable. This is the
roadmap we're building toward; keys and unlocking arrive once the suite is ready.

| | Card | What it does | Status |
|---|------|--------------|--------|
| 🤖 | **Jarvis-II** | A voice-assistant experience — a floating, always-there assistant for your home. | 🛠️ In development |
| 🗣️ | **Avery Assist** | Alexa Mode + wake-word voice, making Jarvis smarter still. | 🛠️ In development |
| 📅 | **Calendar** | A beautiful combined calendar across all your sources. | 🛠️ In development |
| 🖼️ | **Photo Frame** | Turn any dashboard into a rotating photo display. | 🛠️ In development |
| ✅ | **To-Do** | Designed task lists that actually look good. | 🛠️ In development |
| 🛒 | **Grocery** | A smart, aisle-aware shopping list. | 🛠️ In development |
| 🌡️ | **Nest** | A rich Nest thermostat & climate card. | 🛠️ In development |
| 📹 | **Blink + CCTV** | Live camera views and motion clips, beautifully presented. | 🛠️ In development |
| 🐾 | **Cat** | A playful pet-status card. | 🛠️ In development |
| ⏳ | **Countdown** | Count down to the moments that matter. | 🛠️ In development |
| 🎵 | **Music Player** | A gorgeous media player for your whole home. | 🛠️ In development |
| ♨️ | **Thermostat** | An advanced climate dial with fine control. | 🛠️ In development |
| 💡 | **Light Group** | Group and control your lights with style. | 🛠️ In development |
| 📺 | **LG TV** | Full control of your LG (webOS) television. | 🛠️ In development |
| 🔌 | **Appliances & Events** | Appliance status and household events at a glance. | 🛠️ In development |

> **How unlocking will work:** premium cards will be delivered only to key-holders.
> Enter a valid key in Avery HAS OS and it fetches and enables them — they show up in
> the add-card picker automatically. Everything you had free stays free. *(Keys and
> the premium suite are still in development — not yet available to purchase.)*

## Installation

### HACS

1. In HACS, open the **⋮** menu → **Custom repositories**.
2. Add `https://github.com/avery-has-developer/avery-has-os` with category **Integration**.
3. Search for **Avery HAS OS** in HACS and **Download** it.
4. **Restart Home Assistant.**
5. Go to **Settings → Devices & Services → Add Integration → Avery HAS OS**.

That's it — the free cards and themes are now ready in your dashboards.

### Unlocking Premium *(coming soon)*

Once the premium suite ships, you'll open Avery HAS OS in **Settings → Devices &
Services**, paste your license key, and the premium cards appear in the add-card
picker within moments. Premium keys aren't available to purchase yet.

## Roadmap & honesty

Avery HAS OS is **free today** and the baseline always will be — open source, no
strings. Premium is how the project sustains itself; it's entirely optional, and
nothing that's free will ever move behind the paywall. Built in the open, as a
labour of love.

## Credits & license

The free framework, cards, and themes are licensed under the **Apache License 2.0**
— see [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE). Built for
[Home Assistant](https://www.home-assistant.io/), with thanks to its community.
