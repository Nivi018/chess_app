---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: []
---

# First chess lesson

## Surface scope

Operate surface: one responsive interactive lesson for an absolute beginner. The task is to learn the knight's L-shaped move, attempt a legal move from the initial position, receive immediate feedback, and retain completion locally.

## Audience and constraints

The learner has no prior chess knowledge. Keep the board and next action immediately understandable, support mouse, touch, and keyboard access, validate moves with chess.js, and save only local lesson progress. No login, network, engine, or extra lessons are in scope. The product name and identity remain undecided; any displayed name is a temporary descriptor.

## Direction contract

THESIS: An unfamiliar board becomes learnable when one move is shown as a clear, traceable route.

OWN-WORLD: Borrow only the color logic, concise signage typography, and one highlighted route from transit wayfinding; use deep teal for the shell, a high-contrast signal yellow for the active destination, and quiet sage/white board fields. Keep ordinary web navigation and controls, not station-map furniture.

STORY: The learner sees what the knight does, studies one example, tries the move, and receives a precise explanation. A legal alternative is acknowledged; only the lesson's target completes this guided exercise. Progress persists on this device.

FIRST VIEWPORT: A compact top bar names the lesson and local-save status; a narrow left rail exposes the active lesson and real local progress; the main area pairs a large legal chessboard with a short instruction panel. The highlighted route is withheld until feedback so it does not give away the task.

FORM: Build candidate 5 of the seven grounded directions, transit wayfinding; seed:42be92123c846a70. The assigned direction was chosen by the user. Declined catalog worlds contributed only explicit lesson location, consistent piece identity, separated keyboard focus, semantic color, visible coordinates, and reduced-motion support.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved decisions

Final product name, whether to add lessons beyond the MVP slice, and the future deployment target.
