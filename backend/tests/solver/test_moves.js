const solver = require('../../src/services/solver/solver.service');
const CubieCube = require('../../src/services/solver/CubieCube');

const baseStickers = {
    U: Array(9).fill('white'),
    L: Array(9).fill('orange'),
    F: Array(9).fill('green'),
    R: Array(9).fill('red'),
    B: Array(9).fill('blue'),
    D: Array(9).fill('yellow')
};

const moves = ['U', 'R', 'L', 'F', 'B', 'D'];

function compare(c1, c2) {
    for (let i = 0; i < 8; i++) {
        if (c1.cp[i] !== c2.cp[i] || c1.co[i] !== c2.co[i]) return false;
    }
    for (let i = 0; i < 12; i++) {
        if (c1.ep[i] !== c2.ep[i] || c1.eo[i] !== c2.eo[i]) return false;
    }
    return true;
}

function run() {
    console.log("=== MOVE DEFINITION AUDIT ===\n");
    let passed = 0;

    moves.forEach(m => {
        process.stdout.write(`Testing Move [${m}]... `);

        // 1. Get CubieCube by applying move to solved state
        const solvedCubie = new CubieCube();
        const moveCubie = CubieCube.getBasicMoves()[m];
        const expected = solvedCubie.multiply(moveCubie);

        // 2. Get CubieCube by mapping stickers after move
        const movedStickers = solver.applyMove(baseStickers, m);
        const actual = solver.mapToCubie(movedStickers);

        if (compare(expected, actual)) {
            console.log("PASSED ✅");
            passed++;
        } else {
            console.log("FAILED ❌");
            console.log("   Expected CP:", expected.cp.join(','));
            console.log("   Actual   CP:", actual.cp.join(','));
            console.log("   Expected CO:", expected.co.join(','));
            console.log("   Actual   CO:", actual.co.join(','));
            console.log("   Expected EP:", expected.ep.join(','));
            console.log("   Actual   EP:", actual.ep.join(','));
            console.log("   Expected EO:", expected.eo.join(','));
            console.log("   Actual   EO:", actual.eo.join(','));
        }
    });

    console.log(`\nSummary: ${passed}/${moves.length} moves passed.`);
}

run();
