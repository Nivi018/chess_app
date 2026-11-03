# Computer-play finish review

## Outcome

Independent finish reviewer: **SHIP**, no material release-blocking findings. Read-only review covered source, direction brief and all three valid rendered captures. A nonblocking secondary-message issue after a terminal black move was corrected: feedback now uses the same mate/draw result as the primary status. The controller test asserts this.

Independent documentation verification found no material feature inaccuracies. Its two local documentation notes were clarified: the single-move-only statement now explicitly applies to lessons/reviews, and the new surface brief correctly places current-turn text above the board. Existing DESIGN.md and token sidecar were preserved. Their older mobile-navigation descriptions are pre-existing drift, not repaired within this feature.

## Rendered evidence

- `computer-desktop.png`: production page at 1440 × 1300, document fully visible in the viewport.
- `computer-mobile.png`: production page, 390 × 844 viewport, full-page capture, initial board.
- `computer-mobile-confirm.png`: same mobile viewport, real Stockfish e4/e5 response, inline restart confirmation with visible focus and matching history.
- All three files were opened and checked. They are browser captures of the app, not generated or third-party assets. No new shipping raster assets were introduced.
- A first browser context had unreliable full-page captures/timeouts; those were not used. A fresh isolated browser context produced the valid evidence above.
- Retained incumbent teal/sage/paper composition, wrappers, square board, text hierarchy and mobile board-before-coach order. Board coordinate contrast was explicitly matched to the existing lesson board.

## Functional and loading evidence

- Actual production browser: e2–e4 produced a legal Stockfish e7–e5 response and returned control to white. Earlier smoke test also returned e7–e6. No horizontal document overflow at tested mobile/desktop widths.
- Production network log: no engine request in lessons; entering computer play requests only the deferred page module and same-origin `stockfish-19-lite-single.js` + `.wasm`. Source archive, rebuild network and GPL files are linked downloads, not runtime requirements.
- Runtime engine payload is 28,230 + 1,845,971 = **1,874,201 bytes** uncompressed. It is not part of the ~413 KB academy entry. Initial lesson JavaScript including shared modules is ~585 KB; no first-visit transfer reduction is claimed for this feature.
- Full test suite: **190 passing tests / 23 files**. Covers UCI boot/options/history, loading/search timeouts, worker errors, overlap, disposal, stale responses, retry without position loss, explicit promotion/cancel, mate/draw rules, castling/en passant, keyboard input, restart confirmation, navigation and untouched academy progress.
- Production build and type checking pass; no oversized-chunk warning or raised threshold. Mechanical detector returned no findings for changed UI targets.

## Scope and limits

Learner always white, no clock, Skill Level 0, depth 2, 250 ms cap; no calibrated ELO or claim that this is easy for every beginner. No analysis, color choice, game-result tracking or saved games. Visiting Mi avance preserves the mounted game; leaving the section/reloading ends it. Repetition and fifty-move draws end automatically, not through a tournament claim workflow.

Worker failure recovery is tested with controlled worker errors/rejected responses. Browser smoke tests use the real WASM; an exhaustive browser/assistive-technology matrix and legal license-compliance opinion are not claimed. GPL, exact upstream source and NNUE rebuild inputs are included; public distribution still warrants license review.
