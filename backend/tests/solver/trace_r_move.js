// Detailed tracing of R move to understand orientation calculation

const solver = require('../../src/services/solver/solver.service');

const baseStickers = {
    U: Array(9).fill('white'),
    L: Array(9).fill('orange'),
    F: Array(9).fill('green'),
    R: Array(9).fill('red'),
    B: Array(9).fill('blue'),
    D: Array(9).fill('yellow')
};

console.log("=== TRACING R MOVE ===\n");

// Apply R move
const afterR = solver.applyMove(baseStickers, 'R');

// Check corner URF position (indices: U[8], R[0], F[2])
console.log("After R move, URF position stickers:");
console.log(`  U[8] = ${afterR.U[8]}`);
console.log(`  R[0] = ${afterR.R[0]}`);
console.log(`  F[2] = ${afterR.F[2]}`);

// Build the facelet array based on current cornerDefs definition
// Current: { pos: 'URF', facelets: [['U', 8], ['R', 0], ['F', 2]] }
const urface = [afterR.U[8], afterR.R[0], afterR.F[2]];
console.log(`\nURF facelet array (from current def): [${urface}]`);

// Map to face letters using center colors
const colorToFace = {};
const faces = ['U', 'D', 'L', 'R', 'F', 'B'];
faces.forEach(f => colorToFace[afterR[f][4]] = f);
console.log(`\nColor to Face mapping: `, colorToFace);

const actualFaces = urface.map(c => colorToFace[c]);
console.log(`Actual faces: [${actualFaces}]`);

const udIndex = actualFaces.findIndex(f => f === 'U' || f === 'D');
console.log(`U/D sticker at index: ${udIndex}`);
console.log(`=> Orientation: ${udIndex}`);
console.log(`\nExpected orientation from CubieCube: 1`);
console.log(`Match: ${udIndex === 1 ? '✓' : '✗'}`);

// Try with swapped definition: [U[8], F[2], R[0]]
console.log("\n--- With swapped def [U[8], F[2], R[0]] ---");
const urfaceSwapped = [afterR.U[8], afterR.F[2], afterR.R[0]];
const actualFacesSwapped = urfaceSwapped.map(c => colorToFace[c]);
console.log(`Actual faces: [${actualFacesSwapped}]`);
const udIndexSwapped = actualFacesSwapped.findIndex(f => f === 'U' || f === 'D');
console.log(`U/D sticker at index: ${udIndexSwapped}`);
console.log(`=> Orientation: ${udIndexSwapped}`);
console.log(`Match: ${udIndexSwapped === 1 ? '✓' : '✗'}`);
