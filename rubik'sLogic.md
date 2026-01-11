🧩 Optimal Rubik’s Cube Solver – Technical Design (Fast & Interview-Ready)

Goal: Build a Rubik’s Cube solver that produces optimal (minimal) moves, displays the solution in standard notation, and visualizes the solution using a 3D animated cube.

This document replaces all previous inefficient logic (200+ moves, beginner methods) with a clean, optimal, industry-grade approach.

⸻

1. Why Old Logic Was Discarded

Problems with Previous Approach
	•	Generated 200+ moves → unacceptable UX
	•	Beginner / layer-by-layer logic → not optimal
	•	Users leave due to long, confusing solutions
	•	Poor interview value (looks naive, not engineered)

Correct Decision

Deleting old logic is engineering maturity, not failure.

⸻

2. Core Design Philosophy
	•	❌ Do NOT simulate human beginner methods
	•	✅ Use optimal solving algorithms
	•	✅ Separate logic, visualization, and presentation
	•	✅ Single source of truth for cube state

⸻

3. Solver Strategy (Brain of the System)

Algorithm Choice

Kociemba’s Two-Phase Algorithm

Why:
	•	Industry standard
	•	Used in real cube solvers
	•	Average solution: 18–22 moves
	•	Maximum solution length: ≤ 25 moves

Rewriting this algorithm from scratch is not smart engineering. Integrating it and explaining it clearly is.

⸻

4. Cube Representation (Most Critical Part)

❌ What NOT to Use
	•	Flat color arrays
	•	Face-based logic scattered across code

✅ Correct Representation: Cubie-Based Model

Represent the cube as:

Corners
	•	8 corner cubies
	•	Each has:
	•	Position (0–7)
	•	Orientation (0–2)

Edges
	•	12 edge cubies
	•	Each has:
	•	Position (0–11)
	•	Orientation (0–1)

Why This Matters
	•	Fast move application
	•	Easy hashing & validation
	•	Compatible with optimal solvers
	•	Clean animation synchronization

⸻

5. High-Level Solver Flow

User Input (colors / scramble)
        ↓
Cube Validation (parity, orientation)
        ↓
Convert to Cubie Representation
        ↓
Run Two-Phase Solver
        ↓
Optimal Move List (R U R' F2 ...)
        ↓
 ┌───────────────────────┐
 │  Notation Renderer    │
 │  3D Animation Engine  │
 └───────────────────────┘


⸻

6. Output Requirements

6.1 Move Notation Display
	•	Standard cube notation:
	•	R L U D F B
	•	’ for counter-clockwise
	•	2 for double turns

Example:

R U R' U' F2

Enhancements:
	•	Highlight current move
	•	Step-by-step navigation
	•	Auto-play mode

⸻

7. 3D Cube Visualization

Rendering Technology

Three.js (WebGL abstraction)

Why:
	•	Industry standard
	•	Full control over transformations
	•	Interview-safe and respected

⸻

7.1 3D Scene Setup
	•	Perspective Camera
	•	Ambient + Directional Light
	•	27 cubelets (3×3×3)
	•	Each cubelet:
	•	Mesh
	•	6 face materials (colors)

⸻

7.2 Layer Rotation Logic (Animation Engine)

For each move (example: R):
	1.	Identify cubelets in the right layer
	2.	Temporarily group them
	3.	Rotate group by 90° on correct axis
	4.	Apply rotation permanently to cube state
	5.	Ungroup cubelets

This mirrors real cube mechanics.

⸻

8. Animation Controls (User Experience)

Required Controls:
	•	▶ Play
	•	⏸ Pause
	•	⏭ Step Forward
	•	⏮ Step Backward
	•	⏱ Speed Control

Principle: clarity > visual gimmicks

⸻

9. Strict Non-Goals (What NOT To Do)
	•	❌ Rebuild beginner solvers
	•	❌ Stack random heuristics
	•	❌ Animate without syncing cube state
	•	❌ Ignore cube validity checks
	•	❌ Over-engineer UI before logic is correct

⸻

10. Interview Value of This Project

This project demonstrates:
	•	Algorithmic thinking
	•	State machines
	•	Group theory basics
	•	3D transformations
	•	Performance awareness
	•	Product-level UX thinking

This is far stronger than CRUD + authentication projects.

⸻

11. Implementation Roadmap

Step 1

Design cubie-based cube representation

Step 2

Integrate Two-Phase optimal solver

Step 3

Implement move executor (single source of truth)

Step 4

Connect executor to Three.js animation engine

Step 5

Add notation display + playback controls

⸻

12. Final Note

Deleting bad logic is discipline.
Finishing this system is execution.

This project can either:
	•	❌ Die as another unfinished repo
	•	✅ Become a signature interview weapon

Choose deliberately.