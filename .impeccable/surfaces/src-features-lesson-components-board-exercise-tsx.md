---
version: 1
slug: "src-features-lesson-components-board-exercise-tsx"
primary_target: "src/features/lesson/components/board-exercise.tsx"
related_targets: ["src/features/lesson/components/promotion-picker.tsx","src/features/lesson/components/solution-route.tsx"]
---

# Special moves — local extension

Mode: Operate. The user approved castling, promotion with piece choice, and en passant, with lessons and new-position reviews. Preserve the academy design, wrappers and saved progress.

## Direction contract

THESIS: A special move is still one understandable action; a promotion choice belongs inline beside the board, not in a disruptive modal.

OWN-WORLD: Existing paper/sage panels, teal actions, signal route, system text and thin boundaries. Four equal text choices use existing button wrappers, not decorative piece art.

STORY: The learner chooses a destination. If promotion is legal, they must choose dama, torre, alfil or caballo before an attempt is recorded. Cancel leaves the board and results unchanged. Castling moves both pieces; en passant visibly removes the adjacent pawn.

FIRST VIEWPORT: Preserve board/coach columns and single-column mobile flow. Show prerequisite position facts above the board. A promotion request inserts a labelled inline choice beneath the board and focuses its first button. Successful castling shows both king and rook routes.

FORM: Local extension of the established lesson surface; no new composition round or identity change. Guided promotion requires the configured piece; other legal promotions receive explanatory feedback and a retry.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
