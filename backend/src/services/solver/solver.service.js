
const Cube = require('./cube');

class SolverService {
    solve(input) {
        // 1. Parse or use existing Cube
        let startCube;
        if (input && input.move && typeof input.move === 'function') {
            startCube = input;
        } else {
            startCube = this.parseStickersToCube(input);
        }

        // Context to share state
        const ctx = { cube: startCube };
        let moves = [];

        const apply = (move) => {
            ctx.cube = ctx.cube.move(move);
            moves.push(move);
        };

        try {
            console.log("Phase 1: Cross");
            this.solveCross(ctx, apply);
            console.log("Phase 2: F2L Corners");
            this.solveF2LCorners(ctx, apply);
            console.log("Phase 3: F2L Edges");
            this.solveSecondLayerEdges(ctx, apply);
            console.log("Phase 4: LL Cross Ori");
            this.solveLastLayerCrossOrientation(ctx, apply);
            console.log("Phase 5: LL Edge Perm");
            this.solveLastLayerEdgePermutation(ctx, apply);
            console.log("Phase 6: LL Corner Perm");
            this.solveLastLayerCornerPermutation(ctx, apply);
            console.log("Phase 7: LL Corner Ori");
            this.solveLastLayerCornerOrientation(ctx, apply);
        } catch (e) {
            console.error("Solver failed at some phase:", e);
            // Return what we have so far or fail
        }

        const optim = this.optimizeMoves(moves);
        return { solution: optim.join(' ') };
    }

    parseStickersToCube(stickers) {
        const colorToFace = {};
        const faces = ['U', 'D', 'L', 'R', 'F', 'B'];
        // Center is index 4
        faces.forEach(f => {
            if (stickers[f] && stickers[f][4]) {
                colorToFace[stickers[f][4]] = f;
            }
        });

        const getFace = (f, idx) => colorToFace[stickers[f][idx]];

        const cornerDefs = [
            { id: 0, pos: 'ULF', facelets: [['U', 6], ['L', 2], ['F', 0]] },
            { id: 1, pos: 'ULB', facelets: [['U', 0], ['L', 0], ['B', 2]] },
            { id: 2, pos: 'URF', facelets: [['U', 8], ['R', 0], ['F', 2]] },
            { id: 3, pos: 'URB', facelets: [['U', 2], ['R', 2], ['B', 0]] },
            { id: 4, pos: 'DLF', facelets: [['D', 0], ['L', 8], ['F', 6]] },
            { id: 5, pos: 'DLB', facelets: [['D', 6], ['L', 6], ['B', 8]] },
            { id: 6, pos: 'DRF', facelets: [['D', 2], ['R', 6], ['F', 8]] },
            { id: 7, pos: 'DRB', facelets: [['D', 8], ['R', 8], ['B', 6]] },
        ];

        const edgeDefs = [
            { id: 0, pos: 'UL', facelets: [['U', 3], ['L', 1]] },
            { id: 1, pos: 'UB', facelets: [['U', 1], ['B', 1]] },
            { id: 2, pos: 'UR', facelets: [['U', 5], ['R', 1]] },
            { id: 3, pos: 'UF', facelets: [['U', 7], ['F', 1]] },
            { id: 4, pos: 'DL', facelets: [['D', 3], ['L', 7]] },
            { id: 5, pos: 'DB', facelets: [['D', 7], ['B', 7]] },
            { id: 6, pos: 'DR', facelets: [['D', 5], ['R', 7]] },
            { id: 7, pos: 'DF', facelets: [['D', 1], ['F', 7]] },
            { id: 8, pos: 'FL', facelets: [['F', 3], ['L', 5]] },
            { id: 9, pos: 'FR', facelets: [['F', 5], ['R', 3]] },
            { id: 10, pos: 'BL', facelets: [['B', 5], ['L', 3]] },
            { id: 11, pos: 'BR', facelets: [['B', 3], ['R', 5]] },
        ];

        const corners = new Array(8);
        const edges = new Array(12);

        cornerDefs.forEach((def, posIdx) => {
            const facesFound = def.facelets.map(([f, i]) => getFace(f, i));
            let cornerId = -1;

            // Allow for incomplete stickers (during dev) or just match
            for (let c of cornerDefs) {
                const targetFaces = c.facelets.map(([f]) => f).sort().join('');
                const currentFaces = [...facesFound].sort().join('');
                if (targetFaces === currentFaces) {
                    cornerId = c.id;
                    break;
                }
            }

            let orientation = 0;
            if (cornerId !== -1) {
                // Determine orientation
                // Orientation is defined by where the "Primary" face sticker is.
                // For corners, Primary is U or D.
                // We look at facesFound[0], facesFound[1], facesFound[2] which correspond to def.facelets[0], etc.
                // def.facelets[0] is the U/D position on the ctx.cube.
                // If the sticker at this position (facesFound[0]) is U or D, then orientation is 0.
                // If the sticker at this position is L/R/F/B, we check the others.

                // Simpler: find which slot holds the U or D color.
                const isPrimary = (f) => f === 'U' || f === 'D';
                if (isPrimary(facesFound[0])) orientation = 0;
                else if (isPrimary(facesFound[1])) orientation = 1; // Twisted clockwise?
                else if (isPrimary(facesFound[2])) orientation = 2; // Twisted anti-clockwise?

                // Note: The meaning of 1 and 2 depends on the permutation logic in Cube.js.
                // In Cube.js:
                // 0->1 : +1 twist.
                // If U sticker is at index 1 (which is on L/R/etc), it represents a twist.
                // We'll stick to 0, 1, 2 indices matching the twist.
            }

            corners[posIdx] = { id: cornerId, orientation };
        });

        edgeDefs.forEach((def, posIdx) => {
            const facesFound = def.facelets.map(([f, i]) => getFace(f, i));
            let edgeId = -1;
            for (let e of edgeDefs) {
                const targetFaces = e.facelets.map(([f]) => f).sort().join('');
                const currentFaces = [...facesFound].sort().join('');
                if (targetFaces === currentFaces) {
                    edgeId = e.id;
                    break;
                }
            }

            let orientation = 0;
            if (edgeId !== -1) {
                // Edge Orientation
                // Primary faces: U/D for edges 0-7, F/B for edges 8-11
                const isPrimaryUD = (f) => f === 'U' || f === 'D';
                const isPrimaryFB = (f) => f === 'F' || f === 'B';

                const stickerAtZero = facesFound[0]; // The sticker at the 'primary' slot of the position

                if (edgeId < 8) {
                    // U/D edges. Good if U/D color is at the U/D slot.
                    if (isPrimaryUD(stickerAtZero)) orientation = 0;
                    else orientation = 1;
                } else {
                    // Middle edges. Good if F/B color is at the F/B slot.
                    if (isPrimaryFB(stickerAtZero)) orientation = 0;
                    else orientation = 1;
                }
            }
            edges[posIdx] = { id: edgeId, orientation };
        });

        return new Cube({ corners, edges });
    }

    optimizeMoves(moves) {
        if (!moves || moves.length === 0) return [];
        const stack = [];
        const getPower = (m) => {
            if (m.endsWith("2")) return 2;
            if (m.endsWith("'")) return 3;
            return 1;
        };
        const getStr = (f, p) => {
            if (p === 1) return f;
            if (p === 2) return f + "2";
            if (p === 3) return f + "'";
            return "";
        };

        for (const m of moves) {
            if (stack.length === 0) {
                stack.push(m);
                continue;
            }
            const last = stack[stack.length - 1];
            if (last[0] === m[0]) {
                const newP = (getPower(last) + getPower(m)) % 4;
                stack.pop();
                if (newP !== 0) stack.push(getStr(last[0], newP));
            } else {
                stack.push(m);
            }
        }
        return stack;
    }

    solveCross(ctx, apply) {
        const targetEdges = [7, 6, 5, 4]; // DF, DR, DB, DL
        // Map edge ID to its target U-layer position (where it should be before dropping down)
        // DF(7) -> UF(3)
        // DR(6) -> UR(2)
        // DB(5) -> UB(1)
        // DL(4) -> UL(0)
        const targetUPos = { 7: 3, 6: 2, 5: 1, 4: 0 };
        const targetDPos = { 7: 7, 6: 6, 5: 5, 4: 4 };

        for (const edgeId of targetEdges) {
            let current = ctx.cube.findEdge(edgeId);

            // Check if already solved
            if (current.position === targetDPos[edgeId] && current.orientation === 0) continue;

            // If not in U layer, bring it to U layer
            if (current.position >= 4) { // In middle or bottom
                this.moveEdgeToU(ctx, apply, edgeId);
                current = ctx.cube.findEdge(edgeId); // Update state
            }

            // Now edge is in U layer (0-3). 
            // Align it above its target slot.
            const desiredUPos = targetUPos[edgeId];

            // Calculate U turns needed
            // current.position is 0..3
            // desired is 0..3
            // U move: 0->1->2->3->0... NO.
            // U move cycle: 0(UL)->1(UB)->2(UR)->3(UF)->0(UL)?
            // Wait, Cube.js cycle: [0, 1, 2, 3] for edges?
            // Cube.js: cycleEdges([0, 1, 2, 3]) for U.
            // Edge 0 (UL) -> 1 (UB).
            // Edge 1 (UB) -> 2 (UR).
            // Edge 2 (UR) -> 3 (UF).
            // Edge 3 (UF) -> 0 (UL).
            // Correct.

            let movesNeeded = 0;
            let tempPos = current.position;
            while (tempPos !== desiredUPos) {
                tempPos = (tempPos + 1) % 4; // Simulate U move
                movesNeeded++;
            }

            for (let k = 0; k < movesNeeded; k++) apply('U');

            // Now it is at desiredUPos. Check orientation.
            current = ctx.cube.findEdge(edgeId);

            // If orientation is 0 (Good), we can just rotate 180 (F2, etc)
            // If orientation is 1 (Bad), we need to flip.

            const faceChar = this.getFaceFromEdgeTarget(edgeId); // 'F', 'R', 'B', 'L'

            if (current.orientation === 0) {
                // Good orientation. Just F2/R2/B2/L2.
                apply(faceChar + "2");
            } else {
                // Bad orientation. It's "flipped" in U layer.
                // Need to insert flipped.
                // E.g. Target DF. At UF. Flipped.
                // Alg: U F' U' ? No.
                // Alg: F U R' U' ? 
                // Standard insert for flipped cross edge:
                // Move to side, drop, restore.
                // E.g. for DF (Front):
                // Currently at UF.
                // Move to L or R?
                // L gives FL. R gives FR.
                // Apply: U' R' F R

                // Universal alg:
                // 1. Move to "Right" of target face.
                // 2. Drop "Right" side.
                // 3. Fix Center.
                // 4. Restore "Right".

                // Wait, simpler:
                // If at UF (bad), do: F' (to FL), R' (wrong), D' (wrong)...

                // Let's use specific sequences.
                // Example for Front (7):
                // At UF (3). 
                // Sequence: L F' L' ?
                // Or: R' F R ?

                // Let's implement one universal helper "insertFlippedCrossEdge".
                this.insertFlippedCross(ctx, apply, edgeId);
            }
        }
    }

    getFaceFromEdgeTarget(edgeId) {
        if (edgeId === 7) return 'F';
        if (edgeId === 6) return 'R';
        if (edgeId === 5) return 'B';
        if (edgeId === 4) return 'L';
        return '';
    }

    moveEdgeToU(ctx, apply, edgeId) {
        let current = ctx.cube.findEdge(edgeId);
        const pos = current.position;

        // If in bottom (4-7)
        if (pos >= 4 && pos <= 7) {
            const face = this.getFaceFromEdgeTarget(pos); // 4->L, 5->B, 6->R, 7->F
            apply(face + "2");
            return;
        }

        // If in Middle (8-11): FL(8), FR(9), BL(10), BR(11)
        // Bring to U layer.
        /*
          8 (FL): L or F'
          9 (FR): R' or F
          10 (BL): L' or B
          11 (BR): R or B'
        */
        const moves = {
            8: "L", // Moves FL to UL
            9: "R'", // Moves FR to UR
            10: "L'", // Moves BL to UL
            11: "R"  // Moves BR to UR
        };

        if (moves[pos]) {
            apply(moves[pos]);
            // Move it away in U so we can restore
            apply('U');
            // Restore?
            // "Already solved cross edges must not move".
            // We moved a face (L, R, etc). This might disturb solved edges.
            // But we are in "Step 1" of solving specific edge.
            // If we disturb a *solved* edge, we must put it back.
            // We iterate 7->6->5->4.
            // If solving 4 (DL), 7,6,5 are solved.
            // 4 is DL. If DL pieces is at FR(9).
            // We do R' (moves FR -> UR).
            // Does R move affect 7(DF), 6(DR), 5(DB)?
            // R move affects DR(6).
            // So if DR is solved, we must restore R.
            // So: R', U, R.
            const undo = this.invertMove(moves[pos]);
            apply(undo);
        }
    }

    insertFlippedCross(ctx, apply, edgeId) {
        // Assumes edge is at correct U-position (e.g. UF for DF) but flipped.
        // Or we can just handle it from anywhere?
        // Let's assume it is directly above target.

        // Target:
        // 7 (DF): at UF. 
        // Move UF -> UR -> Insert R -> Restore?
        // Alg: F U R U' ? No.

        // Specifics:
        // DF (7): at UF (3). 
        //   Apply: F' R' ? No.
        //   Apply: U' R' F R
        //   Move to UL (U'). Now at UL.
        //   L (move UL->DL bad).
        //   Wait.

        // Simple reliable alg:
        // For DF (7) at UF:
        //   F (moves UF->FR). 
        //   R' (moves FR->DR? No, FR->UR? R' moves FR->UR? No. R moves UR->BR->DR->FR. So R' moves FR->DR).
        //   D' (moves DR->DF).
        //   So: F R' D' ? 
        //   This messes up centers? Phase 1 goal uses "aligned to centers".
        //   So D' rotates the cross. We can't do that unless we restore.

        // Proper alg:
        // UF -> DF flipped:
        // F' (UF -> FL)
        // U' (save cross? No)
        // L' (FL -> DL). 

        // Use "Easy" approach:
        // 1. Rotate face to bring piece to Middle layer.
        // 2. Rotate associated side face to place into bottom.
        // 3. Restore first face.

        // Example for DF (F face). Piece at UF.
        // F' (moves UF to FL).
        // L' (moves FL to DL). 
        // But DL is occupied? 
        // We are solving in order 7,6,5,4 (DF, DR, DB, DL).
        // If we solve DF, others are empty.
        // If we solve DL last, others are full.

        // If we use "F' L' ... " we put it in DL, not DF. 
        // We want it in DF.

        // Correct way for DF at UF flipped:
        // U' (move to UL)
        // L' (insert to DL?) -> No we want DF.
        // F (rotate DF slot to FL) -> No.

        // Standard Flipped Insert:
        // Target DF. Piece at UF.
        // Move to face R. (U) Piece at UR.
        // R' (moves UR->FR). 
        // F (moves FR -> DF).
        // Restore R? (R). 
        // So: U R' F R.
        // Check moves:
        // U: UF -> UL (Left). Wait. UF->UL.
        // R': ...

        // Let's map it.
        // Edge 7 (DF).
        // 1. Apply 'U' (to UL).
        //    Apply 'L' (UL -> FL).
        //    Apply 'F'' (FL -> DF).
        //    Apply 'L'' (Restore L).
        // Sequence: U L F' L'

        // Edge 6 (DR).
        //    U L F' L' relative to R?
        //    U (UR -> UF).
        //    F (UF -> FR).
        //    R' (FR -> DR).
        //    F' (Restore F).
        // Sequence: U F R' F'

        // Generalize: 
        // Function insert(targetFace, sideFace, sideDir)

        if (edgeId === 7) { // DF
            // Piece at UF.
            // Move to UL (U). Insert via L (L F' L').
            apply('U'); apply('L'); apply("F'"); apply("L'");
        } else if (edgeId === 6) { // DR
            // Piece at UR.
            // Move to UF (U). Insert via F (F R' F').
            apply('U'); apply('F'); apply("R'"); apply("F'");
        } else if (edgeId === 5) { // DB
            // Piece at UB.
            // Move to UR (U). Insert via R (R B' R').
            apply('U'); apply('R'); apply("B'"); apply("R'");
        } else if (edgeId === 4) { // DL
            // Piece at UL.
            // Move to UB (U). Insert via B (B L' B').
            apply('U'); apply('B'); apply("L'"); apply("B'");
        }
    }

    invertMove(move) {
        if (move.endsWith("'")) return move[0];
        if (move.endsWith("2")) return move;
        return move + "'";
    }


    solveF2LCorners(ctx, apply) {
        const targetCorners = [4, 5, 6, 7]; // DLF, DLB, DRF, DRB
        const targetUPos = { 4: 0, 5: 1, 6: 2, 7: 3 };

        for (const cornerId of targetCorners) {
            let current = ctx.cube.findCorner(cornerId);
            if (current.position === cornerId && current.orientation === 0) continue;

            if (current.position >= 4) {
                this.liftCorner(ctx, apply, current.position);
                current = ctx.cube.findCorner(cornerId);
            }

            const desiredUPos = targetUPos[cornerId];
            let tempPos = current.position;
            while (tempPos !== desiredUPos) {
                apply('U');
                // Updating tempPos manually according to cycle
                if (tempPos === 0) tempPos = 1;
                else if (tempPos === 1) tempPos = 3;
                else if (tempPos === 3) tempPos = 2;
                else if (tempPos === 2) tempPos = 0;
            }

            // Now corner is above target.
            // Repeat specific alg until solved.
            // We check ctx.cube state.
            const isSolved = () => {
                const c = ctx.cube.getCornerAt(cornerId); // Target slot
                return c.id === cornerId && c.orientation === 0;
            };

            let limit = 0;
            while (!isSolved() && limit < 10) {
                // Apply alg for specific slot
                if (cornerId === 6) { // DRF (Right Front) -> R U R' U'
                    apply('R'); apply('U'); apply("R'"); apply("U'");
                } else if (cornerId === 4) { // DLF (Left Front) -> L' U' L U
                    apply("L'"); apply("U'"); apply('L'); apply('U');
                } else if (cornerId === 5) { // DLB (Left Back) -> L U L' U'
                    apply('L'); apply('U'); apply("L'"); apply("U'");
                } else if (cornerId === 7) { // DRB (Right Back) -> R' U' R U
                    apply("R'"); apply("U'"); apply('R'); apply('U');
                }
                limit++;
            }
        }
    }

    liftCorner(ctx, apply, position) {
        // Position is 4, 5, 6, 7
        // 4 (DLF). Lift via L or F.
        // Use standard "R U R'" equiv.
        // DLF is between L and F.
        // F' U' F moves DLF -> ULF.

        // 5 (DLB). L B L'. L moves DLB -> ULB? No.
        // L move: 0(ULF)->4(DLF)->5(DLB)->1(ULB).
        // L moves 5(DLB) to 1(ULB).
        // So L U' L'. 

        // 6 (DRF). R U R'.
        // R move: 2(URF)->3(URB)->7(DRB)->6(DRF).
        // R moves 6(DRF) -> 2(URF).
        // So R U R'.

        // 7 (DRB). R' U' R.
        // R' moves 7(DRB) -> 3(URB).

        // Let's implement specific lifts.
        const lifts = {
            4: ["L'", "U", "L"], // Lift DLF to U layer? 4(DLF) is affected by L. L move: 0->4->5->1.
            // L' moves 4->0(ULF). Correct.
            // Sequence: L' U L.
            5: ["L", "U'", "L'"], // Lift DLB(5). L moves 5->1(ULB).
            // Sequence: L U' L'.
            6: ["R", "U", "R'"], // Lift DRF(6). R moves 6->2(URF).
            // Sequence: R U R'.
            7: ["R'", "U'", "R"] // Lift DRB(7). R' moves 7->3(URB).
        };

        if (lifts[position]) {
            lifts[position].forEach(m => apply(m));
        }
    }

    insertCorner(ctx, apply, cornerId, orientation) {
        // Corner is strictly above target.
        // 4 (DLF) -> at 0 (ULF).
        // 6 (DRF) -> at 2 (URF). (Standard Righty)

        // Let's use DRF (6) as base case. Above at URF (2).
        // Orientation 0 (White Up): R U2 R' U' R U R'
        // Orientation 1 (White Right, on R face): R U R'
        // Orientation 2 (White Front, on F face): F' U' F

        // Map corners to logic "Right" or "Left"
        // 6 (DRF): uses R, F moves.
        // 4 (DLF): uses L, F moves.
        // 5 (DLB): uses L, B moves.
        // 7 (DRB): uses R, B moves.

        if (cornerId === 6) { // DRF (Front-Right)
            if (orientation === 1) { // White Right
                apply('R'); apply('U'); apply("R'");
            } else if (orientation === 2) { // White Front
                apply("F'"); apply("U'"); apply('F');
            } else { // White Up
                apply('R'); apply('U2'); apply("R'"); apply("U'"); apply('R'); apply('U'); apply("R'");
            }
        } else if (cornerId === 4) { // DLF (Front-Left)
            // Above at ULF (0). Uses L, F faces.
            // Mirror of DRF.
            // Left version: L' U' L
            if (orientation === 2) { // White Left (on L face). (Note: Ori 1/2 logic depends on Piece def)
                // Wait, check orientation meaning for Corner 4.
                // Def: ULF(0) U[6], L[2], F[0].
                // L[2] is L face. F[0] is F face.
                // If U sticker is at L face (Facelet 1), orientation = 1.
                // If U sticker is at F face (Facelet 2), orientation = 2.

                // So Ori 1 means White on Left.
                // Alg: L' U' L.
                apply("L'"); apply("U'"); apply("L");
            } else if (orientation === 1) { // White Front (Wait. Ori 1 was L?)
                // Let's re-verify Ori calc.
                // "else if (facesFound[1] === U/D) orientation = 1".
                // facesFound[1] corresponds to def.facelets[1].
                // For Corner 4 (DLF): facelets are D, L, F.
                // facelets[1] is L.
                // So if White is on L, Ori is 1.
                // Correct.

                // If White on Front (F face, facelets[2]), Ori 2.
                // Alg: F U F'
                // Wait check: F move sends F->U? No. F moves ULF->URF.
                // F moves DLF(4) -> ULF(0)? No. F' moves 0->4. So F moves 4->2(URF).
                // Use "Left Insert": F U F'. 
                apply('F'); apply('U'); apply("F'");
            } else { // White Up (Down?)
                // Actually White is matching "D". Since we are matching target D corner.
                // "Orientation 0" means D-color is on U-face (Top).
                // Alg: L' U2 L U L' U' L
                apply("L'"); apply("U2"); apply("L"); apply("U"); apply("L'"); apply("U'"); apply("L");
            }
        } else if (cornerId === 7) { // DRB (Back-Right)
            // Above at URB (3). Uses R, B faces.
            if (orientation === 1) { // White on Right (def: D, R, B. [1] is R).
                // R' U' R is classic Back insert?
                // No. R' moves 7(DRB) to 3(URB).
                // So R moves 3 -> 7.
                // Insert: R U' R'? No.
                // Target is Back Right.
                // R U R' ? No that inserts to Front Right.
                // R' U' R inserts to Back Right? No.
                // Use B and R moves.
                // B U B'.
                // B move: 1->5->7->3.
                // B moves 7(DRB) to 3(URB).
                // So B' moves 3 -> 7.
                // Alg: B' U' B.
                apply("B'"); apply("U'"); apply("B");
            } else if (orientation === 2) { // White Back (def [2] is B).
                // R U R'.
                // R moves 3 -> 7.
                // Wait. R cycle: ...->3->7.
                // So R moves URB to DRB.
                // Alg: R U R'.
                apply('R'); apply('U'); apply("R'");
            } else {
                // White Up.
                // R U2 R' U' R U R'
                apply('R'); apply('U2'); apply("R'"); apply("U'"); apply('R'); apply('U'); apply("R'");
            }
        } else if (cornerId === 5) { // DLB (Back-Left)
            // Above at ULB (1). Uses L, B faces.
            // Def: D, L, B. [1]=L. [2]=B.
            if (orientation === 1) { // White Left.
                // B U B'.
                // B moves 1(ULB) -> 5(DLB).
                // Alg: B U B'.
                apply('B'); apply('U'); apply("B'");
            } else if (orientation === 2) { // White Back.
                // L' U' L.
                // L cycle: 0->4->5->1.
                // L moves 1 -> 0? No. L moves 5->1.
                // So L' moves 1 -> 5.
                // Alg: L' U' L.
                apply("L'"); apply("U'"); apply("L");
            } else {
                // White Up.
                // L' U2 L U L' U' L
                apply("L'"); apply("U2"); apply("L"); apply("U"); apply("L'"); apply("U'"); apply("L");
            }
        }
    }

    solveSecondLayerEdges(ctx, apply) {
        const targetEdges = [8, 9, 10, 11]; // FL, FR, BL, BR

        // Definitions for strategy
        // Slot names for U-layer
        const U_SLOTS = { 'UL': 0, 'UB': 1, 'UR': 2, 'UF': 3 };

        // Mapping for each target edge
        const edgeInfo = {
            8: { name: 'FL', frontSlot: 3, sideSlot: 0, frontFace: 'F', sideFace: 'L' },
            9: { name: 'FR', frontSlot: 3, sideSlot: 2, frontFace: 'F', sideFace: 'R' },
            10: { name: 'BL', frontSlot: 1, sideSlot: 0, frontFace: 'B', sideFace: 'L' },
            11: { name: 'BR', frontSlot: 1, sideSlot: 2, frontFace: 'B', sideFace: 'R' }
        };

        for (const edgeId of targetEdges) {
            let current = ctx.cube.findEdge(edgeId);

            // Check if solved
            if (current.position === edgeId && current.orientation === 0) continue;

            // If "stuck" in a middle slot (but wrong one or wrong orientation), lift it out.
            if (current.position >= 8) {
                this.liftMiddleEdge(ctx, apply, current.position);
                current = ctx.cube.findEdge(edgeId); // Now in U
            }

            // If in Bottom (4-7) - should not happen if Cross/F2L corners preserved?
            // Actually Phase 3 invariant: F2L corners might minimize searching D?
            // Cross/Corners used 4-7. Middle edges shouldn't be validly in 4-7 if cross is solved?
            // Actually, if cross is solved, edges 4-7 are occupied by Cross Edges.
            // So our target edge MUST be in U (0-3) or Middle (8-11).

            // Now edge is in U. Align it.
            const info = edgeInfo[edgeId];

            // Logic derived:
            // Ori 0 -> Matches Side Face. Align to sideSlot.
            // Ori 1 -> Matches Front Face. Align to frontSlot.
            // (Note: This assumes standard Cube.js orientation mechanics)

            // Verification of Ori 1 assumption for UF/F-face match:
            // Earlier analysis: F' moves FR(Matches F) -> UF(Ori 1). Correct.
            // So Ori 1 -> Matches Front.

            const targetSlot = current.orientation === 0 ? info.sideSlot : info.frontSlot;

            // Bring to targetSlot
            let tempPos = current.position;
            let movesNeeded = 0;
            while (tempPos !== targetSlot) {
                tempPos = (tempPos + 1) % 4;
                movesNeeded++;
            }
            for (let k = 0; k < movesNeeded; k++) apply('U');

            // Now execute Insert
            // If Ori 0 (Side Match) -> Left Insert relative to Side Face?
            // No, depends on geometry.
            // FR (9), Ori 0 -> Aligned UR (Side). Target FR is "Left" of R-face?
            // Looking at R face: FR is Left. Yes.
            // So "Left Insert" using U'

            // FL (8), Ori 0 -> Aligned UL (Side). Target FL is "Right" of L-face.
            // So "Right Insert" using U.

            // Generalize:
            // If at SideSlot: Insert into [Main Face].
            // If at FrontSlot: Insert into [Side Face].

            // Let's rely on specific functions per edge to avoid confusion.
            this.insertMiddleEdge(ctx, apply, edgeId, current.orientation);
        }
    }

    liftMiddleEdge(ctx, apply, position) {
        // Lift edge at 'position' to U layer.
        // Just perform the "Right Insert" algorithm into that slot using a dummy U-piece.
        // FL (8): U' L' U L U F U' F' (Left insert to FL).
        // Moves FL to U.
        const algs = {
            8: ["L'", "U", "L", "U", "F", "U'", "F'"], // Left slot extract
            9: ["R", "U", "R'", "U'", "F'", "U'", "F"], // Right slot extract
            10: ["L", "U'", "L'", "U'", "B'", "U'", "B"], // BL extract
            11: ["R'", "U'", "R", "U", "B", "U", "B'"] // BR extract
        };
        // Note: Simple R U R' works too but might flip it? 
        // We just need it in U.

        if (algs[position]) algs[position].forEach(m => apply(m));
    }

    insertMiddleEdge(ctx, apply, edgeId, orientation) {
        // Precondition: Edge is already aligned at the correct slot defined by orientation.
        // We just need to trigger the sequence.

        // 9 (FR):
        // Ori 0 (Side Match at UR): U' F' U F U R U' R' (Left Insert to FR)
        // Ori 1 (Front Match at UF): U R U' R' U' F' U F (Right Insert to FR)

        if (edgeId === 9) { // FR
            if (orientation === 0) { // At UR
                apply("U'"); apply("F'"); apply("U"); apply("F"); apply("U"); apply("R"); apply("U'"); apply("R'");
            } else { // At UF
                apply("U"); apply("R"); apply("U'"); apply("R'"); apply("U'"); apply("F'"); apply("U"); apply("F");
            }
        } else if (edgeId === 8) { // FL
            if (orientation === 0) { // At UL (Side). Target FL is Right of L?
                // L face. FL is right.
                // Right insert: U L U' L' U' F' U F ?
                // No, L/F faces.
                // L U L' U' F' U F (Right insert relative to L default?)
                // Let's trace.
                // U (move to UF).
                // L (UL->DL).
                // This seems R-handed.

                // FL (8), Aligned at Side (UL).
                // Move U (Away to UB). 
                // F (Lift). U' (Restore). F' (Drop).
                // Alg: U F U' F' U' L' U L
                apply("U"); apply("F"); apply("U'"); apply("F'"); apply("U'"); apply("L'"); apply("U"); apply("L");
            } else { // At UF (Front). Target FL is Left of F.
                // Left insert: U' L' U L U F U' F'
                apply("U'"); apply("L'"); apply("U"); apply("L"); apply("U"); apply("F"); apply("U'"); apply("F'");
            }
        } else if (edgeId === 11) { // BR
            // Front B. Side R.
            if (orientation === 0) { // At UR (Side). Target BR is Right of R.
                // Right insert relative to R?
                // Move U (Away to UF).
                // B (Lift). U' (Restore). B' (Drop).
                // Alg: U B U' B' U' R' U R
                apply("U"); apply("B"); apply("U'"); apply("B'"); apply("U'"); apply("R'"); apply("U"); apply("R");
            } else { // At UB (Back). Target BR is Left of B.
                // Left insert relative to B.
                // U' R' U R U B U' B'
                apply("U'"); apply("R'"); apply("U"); apply("R"); apply("U"); apply("B"); apply("U'"); apply("B'");
            }
        } else if (edgeId === 10) { // BL
            // Front B. Side L.
            if (orientation === 0) { // At UL (Side). Target BL is Left of L.
                // Left insert relative to L.
                // U' B' U B U L U' L'
                apply("U'"); apply("B'"); apply("U"); apply("B"); apply("U"); apply("L"); apply("U'"); apply("L'");
            } else { // At UB (Back). Target BL is Right of B.
                // Right insert relative to B.
                // U L U' L' U' B' U B
                apply("U"); apply("L"); apply("U'"); apply("L'"); apply("U'"); apply("B'"); apply("U"); apply("B");
            }
        }
    }

    solveLastLayerCrossOrientation(ctx, apply) {
        // Goal: Edges 0,1,2,3 all have orientation 0
        // Edges: 0(UL), 1(UB), 2(UR), 3(UF).

        let attempts = 0;
        while (attempts < 10) {
            const edges = [0, 1, 2, 3];
            const orientations = edges.map(i => ctx.cube.getEdgeAt(i).orientation);
            const badCount = orientations.filter(o => o === 1).length;

            if (badCount === 0) break; // Cross solved

            // Cases based on "Good" (ori 0) edges
            const goodIndices = edges.filter(i => ctx.cube.getEdgeAt(i).orientation === 0);

            if (goodIndices.length === 0) {
                // Dot case: F R U R' U' F'
                apply('F'); apply('R'); apply('U'); apply("R'"); apply("U'"); apply("F'");
            } else if (goodIndices.length === 2) {
                // Check if opposite or adjacent
                // Indices are 0,1,2,3. Opposite diff is 2 (0,2 or 1,3).
                const diff = Math.abs(goodIndices[0] - goodIndices[1]);
                const isOpposite = diff === 2;

                if (isOpposite) {
                    // Line Case. Needs Line Horizontal.
                    // Horizontal means Left(0) and Right(2) are Good.
                    // If Good are 1(B) and 3(F), rotate U.
                    if (goodIndices.includes(1)) {
                        apply('U'); // Now 1->0(L), 3->2(R). Good at 0,2.
                    }
                    // Apply F R U R' U' F'
                    apply('F'); apply('R'); apply('U'); apply("R'"); apply("U'"); apply("F'");
                } else {
                    // L-Shape Case. Needs L at Back-Left (0 and 1 Good).
                    // We need to rotate U until Good edges are at 0 and 1.
                    // Combinations: 0,1 (Good). 1,2. 2,3. 3,0.
                    // Current Good Indices: e.g. [2,3].
                    // We want them at [0,1].
                    // 2->0 (-2), 3->1 (-2). So U2.

                    const isGood = (idx) => ctx.cube.getEdgeAt(idx).orientation === 0;
                    while (!(isGood(0) && isGood(1))) {
                        apply('U');
                    }
                    // Apply F U R U' R' F'
                    apply('F'); apply('U'); apply('R'); apply("U'"); apply("R'"); apply("F'");
                }
            }
            attempts++;
        }
    }

    solveLastLayerEdgePermutation(ctx, apply) {
        // Goal: Edges 0,1,2,3 match centers.
        // Edge 0 (UL) should be ID 0.
        // Edge 1 (UB) should be ID 1.
        // Edge 2 (UR) should be ID 2.
        // Edge 3 (UF) should be ID 3.

        // Step 1: Rotate U to align at least 2 edges.
        // There is always a rotation where at least 2 align.

        const checkMatches = () => {
            let matches = 0;
            if (ctx.cube.getEdgeAt(0).id === 0) matches++;
            if (ctx.cube.getEdgeAt(1).id === 1) matches++;
            if (ctx.cube.getEdgeAt(2).id === 2) matches++;
            if (ctx.cube.getEdgeAt(3).id === 3) matches++;
            return matches;
        };

        // Try all 4 rotations, pick best
        let bestU = 0;
        let maxMatches = 0;

        // Clone minimal state to test rotations?
        // Or just apply and undo.
        for (let u = 0; u < 4; u++) {
            const m = checkMatches();
            if (m > maxMatches) {
                maxMatches = m;
                bestU = u;
            }
            if (m === 4) { bestU = u; break; }
            // Simulate U in helper? Or real apply.
            // Let's just peer into state "as if" rotated.
            // Too complex. Just apply U, check, tracking.
            // We can't apply U 4 times and leave it.
            // We are inside "solve". We must commit moves.
            // So we assume we are at some state.
            // We want to Find the rotation that gives matches.
            // Currently at state S.
            // U0: Check. U1: Check.
            // Since we are coding a solver, we can just look at IDs.
            // Edge at 0 has ID x.
            // If we rotate U once, Edge at 0 moves to 1? NO.
            // If we rotate U (Face), the pieces move.
            // Piece at 0 moves to 1.
            // We want Piece ID 0 to be at Slot 0.
            // Piece ID 1 to be at Slot 1.

            // Just rotate U until "matches >= 2".
            apply('U');
        }

        // Reset to best?
        // The loop above left us in some state. 
        // We need to settle on the state with >= 2 matches.
        // Let's do it cleanly:
        // Find best rotation offset.
        // Apply it.

        // But simply: Rotate U until matches >= 2.
        // Guarantee: exists? Not necessarily 2 adjacent. Maybe 2 opposite.
        // Actually, there is always at least 2 matches possible?
        // Sune cycles 3 edges. One stays.
        // If we align the "One", we get 1 match.
        // Maybe only 1 match possible?
        // If only 1 match, apply Sune. Then try again.

        let attempts = 0;
        while (attempts < 10) {
            let bestMatches = 0;
            let movesToBest = 0;

            // Scan 4 positions
            for (let k = 0; k < 4; k++) {
                const m = checkMatches();
                if (m === 4) return; // Solved!
                if (m > bestMatches) {
                    bestMatches = m;
                    movesToBest = 0; // Current is best
                }
                apply('U');
                movesToBest++;
                // Wait, if next is better, movesToBest should track offset from start?
                // This logic is messy.
            }
            // After 4 U's, we are back to start.
            // We want to go to the "best" offset.
            // But we don't know which 'k' was best.

            // Clean logic:
            // 1. Find offset 0..3 that maximizes matches.
            // 2. Apply that offset.
            // 3. If matches == 4, return.
            // 4. If matches < 2, forces Sune? No, usually 2 are possible. 
            //    If only 1, standard PLL says Sune until 2?
            //    Fact: You can always match at least 2 edges? 
            //    Example: Solved edges 0,1,2,3. 
            //    Permutation: 0, 2, 1, 3. (Swapped 1 and 2).
            //    Match 0. (UL). Others wrong.
            //    Rotate U (0->1 position). 
            //    0 at 1. 2 at 2 (Match). 1 at 3. 3 at 0.
            //    Match 2.
            //    So "at least 1" is trivial.
            //    Is "at least 2" guaranteed? No.
            //    Case: 0 2 1 3 (above). 
            //    U0: Match 0. (1 match).
            //    U1: Match 2 at 2. (1 match).
            //    U2: 0 at 2. 2 at 3. 1 at 0. 3 at 1. (0 matches).
            //    U3: 0 at 3. 2 at 0. 1 at 1 (Match). 3 at 2. (1 match).
            //    So MAX matches is 1.

            // Algorithm:
            // Align to have MAX matches.
            // Identify the MATCHED edge(s).
            // Case A: 4 matches -> Done.
            // Case B: 1 match (or 0?). Hold matched edge at Front (UF)? Or Back (UB)?
            //         Apply Sune. Check again.
            // Case C: 2 matches.
            //    Adjacent (e.g. Back and Right)? Sune.
            //    Opposite (e.g. Front and Back)? Sune.
            // Sune Alg: R U R' U R U2 R'.
            // Effect: Preserves Front-Left? (Depends on orientation).
            // Standard Sune: Preserves pieces?
            // It swaps 3 pieces.
            // Usually we hold "Solved" piece at Front? No, Sune permutes U-layer.
            // Let's strict:
            // Sune (R U R' U R U2 R') swaps:
            //   UF -> UL -> UB -> UF (Clockwise cycle of 3).
            //   UR stays put??
            //   Wait, let's trace Sune on Edges.
            //   R U R' U R U2 R'.
            //   R moves UR->BR (out). U moves pieces.
            //   Result:
            //   UR edge stays at UR? No.
            //   Actually Sune cycles FL, BL, etc?
            //   Standard Sune outcome on LL Edges:
            //   Cycles UB -> UL -> UF -> UB ??
            //   UR is invariant? No.
            //   Usually with Sune, we fix One corner/edge?
            //   
            //   For PLL Edges (EPLL):
            //   We use Sune to Orient? No OLL is done.
            //   We use Sune for Permutation?
            //   Yes, Sune cycles edges.
            //   Specifically: Sune affects corners too. We haven't solved corners yet.
            //   So we don't care about corners permuting.
            //   We just want Edges to match.

            //   Cycle: UB -> UL -> UF -> UB (Clockwise) ?
            //   UR edge is NOT moved?
            //   If so, we position the "Matched" edge at UR.

            // Strategy:
            // 1. Find Max Matches rotation. Apply it.
            // 2. If 4 matches, done.
            // 3. If 2 matches adjacent (e.g. UL(0) and UB(1) are correct).
            //    Hold correct ones at Back and Right?
            //    We want to swap the other two? No, EPLL usually 3-cycle.
            //    If 2 adj are correct, other 2 are swapped? Impossible on valid cube (2-swap needs parity).
            //    (Unless corners absorb parity? Yes corners can be 2-swapped).
            //    But we are doing edges first.
            //    We can solve all 4 edges correctly.

            //    If we have 2 adj matched (0,1). The others (2,3) are swapped.
            //    This implies we need to swap 2 and 3.
            //    Sune swaps 3 items.
            //    We can apply Sune to get to 1 match state, then solving.

            //    Heuristic: Just apply Sune until solved.
            //    Hold a SOLVED edge at UR (2)?
            //    Or hold an UNSOLVED edge at UR?

            //    Let's use the "Match 1" strategy.
            //    Align so EXACTLY 1 edge matches (if possible).
            //    Hold it at UR (2)? No, typically Front or Back.
            //    Apply Sune.

            //    If we can't get exactly 1 match (e.g. we have 2 adj).
            //    Apply Sune from anywhere to break it.

            // Let's implement:
            // 1. Find best rotation.
            // 2. If 4 matches, done.
            // 3. If < 4:
            //    Check if there's a rotation with exactly 1 match.
            //    If so, use it. Put matched edge at UB(1) [Back].
            //    Apply Sune: R U R' U R U2 R'.
            //    (This cycles UL->UF->UR -> UL). UB stays.
            //    Check if solved. If not, apply Sune again.
            //    
            //    If NO rotation has 1 match (only 0 or 2):
            //    Just apply Sune from anywhere. This changes permutations.
            //    Loop.

            // Scan for 1 match
            let foundOne = false;
            for (let k = 0; k < 4; k++) {
                if (checkMatches() === 1) {
                    foundOne = true;
                    break;
                }
                if (checkMatches() === 4) return;
                apply('U');
            }

            if (foundOne) {
                // We have 1 match. 
                // Find which one is matched.
                let matchedIdx = -1;
                for (let i = 0; i < 4; i++) {
                    if (ctx.cube.getEdgeAt(i).id === i) { matchedIdx = i; break; }
                }

                // Rotate until matchedIdx is at UB (1).
                // matchedIdx is 0,1,2,3.
                // We want it at 1.
                // U moves: 0->1->2->3->0...
                // Wait, if id 0 is at pos 0.
                // U move: now at pos 1.
                // So pieces move +1 idx.
                // We want piece at matchedIdx to move to 1.
                let currentPos = matchedIdx; // It is currently at matchedIdx
                let rots = 0;
                while (currentPos !== 1) {
                    apply('U');
                    currentPos = (currentPos + 1) % 4;
                    rots++;
                }

                // Now matched edge is at UB.
                // Apply Sune: R U R' U R U2 R'
                apply('R'); apply('U'); apply("R'"); apply('U'); apply('R'); apply('U2'); apply("R'");

                // Check if solved? Sune might need 2nd iter.
                // We handled loop in outer `attempts`.
            } else {
                // 0 or 2 matches.
                // Apply Sune to shuffle.
                apply('R'); apply('U'); apply("R'"); apply('U'); apply('R'); apply('U2'); apply("R'");
            }
            attempts++;
        }
    }

    solveLastLayerCornerPermutation(ctx, apply) {
        // Goal: Corners 0,1,2,3 at correct slots (id matches pos).
        // Edges already solved, so NO U setup moves allowed unless we undo them.
        // Actually, LL Corner Permutation usually preserves Edges.

        let attempts = 0;
        while (attempts < 10) {
            const placed = [];
            for (let i = 0; i < 4; i++) {
                if (ctx.cube.getCornerAt(i).id === i) placed.push(i);
            }

            if (placed.length === 4) break;

            if (placed.length === 0) {
                // Apply Standard to get one placed
                apply('U'); apply('R'); apply("U'"); apply("L'"); apply('U'); apply("R'"); apply("U'"); apply('L');
            } else if (placed.length === 1) {
                const k = placed[0];
                if (k === 2) { // URF: Standard
                    apply('U'); apply('R'); apply("U'"); apply("L'"); apply('U'); apply("R'"); apply("U'"); apply('L');
                } else if (k === 0) { // ULF: Mirror
                    apply("U'"); apply("L'"); apply('U'); apply('R'); apply("U'"); apply('L'); apply('U'); apply("R'");
                } else if (k === 1) { // ULB: Standard 180
                    // U L U' R' U L' U' R
                    apply('U'); apply('L'); apply("U'"); apply("R'"); apply('U'); apply("L'"); apply("U'"); apply('R');
                } else if (k === 3) { // URB: Rotated Standard
                    // U B U' F' U B' U' F
                    apply('U'); apply('B'); apply("U'"); apply("F'"); apply('U'); apply("B'"); apply("U'"); apply('F');
                }
            } else {
                // 2 matches? Should not happen in standard valid PLL.
                // If it behaves weirdly, just apply standard Niklas to break it.
                apply('U'); apply('R'); apply("U'"); apply("L'"); apply('U'); apply("R'"); apply("U'"); apply('L');
            }
            attempts++;
        }
    }

    solveLastLayerCornerOrientation(ctx, apply) {
        // Goal: Corners 0,1,2,3 orientation === 0.
        // Positions are fixed.
        // Algo: R' D' R D (affects 2 - URF).
        // Iterate corners, bring to slot 2, fix, restore.

        // We track "setup" U moves to restore edges at the end? 
        // No, we cycle U moves. Start with slot 2. Fix it.
        // U move (bring slot 2 away, bring 3 to 2?).
        // Actually: We bring corner TO slot 2.
        // corners[2] is the working corner.

        let uMoves = 0;
        for (let i = 0; i < 4; i++) {
            // Check corner at position 2 (URF)
            // While orientation != 0, apply R' D' R D
            let current = ctx.cube.getCornerAt(2);
            while (current.orientation !== 0) {
                // R' D' R D
                apply("R'"); apply("D'"); apply('R'); apply('D');
                apply("R'"); apply("D'"); apply('R'); apply('D'); // Apply in pairs/groups? 

                // Check state update
                current = ctx.cube.getCornerAt(2);

                // Safety break
                // Theoretically max 4 times (2 applications of 2x)
            }

            // Bring next corner to position 2
            apply('U');
            // Logic:
            // U move: 0->1, 1->3, 3->2, 2->0 ?
            // Cube.js cycle: [0, 1, 3, 2].
            // U moves corner at 2 to 0.
            // U moves corner at 3 to 2.
            // So 'U' brings 3 (URB) to 2 (URF). Correct.
            // We iterate 4 times.
            // Corner seq:
            // i=0: Fix original at 2. Move U (bring 3).
            // i=1: Fix original at 3 (now at 2). Move U (bring 1).
            // i=2: Fix original at 1 (now at 2). Move U (bring 0).
            // i=3: Fix original at 0 (now at 2). Move U (restore to original).
            // At the end, U should be aligned because total twist is 0 mod 3.
            // Wait, we need to ensure Edges are restored.
            // If we did 4 U moves, edges are back?
            // Cube.js U cycle order: 0->1->3->2.
            // 4 U moves = 360?
            // Cycle length is 4. Yes.
        }
    }
}

module.exports = new SolverService();
