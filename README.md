## .NET Software Developer, TechLead at Deeplay.io.

### What a time to be alive!

#### [@jamminroot (telegram)](https://t.me/jamminroot), [Dmitrii Chichuk (LinkedIn)](https://linkedin.com/in/dchichuk)

Feel free to reach out!

<!-- ACTIVITY-SUMMARY-START -->
## Recent activity (last 12 months)

*Auto-generated weekly from commit history · updated 2026-06-25*

I've been deeply engaged in building and refining a SaaS crypto algo trading platform (summit), integrating LLM-driven decision-making for exit strategies, position sizing, and scanner cadence. The platform underwent a major rename from Trader to Strategy, with a reusable expert pool and a quorum-based exit signal routing. On the firmware side, I developed feature-rich mouse and keyboard emulation firmware for ESP32-S3 (j-uni-hid), iterating through multiple versions with BLE, USB, and touch support. I also built a Windows input filter driver (input-driver) from scratch, adding push-style event delivery and integration tests.

Alongside these primary projects, I conducted extensive research on crypto price prediction models (crypto-model-research), achieving state-of-the-art results with Mixture of Experts architectures. I built an Android TTS app (j-tts-android) supporting multiple engines and Russian text normalisation, and an LLM-powered Android assistant (ozwil-android) with sub-agent delegation and tool routing. I also worked on computer vision for poker hand detection (poker-cv), a Windows Explorer tagging utility (intag2), and numerous Freqtrade trading strategies and monitoring tools. The year also included work on an autonomous coding assistant (auto-claude), a Telegram multi-bot manager, and various smaller utilities.
<!-- ACTIVITY-SUMMARY-END -->

<img src="https://raw.githubusercontent.com/Jamminroot/Jamminroot/master/cards/charts.svg" alt="Activity charts">

<img src="https://raw.githubusercontent.com/Jamminroot/Jamminroot/master/cards/projects.svg" alt="Project cards">

<!-- ACTIVITY-TIMELINE-START -->
> **2026 Jun**
>
> - **SaaS crypto algo trading platform** *(summit)* — Built and refined the trading platform with LLM-driven exit strategies, scanner cadence model, UI typography overhaul, and backend rename from Trader to Strategy.
> - **CV generation toolchain** *(jamminroot)* — Maintained the personal CV generator, adding LLM voice enforcement, dry-run mode, and heatmap improvements.
> - **Minimal AutoHotKey alternative** *(jolt)* — Built a lightweight input automation tool with interception support, scenario engine, and conditions system.

> **2026 May**
>
> - **ESP32-S3 firmware development** *(j-uni-hid)* — Developed firmware v13 with fire-and-forget emitting and 8x8 matrix variant for mouse and keyboard emulation.
> - **Windows input filter driver** *(input-driver)* — Shipped v1.2 with push-style event delivery, integration tests, and library predicates for the WDK driver.
> - **Windows Explorer tagging utility** *(intag2)* — Fixed desktop.ini encoding for non-ASCII folder metadata to ensure proper rendering in Explorer.
> - **Android TTS app** *(j-tts-android)* — Built the TTS app with multiple engines (Piper, VITS, F5-TTS), pitch control, and Russian text normalisation.
> - **CV generator enhancements** *(jamminroot)* — Added project cards with pulse charts and workflow rebase retries to the CV generation pipeline.
> - **Aim assist and YOLO inference** *(MEMU3)* — Refactored YOLO inference to DirectML, added bow/flick tracking, and improved aim assist modes.

> **2026 Apr**
>
> - **Firmware fixes and variants** *(j-uni-hid)* — Fixed dying/disconnect issues in firmware v13 and drafted the v13s8x8 variant.
> - **Tagging utility maintenance** *(intag2)* — Fixed changelog generation and preserved existing desktop.ini entries when writing folder metadata.
> - **Aim assist improvements** *(MEMU3)* — Added HP aim scaling, debug overlay, and YOLO confidence threshold UI.
> - **E-ink reader firmware** *(papyrix)* — Added Map app, Knowledge Base app, FB2 encoding fixes, and optimized map renderer for Apple Silicon.
> - **Proxy client enhancements** *(FlCLash)* — Added XHTTP transport support via rebased mihomo and bumped Clash.Meta.

> **2026 Mar**
>
> - **Crypto price prediction research** *(crypto-model-research)* — Conducted extensive experiments with MoE architectures and ensemble methods, achieving best combined F1 of 0.7817.
> - **LLM-powered Android assistant** *(ozwil-android)* — Rewrote sub-agent architecture with session-based delegation, added tool routing strategies, and improved model settings UI.
> - **Overlay and autofire for aim assist** *(MEMU3)* — Rewrote overlay to D3D11+D2D, added status window, autofire, and YOLO model loading.
> - **E-ink reader UI and features** *(papyrix)* — Rewrote MapApp UI to landscape, added tile server, and improved FB2 support.
> - **E-ink launcher development** *(blackboard-launcher)* — Overhauled backdrop, added swipe page navigation, status bar control, and gesture zones.
> - **Firmware version releases** *(j-uni-hid)* — Released v12 (dual-core) and v13 (USB) firmware variants for ESP32-S3.

> **2026 Feb**
>
> - **CI and release pipeline overhaul** *(intag2)* — Restructured CI pipelines for manual triggering, added auto-draft releases, and fixed Store submission workflows.
> - **Tagging utility documentation** *(intag)* — Updated README for v2.0 release and added privacy policy for Microsoft Store submission.
> - **Telegram node for n8n** *(n8n-nodes-telepilot-2)* — Fixed auth race condition, upgraded CI test version, and added album trigger.
> - **Code intelligence engine** *(jaxon)* — Added LSP integration, dead code detection improvements, and expanded language support with tree-sitter.
> - **Neovim configuration** *(.dotfiles)* — Updated Neovim config for 0.11 API, added secret detection pre-commit hook.
> - **YOLO labeler tool** *(yolo-labeler)* — Added multi-select mark mode and Ctrl+Delete deletion for fast annotation.
> - **Dotfiles management** *(dotfiles)* — Added SSH keys and initial chezmoi-managed dotfiles.

> **2026 Jan**
>
> - **Poker hand detection from video** *(poker-cv)* — Achieved 99% hand detection accuracy, added blinds detection, and built pipeline for poker state recovery from video.
> - **Firmware COM fix** *(j-uni-hid)* — Fixed graceful COM restart in firmware.
> - **Aim assist updates** *(MEMU3)* — Added updates to modes and fixes.
> - **Claude Code n8n node** *(n8n-nodes-claudecode)* — Updated to Claude Agent SDK v0.2.12 and fixed abort controller cleanup.
> - **Task management app** *(tasker)* — Improved UX with direct launch, completed status, and touch event visualization.

> **2025**
>
> - **Freqtrade trading strategies** *(freqtrade_startegies)* — Developed and optimized numerous trading strategies including Fenix, botman, and ns531 variants with parameter tuning and backtesting.
> - **Telegram multi-bot manager** *(freqtrade-tg-multibot)* — Built a web app with Docker support for managing multiple Freqtrade bots via Telegram, including daily profit calculations and authentication.
> - **Firmware v11 development** *(j-uni-hid)* — Continued firmware development with v11 featuring new devices, BLE improvements, self-reporting, and performance profiles.
> - **Autonomous coding assistant** *(auto-claude)* — Added squash-merge, git rules system, and task ID features to the multi-session AI coding tool.
> - **Telegram automation tool** *(pAssistant)* — Maintained the Telegram bot with summarization, image dedup, and multi-target sending.
> - **Freqtrade monitoring app** *(freqtrade_monitor)* — Built a Flutter monitoring app with charts, card UI, and import/export functionality.
> - **Aim assist initial development** *(MEMU3)* — Initial development with USB-HID rate limiting and aim assist integration.
> - **Telegram node for n8n** *(n8n-nodes-telepilot-2)* — Added Alpine Linux support and Docker deployment for the Telegram node.
> - **Tagging utility updates** *(intag)* — Added metadata property support and privacy policy for Store submission.
> - **Content collector tool** *(jContentCollector)* — Built a content collector with webhook and ad filtering.

> **2024**
>
> - **Trading strategy development** *(freqtrade_strats)* — Developed and optimized trading strategies with hyperopt and leverage adjustments.
> - **Telegram automation initial work** *(pAssistant)* — Initial development of Telegram automation tool with forwarding and logging.
> - **Tagging utility initial work** *(intag)* — Initial work on Windows Explorer tagging utility with UI polish.
<!-- ACTIVITY-TIMELINE-END -->

[**Download CV (PDF)**](https://raw.githubusercontent.com/Jamminroot/Jamminroot/master/cards/cv.pdf)
