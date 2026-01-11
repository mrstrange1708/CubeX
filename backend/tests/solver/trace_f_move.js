// Trace F move with swapped URF definition

const solver = require('../../src/services/solver/solver.service');

const baseStickers = {
    U: Array(9).fill('white'),
    L: Array(9).fill('orange'),
    F: Array(9).fill('green'),
    R: Array(9).fill('red'),
    B: Array(9).fill('blue'),
    D: Array(9).fill('yellow')
};

console.log("=== TRACING F MOVE ===\n");

const afterF = solver.applyMove(baseStickers, 'F');

console.log("After F move, URF position stickers:");
console.log(`  U[8] = ${afterF.U[8]}`);
console.log(`  R[0] = ${afterF.R[0]}`);
console.log(`  F[2] = ${afterF.F[2]}`);

const colorToFace = {};
['U', 'D', 'L', 'R', 'F', 'B'].forEach(f => colorToFace[afterF[f][4]] = f);

// With current def [U[8], R[0], F[2]]
console.log("\n--- With current def [U[8], R[0], F[2]] ---");
const actual1 = [afterF.U[8], afterF.R[0], afterF.F[2]].map(c => colorToFace[c]);
const ud1 = actual1.findIndex(f => f === 'U' || f === 'D');
console.log(`Actual faces: [${actual1}]`);
console.log(`U/D at index: ${ud1} => Orientation: ${ud1}`);
console.log(`Expected: 1, Match: ${ud1 === 1 ? '✓' : '✗'}`);

// With swapped def [U[8], F[2], R[0]]
console.log("\n--- With swapped def [U[8], F[2], R[0]] ---");
const actual2 = [afterF.U[8], afterF.F[2], afterF.R[0]].map(c => colorToFace[c]);
const ud2 = actual2.findIndex(f => f === 'U' || f === 'D');
console.log(`Actual faces: [${actual2}]`);
console.log(`U/D at index: ${ud2} => Orientation: ${ud2}`);
console.log(`Expected: 1, Match: ${ud2 === 1 ? '✓' : '✗'}`);
