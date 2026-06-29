## .NET Software Developer, TechLead at Deeplay.io.

### What a time to be alive!

#### [@jamminroot (telegram)](https://t.me/jamminroot), [Dmitrii Chichuk (LinkedIn)](https://linkedin.com/in/dchichuk)

Feel free to reach out!

<!-- ACTIVITY-SUMMARY-START -->
## Recent activity (last 12 months)

*Auto-generated weekly from commit history · updated 2026-06-29*

Over the past year, I've been deeply focused on building and refining Summit, a SaaS crypto algo-trading platform with AI and neural network components — this is my primary project. I've been shipping features across the full stack: LLM-powered sentiment analysis and decision-making, futures configuration templates, real-time cost tracking from OpenRouter, a unified news and announcement system, and extensive UI polish. In parallel, I've been developing firmware for ESP32-S3-based HID devices (j-uni-hid) and a Windows kernel-mode input filter driver (input-driver), both of which are also primary projects. On the secondary side, I've been conducting systematic research into crypto price prediction models (crypto-model-research), building a computer vision pipeline for poker table state extraction (poker-cv), developing an Android TTS app with multiple neural engines (j-tts-android), creating an on-device LLM agent for Android (ozwil-android), and maintaining a Windows Explorer file-tagging utility (intag2). I've also iterated on algorithmic trading strategies (freqtrade_startegies) and Telegram-based bot monitoring tools (freqtrade-tg-multibot). The work spans C#, C++, Python, Kotlin, and embedded systems, with a strong emphasis on practical, self-hosted tooling and research-driven experimentation.
<!-- ACTIVITY-SUMMARY-END -->

<img src="https://raw.githubusercontent.com/Jamminroot/Jamminroot/master/cards/charts.svg" alt="Activity charts">

<img src="https://raw.githubusercontent.com/Jamminroot/Jamminroot/master/cards/projects.svg" alt="Project cards">

<!-- ACTIVITY-TIMELINE-START -->
> **2026 Jun**
>
> - **Summit: AI trading platform core work** *(summit)* — Built LLM-powered sentiment analysis and decision-making pipelines, futures-config templates with optimization defaults, real-time per-call cost tracking from OpenRouter, a unified news and announcement system, and extensive UI polish across the platform.
> - **Jolt: minimal AHK alternative** *(jolt)* — Added opt-in debug logging, fixed winapi hotkey condition evaluation, and refined the scenario engine with typed actions and interception support.
> - **Jamminroot: CV automation tooling** *(jamminroot)* — Added LLM model override via environment variable, enforced first-person voice in CV output, and refined the CV generation pipeline with dry-run support and better repo importance tagging.

> **2026 May**
>
> - **j-uni-hid: ESP32-S3 HID firmware** *(j-uni-hid)* — Developed v13 firmware variant with fire-and-forget USB HID event emission and an 8x8 matrix variant with PlatformIO support.
> - **input-driver: Windows input filter driver** *(input-driver)* — Added push-style event delivery API, relaxed SDDL to Interactive Users, and built an integration-test runner covering all documented capabilities.
> - **j-tts-android: multi-engine TTS app** *(j-tts-android)* — Added question/exclamation intonation sliders, removed deprecated TTS engines, shipped F5-TTS and GPT-SoVITS export recipes, and integrated sherpa-onnx for Russian Piper voices.
> - **MEMU3: CV and input emulation RnD** *(MEMU3)* — Switched YOLO GPU inference from CUDA to DirectML, added closed-loop tracking flick with bezier motion and user-input compensation, and refactored the mode system.
> - **biscuit: e-ink firmware expansion** *(biscuit)* — Added Knowledge Base app, FB2 reader, screensaver folder, and Mesh Chat fixes to the biscuit firmware for xteink 4.

> **2026 Apr**
>
> - **j-uni-hid: firmware variant work** *(j-uni-hid)* — Drafted new v13s8x8 firmware variant and fixed a device disconnection issue in the v13 firmware.
> - **papyrix: e-ink firmware features** *(papyrix)* — Optimized map renderer for Apple Silicon, added grayscale tileserver, built map and Knowledge Base apps with full UI, and fixed FB2 encoding support for windows-1251 and KOI8-R.
> - **FlCLash: proxy client update** *(FlCLash)* — Bumped Clash.Meta submodule to re-expose ProxiesWithProviders and GetProxyNameList APIs, and added XHTTP transport support.

> **2026 Mar**
>
> - **crypto-model-research: price prediction RnD** *(crypto-model-research)* — Conducted hundreds of experiments on crypto price prediction models, achieving new best scores with Mixture-of-Experts architectures, snapshot ensembles, and cross-pair features; documented the full research pipeline.
> - **ozwil-android: on-device LLM agent** *(ozwil-android)* — Rewrote sub-agent architecture with session-based delegation and tool execution, added KV cache reuse, conversation revert/fork, and a questionnaire-based setup wizard.
> - **MEMU3: aim assist and overlay work** *(MEMU3)* — Restricted aim assist to focused window, persisted mode and autofire state, and rewrote the overlay using D3D11+D2D+DComp with a status window.
> - **blackboard-launcher: E-Ink launcher** *(blackboard-launcher)* — Overhauled backdrop rendering, added swipe page navigation, status bar control, and fixed Onyx SDK drawing reliability.

> **2026 Feb**
>
> - **intag2: Windows file-tagging utility** *(intag2)* — Added .pdf to supported extensions, restructured CI pipelines for manual triggering and auto-drafting releases, fixed Store publishing workflows, and added CLI support for reading properties.
> - **jaxon: code intelligence engine** *(jaxon)* — Added LSP integration for language-server-powered analysis, index freshness detection with incremental sync, and expanded DI registration and dead code detection for multiple frameworks.
> - **n8n-nodes-telepilot-2: Telegram n8n nodes** *(n8n-nodes-telepilot-2)* — Fixed auth race conditions, upgraded CI test version, added retry logic for npm install, and added a new album trigger.
> - **yolo-labeler: on-host YOLO labeler** *(yolo-labeler)* — Added multi-select mark mode for batch delete and label clearing, Ctrl+Delete entry deletion, and flexible yaml resolution.
> - **dotfiles: chezmoi-managed config** *(.dotfiles)* — Set up initial Neovim config with full IDE setup, added pre-commit hook for secret detection, and fixed treesitter and LSP config for Neovim 0.11+.

> **2026 Jan**
>
> - **poker-cv: computer vision for poker** *(poker-cv)* — Achieved 99% hand detection and 97.8% board card accuracy by implementing generator-based recovery, pipeline API, and comprehensive state validation; added smoke tests and refactored constants.
> - **j-uni-hid: firmware updates** *(j-uni-hid)* — Added graceful COM restart handling to the firmware.
> - **tasker: Android task management** *(tasker)* — Improved UX with direct launch, completed status, and touch event visualization on sensor charts.
> - **n8n-nodes-claudecode: Claude n8n nodes** *(n8n-nodes-claudecode)* — Fixed abort controller cleanup and changed default permission mode to acceptEdits.

> **2025 Dec**
>
> - **j-uni-hid: major firmware iteration** *(j-uni-hid)* — Developed v11 firmware with USB Touch, BLE Touch+Mouse, self-reporting, performance profiles, and throttled mode; fixed Android reconnect and touch jitter issues.
> - **auto-claude: autonomous AI coding tool** *(auto-claude)* — Added squash-merge support, completion detection, Git Rules system, and Task ID fields to the autonomous multi-session AI coding application.
> - **MEMU3: HID and aim assist updates** *(MEMU3)* — Added USB HID mouse movement hack with rate limiting and integrated it with the aim assistant.

> **2025**
>
> - **freqtrade_startegies: trading strategy development** *(freqtrade_startegies)* — Developed and iterated on numerous algorithmic trading strategies for Freqtrade, including Fenix, botman, and custom pattern-based strategies, with extensive backtesting and parameter optimization.
> - **freqtrade-tg-multibot: Telegram bot for trading** *(freqtrade-tg-multibot)* — Built a Telegram-based multi-bot monitoring and management tool for Freqtrade instances, with web dashboard, Docker support, and daily profit calculations.
> - **pAssistant: Telegram automation tooling** *(pAssistant)* — Maintained a Telegram content aggregation and reposting bot, adding image deduplication, multi-target sending, and summarization features.
> - **freqtrade_monitor: Flutter trading dashboard** *(freqtrade_monitor)* — Built a Flutter-based mobile dashboard for monitoring Freqtrade instances, with glassy cards, winrate charts, and import/export functionality.
> - **n8n-nodes-telepilot-2: Telegram n8n integration** *(n8n-nodes-telepilot-2)* — Forked and maintained n8n nodes for Telegram automation, adding Alpine Linux support and Docker deployment.

> **2024**
>
> - **freqtrade_strats: strategy optimization** *(freqtrade_strats)* — Optimized and backtested various trading strategies for Freqtrade, focusing on high win rate and low drawdown configurations.
> - **pAssistant: Telegram bot maintenance** *(pAssistant)* — Continued maintenance of the Telegram content bot, with logging improvements and bug fixes.
<!-- ACTIVITY-TIMELINE-END -->

[**Download CV (PDF)**](https://raw.githubusercontent.com/Jamminroot/Jamminroot/master/cards/cv.pdf)
