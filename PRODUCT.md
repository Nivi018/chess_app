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

- Current scope: two interactive lessons for an absolute beginner, sharing a reusable lesson definition and controller.
- Chess legality and the lesson solution must be checked by application logic, not inferred from generated text.
- Save lesson completion/progress locally in the browser. No sign-in, API, database, multiplayer, or Stockfish requirement for this slice.
- First lesson: introduce how the knight moves from the initial position and invite the learner to play b1–c3.
- Second lesson: introduce the rook on a simplified board and practice a1–a4. Learners can switch lessons, continue after completing one, and keep independent local progress.
- Keep the app usable with touch and mouse, and provide clear text feedback and accessible controls.
- Product name, visual identity, and deployment target are undecided; do not present a working label as an approved brand.

## Evidence on Hand

The planning source is `plan_maestro_academia_ajedrez.md`. No approved logo, brand system, user research, or authored lesson assets are present yet. Do not invent testimonials, user results, or claims of learning efficacy.

## Product Principles

- Explain chess concepts for a first-time learner.
- Let the learner reason and make a move before revealing the answer.
- Validate chess positions and moves with deterministic rules.
- Treat saved progress as learning context, not as proof of chess strength.
