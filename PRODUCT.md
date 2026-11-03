# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: React + TypeScript + Vite with Tailwind CSS 4 for the first responsive web application. Use PrimeReact 10.9.9 (MIT) through local `src/components/ui` wrappers, and a chess rules library to validate legal moves. Keep the first release frontend-only and store progress in the browser; defer authentication and backend services until accounts or cross-device sync are needed.

## Users

The first user is someone who has never played chess and needs plain-language instruction, a safe place to try a move, and clear feedback without assuming prior knowledge.

## Product Purpose

Help an absolute beginner learn chess through an interactive first lesson. The initial slice should let the learner understand a concept, try a move on a legal board, receive feedback, and return to locally saved progress.

## Positioning

Provisional: make the learning process visible through a guided lesson and verified moves, rather than presenting engine answers as instruction. The lasting differentiator remains to be validated.

## Operating Context

The first experience is a responsive web app for desktop and mobile browsers. It begins with one self-contained lesson and has no account requirement; lesson progress is stored on the learner's device.

## Capabilities and Constraints

- Current scope: thirteen interactive lessons, thirteen reviews and a separate six-puzzle multi-move tactics module for an absolute beginner.
- Chess legality and the lesson solution must be checked by application logic, not inferred from generated text.
- Save lesson completion/progress locally in the browser. No sign-in, API, database, multiplayer, or Stockfish requirement for this slice.
- First lesson: introduce how the knight moves from the initial position and invite the learner to play b1–c3.
- Second lesson: introduce the rook on a simplified board and practice a1–a4. Learners can switch lessons, continue after completing one, and keep independent local progress.
- Additional lessons cover the bishop (c1–f4), queen (d1–g4), king (e1–f2), and pawn (e2–e4). They introduce basic movement with simplified positions.
- Lessons seven through ten introduce check escapes (Ke1–f1), blocking (Bc1–e3), capturing the checking piece (Bb5xe2), and a supported queen mate (Qg6–g7). Tests verify that each defense removes check and the mating solution is checkmate, not stalemate. The mate explanation distinguishes stalemate from checkmate.
- Lessons eleven through thirteen introduce kingside castling, promotion to queen and en passant. Three new-position reviews cover queenside castling, knight promotion to give check, and en passant. The promotion choice is inline, explicit and cancellable; attempts count only after choosing a piece. Legal alternative promotions receive retry feedback without completing the target. Restoring a completed exercise uses its specified promotion. Castling displays both routes. FEN setup notes describe rights and the immediately preceding pawn advance; these are curated single-move positions, not a multi-turn game.
- Review mode provides thirteen single-move challenges in new positions: six captures (one per piece), a king escape, a rook block, capture of a checking knight, rook-and-king mate, and the three special moves. Explanations are withheld until success and hints are optional. Separate local review records track attempts, hint consultations and unassisted first-attempt success; replay does not overwrite the first result. All previous IDs and saved records remain unchanged; ten prior completions now represent 10 of 13 lessons or reviews. Review results do not imply a rating or definitive mastery.
- Tactics mode has six curated three-ply combinations: knight fork, queen mate, bishop pin, rook ladder mate, discovered attack and bishop skewer. Each learner step has its own instruction and optional hint, closed on advancement. Correct moves pause until the learner chooses Ver respuesta rival; board input, selector and hints are locked during that pause. Observing the reply adds no attempt. Replies are illustrative, not engine-selected or necessarily forced. Legal alternatives are not labeled bad moves. Attempts count per wrong answer or completed line; hints and first complete-line success are stored under stable tactic IDs, preserving the original two records. Partial lines survive visits to Mi avance during the session, but reload restarts them without discarding saved metrics. No rating or mastery estimate is provided.
- Lessons, tactics and Mi avance load on demand with loading and error recovery states. Saved results survive module-load errors; reload may lose unsaved changes. Entry size is about 412 KB versus 596 KB previously, but complete first-lesson JavaScript remains about 584 KB including shared dependencies; entry splitting is not a 31% total-transfer saving.
- Keep the app usable with touch and mouse, and provide clear text feedback and accessible controls.
- Mi avance is a joint local progress panel with separate lesson, review and tactics completion, per-activity results and an explained next action. It prioritizes pending lessons, pending reviews, pending tactics, then a completed review whose first result involved help or error. Historical first results are immutable; the recommendation may persist after replay and is not spaced repetition or a mastery estimate. Completed activities open directly in replay from the panel. Unknown legacy metrics stay unknown, and session results survive navigation in memory when storage writes fail, with an explicit reload-loss warning. No live cross-tab synchronization is provided.
- Product name, visual identity, and deployment target are undecided; do not present a working label as an approved brand.

## Evidence on Hand

The planning source is `plan_maestro_academia_ajedrez.md`. No approved logo, brand system, user research, or authored lesson assets are present yet. Do not invent testimonials, user results, or claims of learning efficacy.

## Product Principles

- Explain chess concepts for a first-time learner.
- Let the learner reason and make a move before revealing the answer.
- Validate chess positions and moves with deterministic rules.
- Treat saved progress as learning context, not as proof of chess strength.
