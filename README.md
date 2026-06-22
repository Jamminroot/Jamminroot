## .NET Software Developer, TechLead at Deeplay.io.

### What a time to be alive!

#### [@jamminroot (telegram)](https://t.me/jamminroot), [Dmitrii Chichuk (LinkedIn)](https://linkedin.com/in/dchichuk)

Feel free to reach out!

<!-- ACTIVITY-SUMMARY-START -->
## Recent activity (last 12 months)

*Auto-generated weekly from commit history · updated 2026-06-22*

Over the past year, I've been building and iterating on a broad set of projects spanning trading infrastructure, embedded firmware, AI research, and developer tooling.

The core of my work has been on Summit, a SaaS crypto algorithmic trading platform. I've been building out its entire feature surface — from live trading execution and risk management guards to a social-follow system, trader discovery, and a full notification pipeline. The work has been a mix of greenfield feature development, deep execution-layer hardening, and UI/UX polish across the admin and user dashboards.

On the hardware and systems side, I've been developing j-uni-hid, a feature-rich mouse and keyboard emulation firmware for ESP32-S3, and input-driver, a Windows kernel input filter driver. Both projects involved low-level protocol work, performance tuning, and building robust testing and integration pipelines.

I've also invested significant time in AI and research-adjacent projects. Crypto-model-research was a focused R&D campaign on price prediction models, running hundreds of experiments on mixture-of-experts architectures. Poker-cv applied computer vision to online poker, building a full pipeline from screen capture to hand history reconstruction. Ozwil-android brought on-device LLM with tool-use capabilities to mobile, while j-tts-android built a multi-engine TTS system with deep linguistic processing.

Across the rest of my portfolio, I maintained and extended several tools: a Windows Explorer tagging utility (intag2), a CV-based aim assistant (MEMU3), a code intelligence graph engine (jaxon), and various automation and CI/CD pipelines for my own infrastructure.
<!-- ACTIVITY-SUMMARY-END -->

<img src="https://raw.githubusercontent.com/Jamminroot/Jamminroot/master/cards/charts.svg" alt="Activity charts">

<img src="https://raw.githubusercontent.com/Jamminroot/Jamminroot/master/cards/projects.svg" alt="Project cards">

<!-- ACTIVITY-TIMELINE-START -->
> **2026 Jun**
>
> - **Trading platform feature push** *(summit)* — Built out live SL/TP execution, named guard system, position lifecycle timeline, and user-facing balance/credit UX. Shipped Telegram notifications, paper follow mode, and trader discovery with leaderboard.
> - **Minimal automation engine** *(jolt)* — Built a lightweight AutoHotKey alternative with a typed scenario engine, input gate, and interception support.
> - **CV activity timeline generator** *(jamminroot)* — Iterated on the LLM-driven CV generation pipeline, enforcing voice rules and refining the output schema.

> **2026 May**
>
> - **HID firmware v13 release** *(j-uni-hid)* — Shipped v13 firmware with fire-and-forget event emission, 8x8 matrix variant, and platformio build support.
> - **Windows input filter driver** *(input-driver)* — Built a KMDF input filter driver with capture and injection, added push-style event delivery, and wrote an integration test suite covering all documented capabilities.
> - **Aim assist refinement** *(MEMU3)* — Reworked the YOLO inference pipeline to DirectML, added closed-loop flick tracking, and built a D3D11 overlay with status window.
> - **Android TTS engine expansion** *(j-tts-android)* — Added pitch control, intonation sliders, and multiple new TTS engines including sherpa-onnx and TeraTTS. Integrated RuNorm text normalization and removed legacy engines.

> **2026 Apr**
>
> - **E-ink firmware apps** *(papyrix)* — Built a map app with tile rendering, a knowledge base browser, and FB2 encoding fixes for the custom xteink firmware.
> - **Explorer tagging utility** *(intag2)* — Fixed desktop.ini encoding for non-ASCII rendering and preserved existing folder metadata entries.
> - **Clash proxy transport** *(FlCLash)* — Added XHTTP transport support and re-exposed proxy provider APIs in the Clash.Meta fork.

> **2026 Mar**
>
> - **Crypto price model research** *(crypto-model-research)* — Ran a large-scale experiment campaign on mixture-of-experts architectures, pushing the model to a new champion with split MoE gates and cross-pair features.
> - **On-device LLM with tool use** *(ozwil-android)* — Rewrote the sub-agent architecture with session-based delegation, added model presets, KV cache reuse, and background service architecture for wake processing.
> - **E-ink launcher polish** *(blackboard-launcher)* — Built a note-taking-centric Android launcher for e-ink readers with gesture navigation and status bar control.
> - **Aim assist YOLO integration** *(MEMU3)* — Added YOLO confidence threshold UI, runtime fallback from Interception to USB-HID, and restricted aim assist to focused window.

> **2026 Feb**
>
> - **Code intelligence graph engine** *(jaxon)* — Built a graph-powered code intelligence engine with LSP integration, DI registration detection, and multi-language tree-sitter parsers.
> - **Explorer tagging CI overhaul** *(intag2)* — Restructured the CI pipeline for manual triggering, fixed MS Store publishing with PowerShell REST API, and added auto-updating changelog.
> - **YOLO labeling tool** *(yolo-labeler)* — Built a fast, on-host YOLO labeling tool with multi-select mark mode and batch operations.
> - **Neovim dotfiles** *(.dotfiles)* — Set up a full Neovim IDE configuration with LSP, treesitter, and pre-commit secret detection hooks.

> **2026 Jan**
>
> - **Poker CV pipeline** *(poker-cv)* — Built a computer vision pipeline for online poker, achieving high accuracy on hand detection, board cards, and blinds. Added log reconstruction and generator-based recovery.
> - **HID firmware v12 and v13** *(j-uni-hid)* — Developed dual-core v12 and USB-focused v13 firmware variants with new device support and graceful COM restart.
> - **n8n TelePilot node fixes** *(n8n-nodes-telepilot-2)* — Stabilized the TDLib session storage and fixed auth race conditions in the n8n TelePilot node.
> - **Android task automation** *(tasker)* — Built a task automation app with touch event visualization and direct launch UX improvements.

> **2025**
>
> - **Trading platform foundation** *(summit)* — Built the core SaaS trading platform throughout the year — execution engine, risk guards, follow system, and admin tooling. Heavy focus on resilience and observability.
> - **HID firmware iterations** *(j-uni-hid)* — Developed multiple firmware versions (v10-v11) across ESP32-S3 and C3 targets, adding BLE touch, USB mouse, self-reporting, and performance profiles.
> - **Freqtrade strategy development** *(freqtrade_startegies)* — Iterated on dozens of trading strategies with hyperopt tuning, parameter optimization, and new strategy implementations across multiple timeframes.
> - **Autonomous coding agent** *(auto-claude)* — Built an autonomous multi-session AI coding system with worktree management, squash merging, and Git rules configuration.
> - **Telegram trading bots** *(freqtrade-tg-multibot)* — Built a multi-bot Telegram management system with Docker support, profit tracking, and Telegram authentication.
> - **Content aggregation and LLM tools** *(pAssistant)* — Built a content aggregation and forwarding tool with multi-target sending, image deduplication, and summarization features.

> **2024**
>
> - **Freqtrade strategy optimization** *(freqtrade_strats)* — Ran hyperopt campaigns and strategy tuning across multiple configurations, focusing on high win rate and low drawdown setups.
> - **Explorer tagging utility** *(intag)* — Built the initial version of a Windows Explorer file tagging utility with CLI support and property management.
<!-- ACTIVITY-TIMELINE-END -->

[**Download CV (PDF)**](https://raw.githubusercontent.com/Jamminroot/Jamminroot/master/cards/cv.pdf)
