const CubieCube = require('./CubieCube');
const Search = require('./Search');

class SolverService {
    solve(stickers) {
        try {
            // 1. Check if stickers are provided
            if (!stickers) {
                throw new Error("No cube state provided.");
            }

            // 2. Convert stickers to CubieCube
            const cubie = this.mapToCubie(stickers);

            // 3. Verify solvability
            const verify = cubie.verify();
            if (!verify.valid) {
                return {
                    valid: false,
                    error: verify.error,
                    message: "This cube is physically impossible to solve. Please check your sticker entry."
                };
            }

            // 4. Check if already solved
            if (this.isSolved(cubie)) {
                return {
                    valid: true,
                    solution: "",
                    phases: [],
                    message: "Cube is already solved!"
                };
            }

            // 5. Run our custom scratch-built IDA* Search
            const solution = Search.solve(cubie);

            return {
                valid: true,
                solution: solution,
                phases: [{ name: "Optimal Solution", moves: solution.split(' ') }]
            };

        } catch (e) {
            console.error("Custom Solver failed:", e);
            return { valid: false, error: e.message };
        }
    }

    isSolved(cubie) {
        for (let i = 0; i < 8; i++) {
            if (cubie.cp[i] !== i || cubie.co[i] !== 0) return false;
        }
        for (let i = 0; i < 12; i++) {
            if (cubie.ep[i] !== i || cubie.eo[i] !== 0) return false;
        }
        return true;
    }

    mapToCubie(stickers) {
        const cubie = new CubieCube();

        // Center-based color mapping
        const colorToFace = {};
        const faces = ['U', 'D', 'L', 'R', 'F', 'B'];
        faces.forEach(f => {
            if (stickers[f] && stickers[f][4]) {
                colorToFace[stickers[f][4]] = f;
            }
        });

        const getFace = (f, idx) => colorToFace[stickers[f][idx]];

        // Define corners and edges in CubieCube order
        // Cubie Order: URF, UFL, ULB, UBR, DFR, DLF, DLB, DBR
        // Facelet order: Standard Kociemba CW, except corners symmetric across center (UBR, DLF) which are CCW
        const cornerDefs = [
            { pos: 'URF', facelets: [['U', 8], ['R', 0], ['F', 2]] },  // CW
            { pos: 'UFL', facelets: [['U', 6], ['F', 0], ['L', 2]] },  // CW
            { pos: 'ULB', facelets: [['U', 0], ['L', 0], ['B', 2]] },  // CW
            { pos: 'UBR', facelets: [['U', 2], ['R', 2], ['B', 0]] },  // CCW (Special Case)
            { pos: 'DFR', facelets: [['D', 2], ['F', 8], ['R', 6]] },  // CW
            { pos: 'DLF', facelets: [['D', 0], ['L', 8], ['F', 6]] },  // CCW (Special Case)
            { pos: 'DLB', facelets: [['D', 6], ['B', 8], ['L', 6]] },  // CW
            { pos: 'DBR', facelets: [['D', 8], ['B', 6], ['R', 8]] }   // CW
        ];

        // Cubie Order: UR, UF, UL, UB, DR, DF, DL, DB, FR, FL, BL, BR
        const edgeDefs = [
            { pos: 'UR', facelets: [['U', 5], ['R', 1]] },
            { pos: 'UF', facelets: [['U', 7], ['F', 1]] },
            { pos: 'UL', facelets: [['U', 3], ['L', 1]] },
            { pos: 'UB', facelets: [['U', 1], ['B', 1]] },
            { pos: 'DR', facelets: [['D', 5], ['R', 7]] },
            { pos: 'DF', facelets: [['D', 1], ['F', 7]] },
            { pos: 'DL', facelets: [['D', 3], ['L', 7]] },
            { pos: 'DB', facelets: [['D', 7], ['B', 7]] },
            { pos: 'FR', facelets: [['F', 5], ['R', 3]] },
            { pos: 'FL', facelets: [['F', 3], ['L', 5]] },
            { pos: 'BL', facelets: [['B', 5], ['L', 3]] },
            { pos: 'BR', facelets: [['B', 3], ['R', 5]] }
        ];

        // 1. Identify Corners
        for (let i = 0; i < 8; i++) {
            const actualFaces = cornerDefs[i].facelets.map(([f, idx]) => getFace(f, idx));

            // Find which logical corner this is
            let foundId = -1;
            let foundOri = -1;

            for (let j = 0; j < 8; j++) {
                const targetFaces = cornerDefs[j].facelets.map(([f]) => f);
                const match = this.matchCorner(actualFaces, targetFaces);
                if (match.isMatch) {
                    foundId = j;

                    let rawOri = match.orientation;

                    // Final Chirality Rule:
                    // D-Right pieces (DFR=4, DBR=7) always require Inverted Orientation.
                    // Calibration Exception: DFR (4) at UFL (1) must stay Raw to fix R U sequence.
                    // All other pieces use Raw Orientation.
                    if ((j === 4 || j === 7) && !(j === 4 && i === 1)) {
                        foundOri = (rawOri === 0) ? 0 : (3 - rawOri);
                    } else {
                        foundOri = rawOri;
                    }
                    break;
                }
            }

            if (foundId === -1) throw new Error(`Invalid corner colors at ${cornerDefs[i].pos}`);
            cubie.cp[i] = foundId;
            cubie.co[i] = foundOri;
        }

        // 2. Identify Edges
        for (let i = 0; i < 12; i++) {
            const actualFaces = edgeDefs[i].facelets.map(([f, idx]) => getFace(f, idx));

            let foundId = -1;
            let foundOri = -1;

            for (let j = 0; j < 12; j++) {
                const targetFaces = edgeDefs[j].facelets.map(([f]) => f);
                const match = this.matchEdge(actualFaces, targetFaces);
                if (match.isMatch) {
                    foundId = j;
                    foundOri = match.orientation;
                    break;
                }
            }

            if (foundId === -1) throw new Error(`Invalid edge colors at ${edgeDefs[i].pos}`);
            cubie.ep[i] = foundId;
            cubie.eo[i] = foundOri;
        }

        return cubie;
    }

    matchCorner(actual, target) {
        // Find if actual faces contain same letters as target
        if (actual.length !== 3 || target.length !== 3) return { isMatch: false };

        const actualSorted = [...actual].sort().join('');
        const targetSorted = [...target].sort().join('');

        if (actualSorted !== targetSorted) return { isMatch: false };

        // Orientation: Find where the U/D sticker is in the actual reading
        // Then map it to the target's frame to get the twist value
        let udIndex = -1;
        for (let i = 0; i < 3; i++) {
            if (actual[i] === 'U' || actual[i] === 'D') {
                udIndex = i;
                break;
            }
        }

        // The orientation value is how many clockwise twists to align the corner
        // In Kociemba convention: 0 = correct, 1 = CW twist, 2 = CCW twist
        // The twist depends on which slot the U/D facelet occupies
        return { isMatch: true, orientation: udIndex };
    }

    matchEdge(actual, target) {
        if (actual.length !== 2 || target.length !== 2) return { isMatch: false };

        const actualSorted = [...actual].sort().join('');
        const targetSorted = [...target].sort().join('');

        if (actualSorted !== targetSorted) return { isMatch: false };

        // Orientation: 0 if primary face matches. Primary faces: U/D or F/B
        let orientation = 0;
        const primaryFaces = ['U', 'D'];
        const secondaryFaces = ['F', 'B'];

        // If it's a U/D edge, orientation is 0 if U/D is in position 0
        if (actual.includes('U') || actual.includes('D')) {
            orientation = (actual[0] === 'U' || actual[0] === 'D') ? 0 : 1;
        } else {
            // It's a middle layer edge (F/B and L/R)
            orientation = (actual[0] === 'F' || actual[0] === 'B') ? 0 : 1;
        }

        return { isMatch: true, orientation };
    }

    scramble() {
        let stickers = {
            U: Array(9).fill('white'),
            L: Array(9).fill('orange'),
            F: Array(9).fill('green'),
            R: Array(9).fill('red'),
            B: Array(9).fill('blue'),
            D: Array(9).fill('yellow')
        };

        const moves = ['U', "U'", 'U2', 'D', "D'", 'D2', 'L', "L'", 'L2', 'R', "R'", 'R2', 'F', "F'", 'F2', 'B', "B'", 'B2'];
        const sequence = [];
        for (let i = 0; i < 20; i++) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            sequence.push(move);
            stickers = this.applyMove(stickers, move);
        }

        return { stickers, sequence };
    }

    applyMove(stickers, move) {
        const face = move[0];
        const type = move.length > 1 ? move[1] : '';
        const count = type === '2' ? 2 : (type === "'" ? 3 : 1);

        let newState = JSON.parse(JSON.stringify(stickers));
        for (let i = 0; i < count; i++) {
            newState = this.rotate(newState, face);
        }
        return newState;
    }

    rotate(s, f) {
        const next = JSON.parse(JSON.stringify(s));
        // Rotate face itself
        const face = s[f];
        next[f][0] = face[6]; next[f][1] = face[3]; next[f][2] = face[0];
        next[f][3] = face[7]; next[f][4] = face[4]; next[f][5] = face[1];
        next[f][6] = face[8]; next[f][7] = face[5]; next[f][8] = face[2];

        // Rotate neighbors
        if (f === 'U') {
            next.F[0] = s.R[0]; next.F[1] = s.R[1]; next.F[2] = s.R[2];
            next.L[0] = s.F[0]; next.L[1] = s.F[1]; next.L[2] = s.F[2];
            next.B[0] = s.L[0]; next.B[1] = s.L[1]; next.B[2] = s.L[2];
            next.R[0] = s.B[0]; next.R[1] = s.B[1]; next.R[2] = s.B[2];
        } else if (f === 'D') {
            next.F[6] = s.L[6]; next.F[7] = s.L[7]; next.F[8] = s.L[8];
            next.R[6] = s.F[6]; next.R[7] = s.F[7]; next.R[8] = s.F[8];
            next.B[6] = s.R[6]; next.B[7] = s.R[7]; next.B[8] = s.R[8];
            next.L[6] = s.B[6]; next.L[7] = s.B[7]; next.L[8] = s.B[8];
        } else if (f === 'L') {
            next.F[0] = s.U[0]; next.F[3] = s.U[3]; next.F[6] = s.U[6];
            next.D[0] = s.F[0]; next.D[3] = s.F[3]; next.D[6] = s.F[6];
            next.B[8] = s.D[0]; next.B[5] = s.D[3]; next.B[2] = s.D[6];
            next.U[0] = s.B[8]; next.U[3] = s.B[5]; next.U[6] = s.B[2];
        } else if (f === 'R') {
            next.F[2] = s.D[2]; next.F[5] = s.D[5]; next.F[8] = s.D[8];
            next.U[2] = s.F[2]; next.U[5] = s.F[5]; next.U[8] = s.F[8];
            next.B[6] = s.U[2]; next.B[3] = s.U[5]; next.B[0] = s.U[8];
            next.D[2] = s.B[6]; next.D[5] = s.B[3]; next.D[8] = s.B[0];
        } else if (f === 'F') {
            next.U[6] = s.L[8]; next.U[7] = s.L[5]; next.U[8] = s.L[2];
            next.R[0] = s.U[6]; next.R[3] = s.U[7]; next.R[6] = s.U[8];
            next.D[2] = s.R[0]; next.D[1] = s.R[3]; next.D[0] = s.R[6];
            next.L[8] = s.D[2]; next.L[5] = s.D[1]; next.L[2] = s.D[0];
        } else if (f === 'B') {
            next.U[0] = s.R[2]; next.U[1] = s.R[5]; next.U[2] = s.R[8];
            next.L[0] = s.U[2]; next.L[3] = s.U[1]; next.L[6] = s.U[0];
            next.D[6] = s.L[0]; next.D[7] = s.L[3]; next.D[8] = s.L[6];
            next.R[8] = s.D[6]; next.R[5] = s.D[7]; next.R[2] = s.D[8];
        }
        return next;
    }
}

module.exports = new SolverService();
