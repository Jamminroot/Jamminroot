## Recent activity (last 12 months)

*Auto-generated weekly from commit history · updated 2026-06-22*

I built the follower execution pipeline, guard system, and trader dashboard for Summit, a SaaS crypto trading platform. This work spanned transactional outbox messaging, live SL/TP on multiple exchange APIs, a layered risk guard with independent per-follow configuration, and a full notification stack (in-app and Telegram). I also shipped position lifecycle management, admin analytics, and user-facing features like onboarding and leaderboards.

On the systems side, I developed a multi-version HID emulation firmware for the ESP32-S3, culminating in v13 with fire-and-forget event injection and an 8×8 matrix variant. I wrote a Windows kernel-mode input filter driver that captures and injects keyboard/mouse events, complete with a push-style listener API, integration tests, and per-event block predicates.

I conducted AI research with mixture-of-experts and ensemble architectures for crypto price prediction, running hundreds of experiments and pushing accuracy to new highs. For Android, I engineered an on-device LLM assistant with sub-agent delegation and tool routing, and I integrated multiple TTS engines with custom pitch, intonation, and licensing for commercial use. I also built a computer vision pipeline for poker hand recognition and a YOLO-based labeling tool.

Additionally, I continued work on the Intag file-tagging tool, Freqtrade strategies, Telegram bot infrastructure for trade monitoring, autonomous coding tooling, and an AutoHotKey alternative.
> **2026 Jun**
>
> - **Follower execution and guard system** *(summit)* — Built the follower copy-trading pipeline with transactional outbox, live SL/TP, layered risk guards, notifications, and a redesigned trader dashboard.
> - **Minimal input automation tool** *(jolt)* — Implemented a lightweight AutoHotKey alternative with a scenario engine, stateless themes, and interception driver integration.

> **2026 May**
>
> - **HID emulation firmware v13** *(j-uni-hid)* — Released v13 firmware with fire-and-forget event injection and an 8×8 matrix variant, improving USB HID throughput.
> - **Windows input filter driver** *(input-driver)* — Delivered a KMDF keyboard/mouse filter driver with a push-style listener API, integration tests, and relaxed SDDL for easier deployment.
> - **File tagging Explorer extension** *(intag2)* — Fixed desktop.ini encoding to correctly render non-ASCII characters in Windows Explorer.
> - **Android TTS engine expansion** *(j-tts-android)* — Added TeraTTS and XTTS v2 engines, pitch and intonation controls, and cleaned up licensing for commercial distribution.

> **2026 Apr**
>
> - **Firmware fixes and new variant** *(j-uni-hid)* — Fixed a device disconnection bug and drafted a new v13s8x8 firmware variant for the matrix layout.
> - **CI and release pipeline overhaul** *(intag2)* — Restructured CI into separate build and store-publish workflows and fixed changelog generation.
> - **E-ink map and knowledge base** *(papyrix)* — Optimized the map renderer for Apple Silicon and built a knowledge base app with taxonomy browser for the custom e-ink reader.

> **2026 Mar**
>
> - **Crypto price prediction research** *(crypto-model-research)* — Ran hundreds of experiments with mixture-of-experts and ensemble models, achieving new best accuracy on spike regression.
> - **On-device LLM assistant** *(ozwil-android)* — Architected a sub-agent delegation system, tool-routing pipeline, and background processing for a pocket LLM with phone-use capabilities.
> - **Aim assist overlay rewrite** *(MEMU3)* — Replaced the rendering overlay with a D3D11 composition engine and added a YOLO-confidence-gated autofire system.

> **2026 Feb**
>
> - **Store publishing stabilisation** *(intag2)* — Battled Partner Center API quirks by switching to PowerShell REST with exponential backoff and finalised the Microsoft Store submission pipeline.
> - **Graph-powered code intelligence engine** *(jaxon)* — Built Jaxon, a knowledge graph indexer with tree-sitter parsers, DI registration detection, and MCP tools for AI agent integration.

> **2026 Jan**
>
> - **Computer vision poker hand capture** *(poker-cv)* — Completed a pipeline for detecting hands, board cards, and blinds from online poker screenshots, achieving over 99% accuracy.

> **2025**
>
> - **Algorithmic trading strategy development** *(freqtrade_startegies)* — Developed and backtested dozens of trading strategies (Fenix, NASOS) with hyperopt optimisation, targeting high Sharpe ratios and low drawdown.
> - **Freqtrade Telegram monitoring bot** *(freqtrade-tg-multibot)* — Built a multi-bot Telegram interface with daily profit tracking, a web dashboard, and Docker deployment for Freqtrade.
> - **Autonomous AI coding tooling** *(auto-claude)* — Extended the multi-session AI coding framework with squash-merge workflows, completion tracking, and Git rules configuration.
> - **Content assistant bots** *(pAssistant)* — Created Telegram bot assistants for content summarisation, multi-target forwarding, and image deduplication.

> **2024**
>
> - **Early Freqtrade strategy work** *(freqtrade_strats)* — Experimented with strategy optimisation and custom indicators for algorithmic trading.
> - **Windows Explorer tagging tool** *(intag)* — Developed a file-tagging shell extension with CLI support and UI polish.
