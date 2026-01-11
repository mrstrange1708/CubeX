const solver = require('../../src/services/solver/solver.service');
const CubieCube = require('../../src/services/solver/CubieCube');

function isSolved(stickers) {
    const solved = {
        U: Array(9).fill('white'),
        L: Array(9).fill('orange'),
        F: Array(9).fill('green'),
        R: Array(9).fill('red'),
        B: Array(9).fill('blue'),
        D: Array(9).fill('yellow')
    };
    for (let f in solved) {
        for (let i = 0; i < 9; i++) {
            if (stickers[f][i] !== solved[f][i]) return false;
        }
    }
    return true;
}

const testCases = [
    { name: "TC1: R Move", moves: ["R"] },
    { name: "TC2: U Move", moves: ["U"] },
    { name: "TC3: R U", moves: ["R", "U"] },
    { name: "TC4: R U R' U'", moves: ["R", "U", "R'", "U'"] },
    { name: "TC5: Double Moves", moves: ["R2", "L2", "U2"] },
    { name: "TC6: 10 Moves", moves: ["R", "U", "F", "B", "L", "D", "R2", "U2", "F2", "L2"] },
    { name: "TC7: Opposite Faces", moves: ["R", "L", "U", "D", "F", "B"] },
    { name: "TC8: 15 Moves", moves: ["B2", "R2", "L2", "U", "B2", "D'", "L2", "F2", "R2", "U'", "R", "F'", "R", "D2", "B"] },
    { name: "TC9: 20 Moves (Deep)", moves: ["D2", "B2", "U2", "L", "B2", "R", "F2", "L2", "F2", "R'", "U2", "B", "R2", "U", "L2", "F'", "D'", "B", "R", "B"] },
    { name: "TC10: User Request (15 moves)", moves: ["F", "R", "U", "B", "L", "D", "F2", "R2", "U2", "B2", "L2", "D2", "F", "R", "U"] },
    { name: "TC11: User Request (18 moves)", moves: ["R", "U", "F", "L", "D", "B", "R", "U", "F", "L", "D", "B", "R", "U", "F", "L", "D", "B"] },
    { name: "TC12: Edge Case (Superflip)", moves: ["U", "R2", "F", "B", "R", "B2", "R", "U2", "L", "B2", "R", "U'", "D'", "R2", "F", "R'"] },
    { name: "TC13: Complex Permutation", moves: ["D2", "L2", "B2", "R2", "U2", "F2", "L2", "B2", "R2", "D2", "U2"] }
];

async function runTests() {
    console.log("=== RUBIK'S SOLVER TEST SUITE ===\n");
    let passed = 0;

    for (const tc of testCases) {
        process.stdout.write(`Testing ${tc.name}... `);

        let state = {
            U: Array(9).fill('white'),
            L: Array(9).fill('orange'),
            F: Array(9).fill('green'),
            R: Array(9).fill('red'),
            B: Array(9).fill('blue'),
            D: Array(9).fill('yellow')
        };

        // Apply scramble
        tc.moves.forEach(m => {
            state = solver.applyMove(state, m);
        });

        // Solve
        const solveRes = solver.solve(state);

        if (!solveRes.valid) {
            console.log(`FAILED (Solver Error: ${solveRes.error})`);
            continue;
        }

        const solutionMoves = solveRes.solution === "" ? [] : solveRes.solution.split(' ');

        // Apply solution
        let finalState = JSON.parse(JSON.stringify(state));
        solutionMoves.forEach(m => {
            finalState = solver.applyMove(finalState, m);
        });

        if (isSolved(finalState)) {
            console.log("PASSED ✅");
            passed++;
        } else {
            console.log("FAILED ❌ (Cube not solved)");
            console.log("   Scramble:", tc.moves.join(' '));
            console.log("   Solution:", solveRes.solution || "(empty)");
        }
    }

    console.log(`\nSummary: ${passed}/${testCases.length} tests passed.`);
    if (passed === testCases.length) {
        console.log("GLOBAL SUCCESS! 🌟");
    } else {
        console.log("SOME TESTS FAILED. ⚠️");
        process.exit(1);
    }
}

runTests();
