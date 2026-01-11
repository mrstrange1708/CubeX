// Find which URF facelet ordering works for both R and F moves

const solver = require('../../src/services/solver/solver.service');

const baseStickers = {
    U: Array(9).fill('white'),
    L: Array(9).fill('orange'),
    F: Array(9).fill('green'),
    R: Array(9).fill('red'),
    B: Array(9).fill('blue'),
    D: Array(9).fill('yellow')
};

const afterR = solver.applyMove(baseStickers, 'R');
const afterF = solver.applyMove(baseStickers, 'F');

const colorToFace = {};
['U', 'D', 'L', 'R', 'F', 'B'].forEach(f => colorToFace[baseStickers[f][4]] = f);

// The three physical positions in URF corner
const positions = [
    ['U', 8], // U face position
    ['R', 0], // R face position
    ['F', 2]  // F face position
];

// All 6 permutations of [0, 1, 2]
const perms = [
    [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]
];

console.log("Testing all 6 permutations for URF corner facelet ordering:\n");

for (const perm of perms) {
    const ordering = perm.map(i => positions[i]);
    const label = ordering.map(([f, i]) => `${f}[${i}]`).join(', ');

    // After R move
    const actualR = ordering.map(([face, idx]) => colorToFace[afterR[face][idx]]);
    const oriR = actualR.findIndex(f => f === 'U' || f === 'D');

    // After F move
    const actualF = ordering.map(([face, idx]) => colorToFace[afterF[face][idx]]);
    const oriF = actualF.findIndex(f => f === 'U' || f === 'D');

    const rOk = oriR === 1;  // Expected orientation 1 after R
    const fOk = oriF === 1;  // Expected orientation 1 after F

    console.log(`[${label}]:`);
    console.log(`  R move: actual=[${actualR}], D at index ${oriR}, expected 1 → ${rOk ? '✓' : '✗'}`);
    console.log(`  F move: actual=[${actualF}], U at index ${oriF}, expected 1 → ${fOk ? '✓' : '✗'}`);
    console.log(`  Both OK: ${rOk && fOk ? '✓ WINNER!' : '✗'}`);
    console.log();
}
