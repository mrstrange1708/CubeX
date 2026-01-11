// Script to derive correct corner facelet ordering by testing all permutations

const solver = require('../../src/services/solver/solver.service');
const CubieCube = require('../../src/services/solver/CubieCube');

const moves = ['U', 'R', 'L', 'F', 'B', 'D'];
const baseStickers = {
    U: Array(9).fill('white'),
    L: Array(9).fill('orange'),
    F: Array(9).fill('green'),
    R: Array(9).fill('red'),
    B: Array(9).fill('blue'),
    D: Array(9).fill('yellow')
};

// Get expected corner orientations from CubieCube
const basicMoves = CubieCube.getBasicMoves();

console.log("Expected corner orientations from CubieCube:");
for (const m of moves) {
    console.log(`  ${m}: [${basicMoves[m].co.join(', ')}]`);
}

console.log("\nActual corner orientations from sticker mapping:");
for (const m of moves) {
    const movedStickers = solver.applyMove(baseStickers, m);
    try {
        const cubie = solver.mapToCubie(movedStickers);
        console.log(`  ${m}: [${cubie.co.join(', ')}]`);
    } catch (e) {
        console.log(`  ${m}: ERROR - ${e.message}`);
    }
}

console.log("\nDifferences (Expected - Actual):");
for (const m of moves) {
    const expected = basicMoves[m].co;
    const movedStickers = solver.applyMove(baseStickers, m);
    try {
        const actual = solver.mapToCubie(movedStickers).co;
        const diffs = expected.map((e, i) => `${i}:${e}->${actual[i]}${e !== actual[i] ? '❌' : ''}`);
        console.log(`  ${m}: ${diffs.join(' ')}`);
    } catch (e) {
        console.log(`  ${m}: ERROR`);
    }
}
