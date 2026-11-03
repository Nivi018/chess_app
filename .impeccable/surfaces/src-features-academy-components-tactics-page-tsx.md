---
version: 1
slug: "src-features-academy-components-tactics-page-tsx"
primary_target: "src/features/academy/components/tactics-page.tsx"
related_targets: ["src/features/academy/academy.tsx","src/features/academy/components/progress-dashboard.tsx","src/features/academy/hooks/use-tactic.ts","src/features/lesson/components/lesson-navigation.tsx"]
---

# Tácticas de varias jugadas — extension contract

Mode: Operate. Extend the academy's existing local-first, responsive chess surface. The user chose a small guided multi-ply tactics module using the existing board and rules; first iteration is two curated lines.

## Direction contract

THESIS: Let a learner discover a short combination one decision at a time, with a real board state after each move.

OWN-WORLD: Inherit teal, sage, paper, system typography, existing panels, button and selector wrappers. Do not introduce a score gauge, engine look, or new brand system.

STORY: Open a tactic, reason about the current position, try a legal move, see the prepared reply only after success, then solve the next step. Explain that prepared replies illustrate the exercise and are not engine-selected or guaranteed forced.

FIRST VIEWPORT: Keep the academy shell and rail; main heading/theme above a two-column board and coach panel. The board carries the current position and move selector; coach holds the concealed explanation, hint, response state and replay. Stack board before coach on mobile. Mi avance adds separate tactic progress.

FORM: Local extension of the established academy; no visual-world workshop. Two puzzles: knight fork winning a rook and a prepared queen attack ending in mate. Save attempts, hints and first complete line using independent local IDs.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
