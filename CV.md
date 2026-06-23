## Recent activity (last 12 months)

*Auto-generated weekly from commit history · updated 2026-06-23*

I've been primarily focused on building a SaaS crypto algo trading platform (summit) with an AI twist — implementing backtest engines, LLM-driven exit decisioning, real-time trading guards, membership tiers, and an interactive dashboard with equity curves and performance analytics. In parallel, I reworked the ESP32-S3 firmware for a USB HID mouse/keyboard emulator (j-uni-hid), adding new hardware variants, dual-core and USB support, and BLE power optimization. I also built a Windows WDK input filter driver (input-driver) for low-level keyboard/mouse capture and injection. Across secondary projects, I iterated on crypto trading strategy parameterizations in freqtrade, researched price-prediction models with Mixture-of-Experts architectures, developed computer vision pipelines for poker table state recognition, maintained a Windows file-tagging utility, built an Android TTS engine with multiple Russian voice models, and worked on an on-device LLM agent for Android with sub-agent delegation and tool-calling. The work spans C#, C++, Python, Kotlin, and TypeScript, covering everything from systems programming and embedded firmware to machine learning, mobile app development, and infrastructure/CI automation.
> **2026 Jun**
>
> - **Backtesting and AI trading engine** *(summit)* — Built out the trader backtest engine with per-trade MFE/MAE recording, slippage and fee modeling, LLM exit decisioning, and performance optimizations like O(n) replay.
> - **Trading platform features and fixes** *(summit)* — Added membership tiers, positional trading guards, tag-based trader profiles, equity curve dashboard, Telegram integration, and fixed UI and data-fetching bugs.
> - **Input automation scenario engine** *(jolt)* — Built an AutoHotKey alternative with interception support, configurable conditions and rule sets, and debug logging.
> - **CV pipeline and profile automation** *(jamminroot)* — Refined the LLM-based CV generation pipeline — added voice enforcement, repo coverage controls, and improved PDF output with skill sections.

> **2026 May**
>
> - **USB HID firmware variants** *(j-uni-hid)* — Developed new firmware variants v13s8x8 for ESP32-S3 and v13 with expanded USB HID event emission, and added PlatformIO support.
> - **Windows input filter driver** *(input-driver)* — Reworked the Interception-class WDK driver with push-style event delivery, hardware ID and event type filtering, and an integration test suite.
> - **Windows file-tagging utilities** *(intag2)* — Fixed UTF-16 LE encoding for desktop.ini to render non-ASCII folder tags correctly, and added .pdf file type to the context menu.
> - **Android TTS engine work** *(j-tts-android)* — Added question/exclamation intonation sliders, integrated F5-TTS and Piper engines, improved text normalization with RuNorm, and built mmap-based model loading.
> - **Aim-assist tool refinement** *(MEMU3)* — Switched YOLO inference to DirectML, dropped unused classes, and reworked the bow/flick mechanism with bezier motion and closed-loop tracking.
> - **Knowledge base firmware** *(biscuit)* — Added a knowledge base app, FB2 reader, screensaver folder, and Mesh Chat fixes to the e-ink device firmware.

> **2026 Apr**
>
> - **Trading platform infrastructure** *(summit)* — Continued backtest engine enhancements including published track records and user filtering, plus scanner pair resolution fixes.
> - **USB HID firmware fix** *(j-uni-hid)* — Fixed a disconnect issue in the v13 firmware variant.
> - **E-ink device firmware apps** *(papyrix)* — Built map and knowledge base apps with tile rendering, FB2 encoding fixes, and an icon-based home screen for the custom e-reader firmware.
> - **Proxy client enhancements** *(FlCLash)* — Added XHTTP transport support and re-exposed provider APIs via a Mihomo fork.
> - **Aim-assist debug overlay** *(MEMU3)* — Added HP-based aim scaling, debug overlay window, and YOLO confidence threshold UI.

> **2026 Mar**
>
> - **Crypto price model research** *(crypto-model-research)* — Ran hundreds of experiments with Mixture-of-Experts architectures, snapshot ensembles, and temperature scaling; achieved best combined F1 of 0.7817.
> - **On-device LLM agent development** *(ozwil-android)* — Rewrote sub-agent architecture with session-based delegation, added Qwen 3.5 models, KV cache reuse, wake processing service, and tool-safety rails.
> - **Trading platform AI engine** *(summit)* — Implemented LLM-based entry/exit decision modes with configurable strategy phases deep integration.
> - **E-ink launcher app** *(blackboard-launcher)* — Built an Android launcher for e-ink devices with swipe page navigation, note-taking focus, and status bar control.
> - **Aim-assist polish** *(MEMU3)* — Rewrote overlay to D3D11, added linger mode, autofire, and HID click emulation.

> **2026 Feb**
>
> - **Windows file-tagging release pipeline** *(intag2)* — Overhauled CI to automate builds, CHANGELOG generation, and Microsoft Store publishing — fixed multiple API issues and release workflows.
> - **Code intelligence engine** *(jaxon)* — Expanded language support to C++, Go, Rust; added LSP integration, incremental sync, and improved dead code detection for DI frameworks.
> - **Telegram automation node** *(n8n-nodes-telepilot-2)* — Stabilized an n8n node for Telegram automation — fixed auth race conditions, CI pipeline issues, and added album trigger support.
> - **YOLO labeling tool** *(yolo-labeler)* — Built a fast on-host YOLO labeler with multi-select mark mode and keyboard shortcuts.
> - **Neovim config and dotfiles** *(.dotfiles)* — Migrated to Neovim 0.11+ LSP API, added OSC 52 clipboard support, and fixed treesitter parser setup.
> - **Trading monitor app** *(freqtrade_monitor)* — Polished a Flutter-based freqtrade monitoring app with glassy cards, winrate charts, and import/export features.
> - **Trading bot monitor app** *(freqtrade-tg-multibot)* — Added web project with Docker support, improved daily profit calculations, and enhanced Telegram authentication.

> **2026 Jan**
>
> - **Poker computer vision pipeline** *(poker-cv)* — Achieved high-accuracy hand and board card detection — added recovery module, interpreted timeline visualization, and comprehensive testing.
> - **USB HID updates** *(j-uni-hid)* — Added graceful COM restart handling to the firmware.
> - **Task management app** *(tasker)* — Built an Android tasker with touch event visualization and direct launch features.

> **2025**
>
> - **Crypto trading strategies** *(freqtrade_startegies)* — Iterated extensively on freqtrade strategy parameterization — added, refactored, and backtested dozens of variants with optimized entry/exit signals and leverage settings.
> - **Trading bot Telegram dashboard** *(freqtrade-tg-multibot)* — Built a C# web application for monitoring freqtrade bots via Telegram with Docker support, daily profit calculations, and authentication.
> - **Telegram assistant bot** *(pAssistant)* — Maintained a Telegram automation tool for content curation, with webhook integration, image deduplication, and multi-target sending.
> - **USB HID firmware evolution** *(j-uni-hid)* — Developed multiple firmware versions (v9-v12) for ESP32-S3 — added BLE+USB dual protocols, performance modes, swipe fixes, and Android support.
> - **AI coding agent tooling** *(auto-claude)* — Extended a multi-session AI coding assistant with squash-merge, git rules system, task IDs, and completion tracking.
> - **Trading platform foundations** *(summit)* — Began early work on the SaaS crypto trading platform — setting up the backtest engine core, trading guard system, and initial UI components.
> - **Aim-assist tooling** *(MEMU3)* — Developed an aim-assist tool with USB-HID interaction, rate limiting, and mode support.
> - **Telegram n8n node work** *(n8n-nodes-telepilot-2)* — Maintained an n8n node for Telegram automation — added Docker deployment, Alpine support, and auth fixes.

> **2024**
>
> - **Telegram assistant bot** *(pAssistant)* — Maintained a Telegram content automation tool — added logging, error handling, and summarization features.
> - **Crypto trading strategies** *(freqtrade_strats)* — Developed and optimized multiple freqtrade trading strategies with hyperparameter tuning and leverage adjustments.
> - **Windows file-tagging utility** *(intag)* — Updated the Windows Explorer file-tagging tool with CLI support, UI polish, and mutex logging.
> - **Miscellaneous tooling** *(notes)* — Started personal notes repository.
