# Rubik’s Cube Solver — Layer-by-Layer (All Phases)

## Objective
Solve a Rubik’s Cube using a **layer-by-layer, phase-based approach** by tracking piece states, checking conditions, and applying controlled transformations until the cube reaches the solved state.

---

## Core Principle
- The cube is treated as a **state machine**
- Each phase has:
  - Entry condition
  - Goal
  - Exit condition
  - Invariant (what must not break)
- Pieces (edges, corners) are tracked by **position and orientation**

---

## Overall Solver Flow

```text
solveCube()
 ├─ Phase 1: Cross
 ├─ Phase 2: First Layer Corners
 ├─ Phase 3: Second Layer Edges
 ├─ Phase 4: Last Layer Cross Orientation
 ├─ Phase 5: Last Layer Edge Position
 ├─ Phase 6: Last Layer Corner Position
 ├─ Phase 7: Last Layer Corner Orientation

### Phase 1: Cross (Plus)

Goal: 
Solve the bottom cross with correct alignment to centers.

Exit Condition:
isCrossSolved()
```Steps:
repeat until cross solved:
  select an unsolved cross edge
  locate the edge
  move it to the top layer if needed
  align it with its center
  insert it into the bottom layer
Invariant:
Already solved cross edges must not move.

### Phase 2: First Layer Corners

Goal: 
Complete the entire bottom layer.

Exit Condition:
isFirstLayerSolved()

```Steps:
repeat until first layer solved:
  find a bottom-layer corner
  if corner is misplaced:
    move it to the top layer
  rotate top layer to match target slot
  insert corner without breaking cross

Invariant:
Bottom cross remains solved.

⸻

### Phase 3: Second Layer Edges

Goal: 
Solve all four middle-layer edges.

Exit Condition:
isSecondLayerSolved()

```Steps:
repeat until top cross oriented:
  detect edge orientation pattern
  apply orientation transformation

Invariant:
First two layers stay solved.

⸻

### Phase 5: Last Layer Edge Position

Goal:
Place top-layer edges in correct positions.

Exit Condition:
areTopEdgesPositioned()

```Steps:
repeat until edges positioned:
  detect correctly placed edge
  cycle remaining edges

Invariant:
Top edge orientation remains unchanged.

⸻

### Phase 6: Last Layer Corner Position

Goal:
Move top-layer corners into correct locations (orientation ignored).

Exit Condition:
areTopCornersPositioned()

```Steps:
repeat until corners positioned:
  identify correctly placed corner
  cycle remaining corners


Invariant:
Top edges remain positioned.

⸻

### Phase 7: Last Layer Corner Orientation

Goal:
Orient top-layer corners without changing their positions.

Exit Condition:
isCubeSolved()
```Steps:
repeat until cube solved:
  select a misoriented corner
  rotate corner using safe transformation


Invariant:
Corner positions must not change.

⸻

Move System (Shared by All Phases)
applyMove(move):
  update affected edges
  update affected corners

