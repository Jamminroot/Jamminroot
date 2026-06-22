## Recent activity (last 12 months)

*Auto-generated weekly from commit history · updated 2026-06-22*

Over the past year, the work has been anchored by the development of Summit, a SaaS crypto algorithmic trading platform with AI and neural network components, which saw a sustained, high-velocity push across its entire feature surface. The effort spanned deep backend execution and safety hardening, a complete trader discovery and social-copy-trading UX layer, and a layered risk-guard system. In parallel, significant research cycles were invested in crypto price prediction models, iterating through hundreds of experiments with mixture-of-experts architectures, and in computer vision projects for poker state extraction and real-time game assistance.

On the systems and firmware side, a feature-rich HID emulation firmware for ESP32-S3 was evolved through multiple hardware revisions, adding new input modes, performance profiles, and device support. A Windows kernel input filter driver was built from scratch, reaching a stable, tested release with a full integration-test suite. These efforts were complemented by a custom hotkey and automation tool with a scenario engine, and a fork of an e-ink firmware adding map and knowledge base applications.

A significant portion of the year was also dedicated to Android and desktop application development. An on-device LLM with phone-use capabilities was built, tackling model routing, tool safety, and background processing. A multi-engine TTS system for Android was assembled, integrating several speech models with custom text normalization and pitch control. A Windows Explorer file-tagging utility was hardened for store publication, and a graph-powered code intelligence engine was built to index codebases for AI agents. Across all projects, there was a strong emphasis on CI/CD pipeline stabilization, automated release workflows, and store compliance.
> **2026 Jun**
>
> - **Summit: Social trading and risk guard UX** *(summit)* — Built the trader discovery leaderboard with subscriber and AUM metrics, added follower kill-switch and live guard state on open positions, and delivered the user-facing guard configuration UI.
> - **Summit: Execution safety and analytics hardening** *(summit)* — Hardened the money-path with auto-replay of dead letters, implemented exchange-enforced SL/TP on Binance futures followers, and built fee-adjusted net return analytics with admin observability.
> - **Jolt: Scenario engine and hotkey automation** *(jolt)* — Built a minimal AutoHotKey alternative with a typed-action scenario engine, input gate, and interception support, then added conditional rule evaluation and debug logging.

> **2026 May**
>
> - **Input driver: Kernel filter release and test suite** *(input-driver)* — Stabilised the KMDF input filter driver with a push-style event delivery library, per-event block predicates, and a full integration-test runner covering all documented capabilities.
> - **J-uni-hid: Fire-and-forget HID and matrix variant** *(j-uni-hid)* — Extended the ESP32-S3 firmware with a fire-and-forget emitting mode for higher USB HID event density and drafted an 8x8 matrix hardware variant.
> - **MEMU3: GPU inference and aim assist overhaul** *(MEMU3)* — Switched YOLO inference from CUDA to DirectML, added a scan-loop FPS cap, and reworked the bow/flick aim system with bezier motion, closed-loop tracking, and user-input compensation.
> - **J-TTS-Android: Multi-engine TTS and intonation control** *(j-tts-android)* — Integrated multiple TTS engines including sherpa-onnx and TeraTTS, added real pitch and intonation sliders, and implemented custom text normalization with RuNorm and omograph disambiguation.
> - **Biscuit firmware: Knowledge base and FB2 reader** *(biscuit)* — Extended the e-ink device firmware with a knowledge base app, FB2 reader with encoding support, and mesh chat fixes.

> **2026 Apr**
>
> - **Summit: Admin UX and signal-tree observability** *(summit)* — Delivered admin log UX with datetime pickers and level filters, surfaced per-expert quorum votes in the signal tree, and added client-side search and sort on trader discovery.
> - **J-uni-hid: New firmware variant and connection fixes** *(j-uni-hid)* — Drafted a new v13s8x8 firmware variant and fixed device disconnect and dying issues on the v13 hardware revision.
> - **Papyrix: Map and knowledge base apps** *(papyrix)* — Built a map application with region selection and tile viewer, added a knowledge base app with taxonomy browser, and optimised the map renderer for Apple Silicon.
> - **Intag2: Desktop.ini encoding and release workflow** *(intag2)* — Fixed desktop.ini writing to UTF-16 LE for non-ASCII compatibility and repaired the changelog generation in the release workflow.

> **2026 Mar**
>
> - **Crypto model research: MoE architecture experiments** *(crypto-model-research)* — Ran a large-scale research campaign on mixture-of-experts architectures, benchmarking split up/down MoE gates as a new champion and running 348 experiments across architecture variants.
> - **Ozwil-Android: On-device LLM with phone use** *(ozwil-android)* — Built sub-agent delegation architecture with session-based tool execution, added model routing strategies, and implemented background service processing with wake rules and keep-alive.
> - **J-uni-hid: Dual-core and USB firmware** *(j-uni-hid)* — Delivered v12 dual-core and v13 USB firmware variants for the ESP32-S3 HID emulation platform.
> - **MEMU3: Overlay and aim assist persistence** *(MEMU3)* — Rewrote the overlay to D3D11+D2D+DComp, added a status window, and implemented mode and autofire state persistence across restarts with focused-window aim restriction.
> - **Blackboard Launcher: E-ink note-taking launcher** *(blackboard-launcher)* — Overhauled the backdrop with swipe page navigation, added stray stroke prevention, and implemented status bar control with configurable hide-on-blackboard behaviour.

> **2026 Feb**
>
> - **Intag2: Store publishing pipeline and CLI** *(intag2)* — Stabilised the Microsoft Store publishing pipeline with PowerShell REST API, added a CLI --print argument, and fixed custom property setting on folders.
> - **Jaxon: Code intelligence graph engine** *(jaxon)* — Built a graph-powered code intelligence engine with LSP integration, DI registration detection, and dead code analysis across C++, Go, Rust, and Svelte parsers.
> - **N8n-nodes-telepilot-2: CI stabilisation and album trigger** *(n8n-nodes-telepilot-2)* — Fixed auth race conditions, added a new album trigger, and moved TDLib session storage to a stable path outside node_modules.
> - **Yolo-labeler: Fast on-host labelling tool** *(yolo-labeler)* — Built a minimal, fast YOLO labelling tool with multi-select mark mode, batch delete, and flexible YAML resolution.
> - **Dotfiles: Neovim IDE and SSH setup** *(.dotfiles)* — Assembled a full Neovim IDE configuration with LSP, treesitter, and pre-commit secret detection, plus chezmoi-managed dotfiles with age-encrypted SSH keys.

> **2026 Jan**
>
> - **Poker-CV: Hand history extraction pipeline** *(poker-cv)* — Achieved 99% hand detection accuracy by filtering GT hands beyond video, built a generator-based recovery pattern, and implemented log reconstruction with full hand detail output.
> - **J-uni-hid: Graceful COM restart** *(j-uni-hid)* — Fixed a COM port restart issue to improve connection stability on the HID firmware.
> - **N8n-nodes-claudecode: Agent SDK migration** *(n8n-nodes-claudecode)* — Migrated the Claude Code n8n node to the Claude Agent SDK and added Haiku model support.
> - **Tasker: Touch event UX improvements** *(tasker)* — Improved the Android tasker app with direct launch, completed status, and touch event visualisation on sensor charts.

> **2025**
>
> - **Freqtrade strategies: Strategy iteration and optimisation** *(freqtrade_startegies)* — Developed and refined numerous trading strategy implementations with enhanced entry signals, optimised parameters, and backtesting across multiple timeframes.
> - **J-uni-hid: Multi-version firmware evolution** *(j-uni-hid)* — Evolved the HID firmware through versions v4 to v11, adding new devices, performance modes, BLE safety, and self-reporting across ESP32-S3 and atmega32u4 targets.
> - **Auto-claude: Autonomous coding workflow** *(auto-claude)* — Built squash-merge and worktree completion features into the autonomous multi-session AI coding tool, with Git rules integration and task ID tracking.
> - **MEMU3: HID mouse and aim assist foundation** *(MEMU3)* — Laid the foundation for the aim assist system with USB HID mouse rate limiting, overlay modes, and YOLO model integration.
> - **Freqtrade-tg-multibot: Telegram bot and web app** *(freqtrade-tg-multibot)* — Built a Telegram bot with web application and Docker support, iterating on daily profit calculations and authentication handling.
> - **Freqtrade monitor: Flutter dashboard UI** *(freqtrade_monitor)* — Developed a Flutter-based trading monitor with glassy card UI, expandable carousels, winrate bar charts, and import-export functionality.
> - **pAssistant: Telegram content forwarding** *(pAssistant)* — Built a Telegram content assistant with multi-target sending, image deduplication, and summarisation capabilities.

> **2024**
>
> - **Freqtrade strategies: Hyperopt and leverage tuning** *(freqtrade_strats)* — Ran hyperopt campaigns and tuned leverage and parameters across multiple strategy variants, achieving high winrate and low drawdown configurations.
> - **pAssistant: Initial Telegram automation build** *(pAssistant)* — Built the initial Telegram automation tool with content forwarding, logging, and store update handling.
> - **ChatGPT Telegram .NET: Bot maintenance** *(chatgpt_telegram_net)* — Maintained the .NET ChatGPT Telegram bot with version bumps and updates.
