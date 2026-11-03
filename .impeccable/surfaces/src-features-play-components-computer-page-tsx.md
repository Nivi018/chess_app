---
version: 1
slug: "src-features-play-components-computer-page-tsx"
primary_target: "src/features/play/components/computer-page.tsx"
related_targets: ["src/features/academy/academy.tsx", "src/features/lesson/components/lesson-navigation.tsx"]
---

# Play against the computer

Mode: Operate. Approved scope: initial-position game, browser-only Stockfish, limited strength, restart and local save/resume across section changes and reloads. Engine downloaded only when entering. Extend the existing board-and-coach composition, not a new visual world.

## Direction contract

THESIS: Make a first real game legible one turn at a time, without an analysis gauge or a rating promise.

OWN-WORLD: Inherit paper, sage squares, teal actions, yellow selection, system type, UI wrappers and academy shell.

STORY: Enter, automatically recover a validated local history, wait for the engine if needed, play white by board or keyboard selector and observe black's reply. State save/recovery/failure in words. Resume a pending black turn, but never invent a promotion choice or replay an already completed game.

FIRST VIEWPORT: Compact shared navigation; heading and white/black roles; large square board with current turn above it on the left; limited-level explanation, restart and move history on the right. Mobile stacks board first, controls next, history last.

FORM: Local extension retaining the existing two-column board contract. One independent versioned record holds confirmed UCI moves; derive the board, rights, repetition and turn from it. Save at each move boundary. A restart confirmation protects the previous record; unreadable/unknown records remain untouched until explicit discard. Show save failure and retry without erasing the live position. Engine worker is disposed on restart/exit and never shared with lessons. Finished restored games require no engine. No game-result metrics or changes to lesson storage.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
