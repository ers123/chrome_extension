{
“meta”: {
“version”: “0.1.0”,
“timestamp”: “2025-08-26T00:00:00Z”,
“stage”: “TODO”,
“parentRef”: “TRD-Tab Nudge-0.1.0”,
“project”: “Tab Nudge”
},
“tasks”: [
{
“id”: “MOD-013-SETUP-001”,
“description”: “Initialize repository with TypeScript, Node project scaffolding, and Tailwind; set up ESLint, Prettier, and commit hooks.”,
“category”: “setup”,
“priority”: “P0”,
“dependencies”: [],
“completionCriteria”: “Repository builds with npm run build placeholder; lint passes with no errors; pre-commit runs on staged files.”,
“trdRef”: “TRD-MOD-013”
},
{
“id”: “MOD-013-SETUP-002”,
“description”: “Create Chrome MV3 manifest with background service worker, action popup, options page, side panel, commands, and permissions.”,
“category”: “setup”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-001”],
“completionCriteria”: “Manifest.json validates in Chrome extension loader with required keys and no warnings.”,
“trdRef”: “TRD-MOD-013”
},
{
“id”: “MOD-013-SETUP-003”,
“description”: “Configure Vite/Rollup to bundle background, popup/side panel, options, and dashboard entries for MV3.”,
“category”: “setup”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-002”],
“completionCriteria”: “npm run build outputs MV3-compliant JS/CSS assets mapped in manifest and loads without console errors.”,
“trdRef”: “TRD-MOD-013”
},
{
“id”: “MOD-013-SETUP-004”,
“description”: “Add TypeScript config (strict) and path aliases; integrate ESLint (TS) and Prettier configs.”,
“category”: “setup”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-001”],
“completionCriteria”: “TS strict mode enabled; ESLint and Prettier run clean on src/* with no errors.”,
“trdRef”: “TRD-MOD-013”
},
{
“id”: “MOD-013-SETUP-005”,
“description”: “Set up GitHub Actions pipeline for lint, unit tests, e2e (playwright) and build on push/PR.”,
“category”: “deploy”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-003”, “MOD-014-TEST-001”],
“completionCriteria”: “Workflow succeeds on main branch with artifacts for build and test reports uploaded.”,
“trdRef”: “TRD-MOD-013”
},
{
“id”: “MOD-005-UI-001”,
“description”: “Scaffold Options/Settings React page with Tailwind layout and navigation.”,
“category”: “ui”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-003”],
“completionCriteria”: “Options page renders with placeholder controls and is reachable from extension menu.”,
“trdRef”: “TRD-MOD-005”
},
{
“id”: “MOD-002-UI-001”,
“description”: “Scaffold Action Popup and Side Panel React shells with basic routing and state provider.”,
“category”: “ui”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-003”],
“completionCriteria”: “Popup and Side Panel load with no console errors and show placeholder components.”,
“trdRef”: “TRD-MOD-002”
},
{
“id”: “MOD-001-CORE-001”,
“description”: “Implement Tabs event subscription (created/removed/updated/activated) and debounced aggregation across windows.”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-003”],
“completionCriteria”: “Background logs accurate total tab count within 500ms of burst events in dev build.”,
“trdRef”: “TRD-MOD-001”
},
{
“id”: “MOD-001-CORE-002”,
“description”: “Implement threshold, cooldown, and snooze state machine with storage-backed settings.”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-001-CORE-001”, “MOD-005-DATA-001”],
“completionCriteria”: “Crossing threshold triggers internal flag; within cooldown/snooze periods no re-alert occurs.”,
“trdRef”: “TRD-MOD-001”
},
{
“id”: “MOD-001-CORE-003”,
“description”: “Emit ALERT_TRIGGERED runtime message with current and threshold values within 2 seconds of breach.”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-001-CORE-002”],
“completionCriteria”: “Playwright test detects ALERT_TRIGGERED message ≤2s after exceeding threshold.”,
“trdRef”: “TRD-MOD-001”
},
{
“id”: “MOD-002-UI-002”,
“description”: “Build notification service with two buttons (Quick Clean, Snooze) and click-through to open Side Panel.”,
“category”: “ui”,
“priority”: “P0”,
“dependencies”: [“MOD-001-CORE-003”],
“completionCriteria”: “Notification appears with 2 buttons; clicking each sends corresponding RUN_ACTION or opens panel.”,
“trdRef”: “TRD-MOD-002”
},
{
“id”: “MOD-002-UI-003”,
“description”: “Implement Side Panel actionable UI for A1A4 with preview, confirm/cancel, and undo toast.”,
“category”: “ui”,
“priority”: “P0”,
“dependencies”: [“MOD-002-UI-001”, “MOD-003-CORE-001”, “MOD-004-CORE-001”],
“completionCriteria”: “Panel shows target counts per action; confirm executes; undo toast visible for 10s and restores state.”,
“trdRef”: “TRD-MOD-002”
},
{
“id”: “MOD-003-CORE-001”,
“description”: “Create Action Engine message handler for RUN_ACTION and ACTION_PREVIEW.”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-003”],
“completionCriteria”: “Engine responds to RUN_ACTION with ACTION_RESULT and to ACTION_PREVIEW with summary counts.”,
“trdRef”: “TRD-MOD-003”
},
{
“id”: “MOD-003-CORE-002”,
“description”: “Implement CLOSE_OLDEST action using lastAccessed to close N oldest non-pinned tabs.”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-003-CORE-001”, “MOD-004-CORE-001”],
“completionCriteria”: “Given N=10, engine closes exactly 10 oldest eligible tabs and records undo snapshot.”,
“trdRef”: “TRD-MOD-003”
},
{
“id”: “MOD-003-CORE-003”,
“description”: “Implement CLOSE_DUPLICATES with URL normalization (scheme/www/tracking params optional).”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-003-CORE-001”],
“completionCriteria”: “For groups of duplicates, latest one remains; others close; preview count matches result.”,
“trdRef”: “TRD-MOD-003”
},
{
“id”: “MOD-003-CORE-004”,
“description”: “Implement GROUP_DOMAIN action to gather selected domain tabs into new window or close to archive with undo.”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-003-CORE-001”, “MOD-004-CORE-001”],
“completionCriteria”: “Selecting a domain moves all its tabs to a new window or archives with accurate count and undo support.”,
“trdRef”: “TRD-MOD-003”
},
{
“id”: “MOD-003-CORE-005”,
“description”: “Implement SNOOZE action to silence alerts for 15/30/60/180 minutes using chrome.alarms.”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-003-CORE-001”],
“completionCriteria”: “Setting snooze prevents alerts until alarm fires; alarm re-enables alerts reliably.”,
“trdRef”: “TRD-MOD-003”
},
{
“id”: “MOD-004-CORE-001”,
“description”: “Build Undo Manager with in-memory stack, TTL purger (10s), and serialization of tab metadata.”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-003”],
“completionCriteria”: “UndoEntry created for each destructive action; entries auto-purge >10s; unit tests pass.”,
“trdRef”: “TRD-MOD-004”
},
{
“id”: “MOD-004-CORE-002”,
“description”: “Integrate chrome.sessions.restore primary path; implement manual fallback recreation of tabs.”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-004-CORE-001”],
“completionCriteria”: “Undo restores all tabs with original pinned state and indices; success rate ≥99.9% in test suite.”,
“trdRef”: “TRD-MOD-004”
},
{
“id”: “MOD-004-TEST-001”,
“description”: “Write unit/e2e tests for Undo flows covering close, duplicate, and group actions.”,
“category”: “test”,
“priority”: “P0”,
“dependencies”: [“MOD-003-CORE-002”, “MOD-003-CORE-003”, “MOD-003-CORE-004”, “MOD-004-CORE-002”, “MOD-014-TEST-001”],
“completionCriteria”: “All Undo tests pass and validate full restoration within 10s window.”,
“trdRef”: “TRD-MOD-004”
},
{
“id”: “MOD-005-UI-002”,
“description”: “Implement 3-step onboarding (threshold, default snooze, weekly report opt-in) with progress and skip.”,
“category”: “ui”,
“priority”: “P0”,
“dependencies”: [“MOD-005-UI-001”, “MOD-005-DATA-001”],
“completionCriteria”: “Onboarding completes in ≤3 screens and writes settings; total time under 30 seconds in test.”,
“trdRef”: “TRD-MOD-005”
},
{
“id”: “MOD-005-DATA-001”,
“description”: “Create settings store using chrome.storage with schema validation and in-memory cache.”,
“category”: “data”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-003”],
“completionCriteria”: “Settings read/write works; default values applied; changes propagate immediately to listeners.”,
“trdRef”: “TRD-MOD-005”
},
{
“id”: “MOD-005-CORE-001”,
“description”: “Wire SETTINGS_UPDATED message bus and observers to refresh runtime without reload.”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-005-DATA-001”],
“completionCriteria”: “Changing threshold or cooldown updates monitor behavior without extension reload.”,
“trdRef”: “TRD-MOD-005”
},
{
“id”: “MOD-012-CORE-001”,
“description”: “Introduce Performance Manager with event debouncing (250–500ms), idle-time aggregation, and scan throttling.”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-001-CORE-001”],
“completionCriteria”: “Background CPU average ≤2% during synthetic tab churn in perf test.”,
“trdRef”: “TRD-MOD-012”
},
{
“id”: “MOD-012-TEST-001”,
“description”: “Add performance smoke tests to verify alert latency ≤2s and action feedback start ≤1s.”,
“category”: “test”,
“priority”: “P0”,
“dependencies”: [“MOD-001-CORE-003”, “MOD-003-CORE-001”, “MOD-014-TEST-001”],
“completionCriteria”: “Automated perf tests pass with metrics within NFR thresholds.”,
“trdRef”: “TRD-MOD-012”
},
{
“id”: “MOD-006-DATA-001”,
“description”: “Design IndexedDB schema (ActionLog, DailyAgg) using idb helper and migration bootstrap.”,
“category”: “data”,
“priority”: “P1”,
“dependencies”: [“MOD-013-SETUP-003”],
“completionCriteria”: “DB initializes; versioned migrations run; stores create without errors.”,
“trdRef”: “TRD-MOD-006”
},
{
“id”: “MOD-006-CORE-001”,
“description”: “Implement aggregation job to compute avg/max concurrent, opened count, duplicate rate, top domains.”,
“category”: “core”,
“priority”: “P1”,
“dependencies”: [“MOD-006-DATA-001”, “MOD-001-CORE-001”, “MOD-003-CORE-003”],
“completionCriteria”: “DailyAgg entries present for last 7 days with non-null metrics after simulated usage.”,
“trdRef”: “TRD-MOD-006”
},
{
“id”: “MOD-006-UI-001”,
“description”: “Build Dashboard KPI cards (avg/max tabs, opened count, duplicate rate) with cached snapshot.”,
“category”: “ui”,
“priority”: “P1”,
“dependencies”: [“MOD-006-CORE-001”],
“completionCriteria”: “Dashboard loads ≤2s; KPIs display correct values verified against DB queries.”,
“trdRef”: “TRD-MOD-006”
},
{
“id”: “MOD-006-UI-002”,
“description”: “Add 7/30-day toggle and time-series charts using Recharts.”,
“category”: “ui”,
“priority”: “P1”,
“dependencies”: [“MOD-006-UI-001”],
“completionCriteria”: “Toggle switches datasets; charts render without runtime warnings.”,
“trdRef”: “TRD-MOD-006”
},
{
“id”: “MOD-006-UI-003”,
“description”: “Implement CSV export for metrics with UTF-8 BOM and header row.”,
“category”: “ui”,
“priority”: “P1”,
“dependencies”: [“MOD-006-CORE-001”],
“completionCriteria”: “Exported CSV opens in Excel/Numbers with correct headers and row counts.”,
“trdRef”: “TRD-MOD-006”
},
{
“id”: “MOD-009-UI-001”,
“description”: “Configure default keyboard shortcuts (open_actions, A1A4) and options UI for remapping.”,
“category”: “ui”,
“priority”: “P1”,
“dependencies”: [“MOD-002-UI-003”, “MOD-005-UI-001”],
“completionCriteria”: “Shortcuts invoke mapped actions; remapping persists and takes effect immediately.”,
“trdRef”: “TRD-MOD-009”
},
{
“id”: “MOD-009-TEST-001”,
“description”: “Automate accessibility checks for panel (keyboard-only flow, ARIA labels) and notification text.”,
“category”: “test”,
“priority”: “P1”,
“dependencies”: [“MOD-002-UI-003”],
“completionCriteria”: “aXe/Lighthouse accessibility score ≥ 90; keyboard navigation covers all interactive elements.”,
“trdRef”: “TRD-MOD-009”
},
{
“id”: “MOD-010-DATA-001”,
“description”: “Create i18n locale files (ko, en) for all UI strings with keys naming convention.”,
“category”: “data”,
“priority”: “P1”,
“dependencies”: [“MOD-002-UI-003”, “MOD-005-UI-001”],
“completionCriteria”: “Switching locale updates 100% of visible strings across popup/panel/options/dashboard.”,
“trdRef”: “TRD-MOD-010”
},
{
“id”: “MOD-010-CORE-001”,
“description”: “Implement runtime locale switcher without reload; Intl formatting for date/number.”,
“category”: “core”,
“priority”: “P1”,
“dependencies”: [“MOD-010-DATA-001”],
“completionCriteria”: “Locale toggle applies instantly; dates/numbers reflect selected locale formats.”,
“trdRef”: “TRD-MOD-010”
},
{
“id”: “MOD-011-DATA-001”,
“description”: “Add telemetry opt-in flag, anonymized installation ID with rotation policy, and domain hashing utility.”,
“category”: “data”,
“priority”: “P1”,
“dependencies”: [“MOD-005-DATA-001”],
“completionCriteria”: “Opt-in stored; anonymized ID generated/rotated; hash utility covered by unit tests.”,
“trdRef”: “TRD-MOD-011”
},
{
“id”: “MOD-011-DATA-002”,
“description”: “Record domain-level, non-PII metrics for actions and daily aggregates; no full URLs persisted.”,
“category”: “data”,
“priority”: “P1”,
“dependencies”: [“MOD-011-DATA-001”, “MOD-006-DATA-001”],
“completionCriteria”: “Metrics show only domain-level values; code audit confirms no URL paths stored.”,
“trdRef”: “TRD-MOD-011”
},
{
“id”: “MOD-007-CORE-001”,
“description”: “Schedule weekly report job for Sundays 09:00 (local) via chrome.alarms and generate summary data.”,
“category”: “core”,
“priority”: “P2”,
“dependencies”: [“MOD-006-CORE-001”],
“completionCriteria”: “Mock clock test triggers job and produces report payload with deltas vs. prior week.”,
“trdRef”: “TRD-MOD-007”
},
{
“id”: “MOD-007-UI-001”,
“description”: “Build weekly report view with management score and history; provide notification entry point.”,
“category”: “ui”,
“priority”: “P2”,
“dependencies”: [“MOD-007-CORE-001”],
“completionCriteria”: “Report view renders latest summary, shows trend vs. last week, accessible from notification.”,
“trdRef”: “TRD-MOD-007”
},
{
“id”: “MOD-007-CORE-002”,
“description”: “Implement badge logic (Beginner/Steady/Master) and award criteria based on thresholds.”,
“category”: “core”,
“priority”: “P2”,
“dependencies”: [“MOD-007-CORE-001”],
“completionCriteria”: “Users receive badges according to rules; badges persist and appear in report view.”,
“trdRef”: “TRD-MOD-007”
},
{
“id”: “MOD-008-CORE-001”,
“description”: “Add topic clustering heuristic using tokenized titles/domains to identify groups (e.g., Notion tabs).”,
“category”: “core”,
“priority”: “P2”,
“dependencies”: [“MOD-001-CORE-001”],
“completionCriteria”: “Given a mixed set, heuristic detects at least one cluster with ≥3 related tabs in tests.”,
“trdRef”: “TRD-MOD-008”
},
{
“id”: “MOD-008-CORE-002”,
“description”: “Generate discard (sleep) suggestions for tabs idle for X minutes using chrome.tabs.discard.”,
“category”: “core”,
“priority”: “P2”,
“dependencies”: [“MOD-001-CORE-001”],
“completionCriteria”: “Suggestions list tabs exceeding idle threshold; action discards and reduces memory footprint.”,
“trdRef”: “TRD-MOD-008”
},
{
“id”: “MOD-008-CORE-003”,
“description”: “Detect likely ‘reading’ articles unvisited for Y days and propose moving to reading list (local archive).”,
“category”: “core”,
“priority”: “P2”,
“dependencies”: [“MOD-006-DATA-001”],
“completionCriteria”: “At least one eligible article tab suggested after simulated inactivity; archive entry created on accept.”,
“trdRef”: “TRD-MOD-008”
},
{
“id”: “MOD-008-CORE-004”,
“description”: “Implement suggestion frequency adapter that reduces prompts after user rejection streaks.”,
“category”: “core”,
“priority”: “P2”,
“dependencies”: [“MOD-008-CORE-001”, “MOD-008-CORE-002”, “MOD-008-CORE-003”],
“completionCriteria”: “Rejection streak of 3 lowers prompt frequency by ≥50% in subsequent sessions (test verified).”,
“trdRef”: “TRD-MOD-008”
},
{
“id”: “MOD-014-TEST-001”,
“description”: “Configure Vitest for unit tests and jsdom environment; add sample unit tests.”,
“category”: “test”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-003”],
“completionCriteria”: “npm test runs with coverage report and exits 0; sample tests pass.”,
“trdRef”: “TRD-MOD-014”
},
{
“id”: “MOD-014-TEST-002”,
“description”: “Set up Playwright e2e for threshold→notification→action→undo critical flow.”,
“category”: “test”,
“priority”: “P0”,
“dependencies”: [“MOD-002-UI-002”, “MOD-002-UI-003”, “MOD-003-CORE-002”, “MOD-004-CORE-002”, “MOD-014-TEST-001”],
“completionCriteria”: “E2E passes simulating 50+ tabs, triggering alert, executing action, and undoing within 10s.”,
“trdRef”: “TRD-MOD-014”
},
{
“id”: “MOD-014-TEST-003”,
“description”: “Run Lighthouse audits on Options and Dashboard for performance and accessibility.”,
“category”: “test”,
“priority”: “P0”,
“dependencies”: [“MOD-006-UI-001”],
“completionCriteria”: “Performance ≥ 80 and Accessibility ≥ 90 on both pages in CI.”,
“trdRef”: “TRD-MOD-014”
},
{
“id”: “MOD-013-DEPLOY-001”,
“description”: “Create packaging script to emit versioned MV3 zip artifact and checksum.”,
“category”: “deploy”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-003”],
“completionCriteria”: “npm run package outputs zip with manifest version and checksum file.”,
“trdRef”: “TRD-MOD-013”
},
{
“id”: “MOD-013-DEPLOY-002”,
“description”: “Generate Chrome Web Store assets (icons, screenshots) and metadata json stub.”,
“category”: “deploy”,
“priority”: “P0”,
“dependencies”: [“MOD-002-UI-003”, “MOD-006-UI-001”],
“completionCriteria”: “All required image sizes exported; metadata stub ready with descriptions and permissions list.”,
“trdRef”: “TRD-MOD-013”
},
{
“id”: “MOD-013-DEPLOY-003”,
“description”: “Set up versioning and changelog (Conventional Commits) with commitlint enforcement.”,
“category”: “deploy”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-001”],
“completionCriteria”: “Automated version bump and changelog generation works via npm script.”,
“trdRef”: “TRD-MOD-013”
},
{
“id”: “MOD-002-TEST-001”,
“description”: “Test notification UX constraints (2 button limit) and verify panel deep actions available.”,
“category”: “test”,
“priority”: “P0”,
“dependencies”: [“MOD-002-UI-002”, “MOD-002-UI-003”],
“completionCriteria”: “E2E asserts only 2 notification action buttons and panel opens to full action set.”,
“trdRef”: “TRD-MOD-002”
},
{
“id”: “MOD-006-DATA-002”,
“description”: “Implement ActionLog writes for every user action with sample domains and counts.”,
“category”: “data”,
“priority”: “P1”,
“dependencies”: [“MOD-006-DATA-001”, “MOD-003-CORE-001”],
“completionCriteria”: “Each action appends a row to ActionLog; log size controlled via retention policy.”,
“trdRef”: “TRD-MOD-006”
},
{
“id”: “MOD-003-CORE-006”,
“description”: “Add preview calculators for each action to show affected count and list.”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-003-CORE-001”],
“completionCriteria”: “Preview counts match post-action results within ±0 discrepancy in tests.”,
“trdRef”: “TRD-MOD-003”
},
{
“id”: “MOD-005-UI-003”,
“description”: “Add searchable settings with keyword highlight (e.g., ‘중복’) and jump-to control.”,
“category”: “ui”,
“priority”: “P0”,
“dependencies”: [“MOD-005-UI-001”, “MOD-005-DATA-001”],
“completionCriteria”: “Typing a keyword filters relevant settings and focuses first match.”,
“trdRef”: “TRD-MOD-005”
},
{
“id”: “MOD-009-CORE-001”,
“description”: “Implement command handlers for keyboard shortcuts and conflict detection.”,
“category”: “core”,
“priority”: “P1”,
“dependencies”: [“MOD-009-UI-001”],
“completionCriteria”: “Shortcut triggers mapped action; conflicting combos show warning and prevent save.”,
“trdRef”: “TRD-MOD-009”
},
{
“id”: “MOD-011-TEST-001”,
“description”: “Privacy audit tests to ensure URL paths/content never persisted; domain-only hashing verified.”,
“category”: “test”,
“priority”: “P1”,
“dependencies”: [“MOD-011-DATA-002”],
“completionCriteria”: “Tests pass confirming absence of full URLs in any DB/store writes.”,
“trdRef”: “TRD-MOD-011”
},
{
“id”: “MOD-001-CORE-004”,
“description”: “Implement multi-window and multi-profile awareness in tab counting and alerts.”,
“category”: “core”,
“priority”: “P0”,
“dependencies”: [“MOD-001-CORE-001”],
“completionCriteria”: “Total tabs reflect all windows; profile isolation respected; alert logic consistent.”,
“trdRef”: “TRD-MOD-001”
},
{
“id”: “MOD-002-UI-004”,
“description”: “Add undo snackbar with countdown and focus management for accessibility.”,
“category”: “ui”,
“priority”: “P0”,
“dependencies”: [“MOD-004-CORE-002”, “MOD-002-UI-003”],
“completionCriteria”: “Snackbar visible for 10s, ESC to dismiss, Enter to undo; screen reader announces.”,
“trdRef”: “TRD-MOD-002”
},
{
“id”: “MOD-006-TEST-001”,
“description”: “Validate dashboard data parity against raw DB queries for 7/30 day ranges.”,
“category”: “test”,
“priority”: “P1”,
“dependencies”: [“MOD-006-UI-002”],
“completionCriteria”: “Computed KPIs and chart data match DB within exact equality for counts and averages.”,
“trdRef”: “TRD-MOD-006”
},
{
“id”: “MOD-003-TEST-001”,
“description”: “Action Engine unit tests for close oldest, close duplicates, and group domain flows.”,
“category”: “test”,
“priority”: “P0”,
“dependencies”: [“MOD-003-CORE-002”, “MOD-003-CORE-003”, “MOD-003-CORE-004”],
“completionCriteria”: “All action unit tests pass with predicted affected tab counts.”,
“trdRef”: “TRD-MOD-003”
},
{
“id”: “MOD-001-TEST-001”,
“description”: “Threshold/cooldown/snooze state machine unit tests.”,
“category”: “test”,
“priority”: “P0”,
“dependencies”: [“MOD-001-CORE-002”],
“completionCriteria”: “State transitions verified for breach, cooldown lockout, and snooze intervals.”,
“trdRef”: “TRD-MOD-001”
},
{
“id”: “MOD-010-TEST-001”,
“description”: “i18n snapshot tests to ensure 100% string coverage and hot-switch behavior.”,
“category”: “test”,
“priority”: “P1”,
“dependencies”: [“MOD-010-CORE-001”],
“completionCriteria”: “Snapshots updated; locale toggling changes all UI strings without reload.”,
“trdRef”: “TRD-MOD-010”
},
{
“id”: “MOD-007-TEST-001”,
“description”: “Weekly report scheduler tests using mocked time and daylight saving scenarios.”,
“category”: “test”,
“priority”: “P2”,
“dependencies”: [“MOD-007-CORE-001”],
“completionCriteria”: “Job fires at Sunday 09:00 local in tests; offsets handled correctly.”,
“trdRef”: “TRD-MOD-007”
},
{
“id”: “MOD-008-TEST-001”,
“description”: “Suggestion system tests for clustering accuracy and rejection-based frequency reduction.”,
“category”: “test”,
“priority”: “P2”,
“dependencies”: [“MOD-008-CORE-004”],
“completionCriteria”: “Test dataset yields ≥80% precision for top cluster; frequency halves after 3 rejections.”,
“trdRef”: “TRD-MOD-008”
},
{
“id”: “MOD-013-DEPLOY-004”,
“description”: “Create developer documentation (README) with build, test, and load instructions.”,
“category”: “deploy”,
“priority”: “P0”,
“dependencies”: [“MOD-013-SETUP-003”, “MOD-014-TEST-001”],
“completionCriteria”: “README includes steps to build and load unpacked extension; verified by fresh clone.”,
“trdRef”: “TRD-MOD-013”
}
]
}