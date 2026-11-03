# Local computer-game save/resume review

## Outcome

Independent finish review: **SHIP**, no material findings. Reviewed source, tests and four production captures. Three nonblocking contextual-copy notes were fixed: a blocked board no longer invites play, cancellation says Cancelar when no game was recovered, and empty history explains that the stored record remains intact. The same reviewer opened the recaptures and scored all three resolved; the prior SHIP verdict is unchanged. This final verdict pass covered those notes, not a new whole-surface review.

Independent document verification found no material inaccuracies. README, PRODUCT and the existing surface brief describe the new save/resume behavior. DESIGN.md and its token sidecar were preserved: this is an incumbent-system extension, not a new visual world. This iteration supersedes the earlier computer-play review's no-persistence scope; its historical screenshots are retained.

## Rendered evidence and provenance

All captures are browser screenshots of the production preview at `http://127.0.0.1:5181/`, in isolated testing contexts. They were opened and checked for validity. No generated images, external raster assets or changes to user browser data were used.

- `saved-game-desktop.png`: 1440 × 1300 viewport, restored e4/e5 history and turn.
- `saved-game-mobile.png`: 390 × 844 viewport, full-page restored state.
- `saved-game-mobile-error.png`: same mobile viewport, injected `Storage.setItem` quota failure for only the independent game key; live Nf3/Nf6 position remains visible while e4/e5 remains the last saved snapshot.
- `saved-game-mobile-invalid.png`: updated mobile incompatible-version state; blocked inputs, intact-record wording.
- `saved-game-mobile-invalid-confirm.png`: mobile explicit-discard confirmation, Cancelar label, focus visibly on Sí, reiniciar.

Normal recovery and save-failure captures remain representative after the final changes: those changes affected only blocked-record copy. No horizontal document overflow was observed at the tested widths. The mechanical detector returned no findings.

## Runtime verification

- Played e2–e4 with actual WASM Stockfish, received e7–e5 and observed `{ version: 1, moves: ['e2e4', 'e7e5'] }` under the independent game key.
- Reloaded, reopened the section, and recovered both moves, the white turn and the matching board, with a visible recovery notice.
- Simulated game-key-only quota failure: subsequent Nf3/Nf6 moves remained in the live game, while the saved record stayed e4/e5. Restored writes and clicked Reintentar guardado; all four live moves were saved without resetting the board.
- Verified an incompatible record was not overwritten or sent to the engine; Nueva partida focused the confirmation action while preserving that record. Explicit confirmation replaced it with an empty v1 record and started a playable new game.
- Seeded a valid pending black-turn snapshot after d2–d4, reloaded and reopened; real Stockfish played e7–e6, saved exactly that two-ply history and returned the turn to white.
- No engine asset was requested while in lessons. Engine payload is unchanged; persistence code remains within the lazy computer-page module (~17.45 KB minified). Academy entry remains ~413 KB; first-lesson dependencies ~585 KB. No total-transfer reduction is claimed.

## Automated checks

- Final full run: **222 tests passing across 25 files**, `vitest run --maxWorkers 2`.
- Final build/typecheck passed, with no chunk-size warning or raised threshold.
- Coverage includes version/schema/legality/size validation, immutable invalid records, synchronous white/black move boundaries, section/reload restoration, pending-black resume, late-worker rejection, ended games without a worker, promotion choice exclusion until confirmed, special-move rights and repetition, read/write failures, explicit replacement and storage isolation from academy progress.
- Under machine contention, a multi-page integration scenario exceeded the original five-second timeout once; three multi-page UI tests now have a 15-second budget, without changing assertions. The subsequent full run passed. The independent reviewer also passed the 51-test feature suite serially and reported timing sensitivity with unrestricted parallelism.

## Scope and limitations

One saved game, current browser/device only. No accounts, backend, multi-game archive, cross-device sync or live cross-tab synchronization; concurrent tabs are last-write-wins. Pending promotion/selection/engine internals are not persisted. Histories are bounded to 2048 plies and 32,000 serialized characters.

Write failure keeps the current board within the mounted section, but leaving/reloading can lose unsaved changes and restore the last successful snapshot. Failed reads never silently overwrite an unknown record: recovery can be retried or an explicit new game confirmed. No guarantee of persistence when browser storage is blocked, cleared or unavailable is made.
