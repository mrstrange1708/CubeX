const Cube = require('./cube');

class SolverService {
    // Phase 1: Just test the infrastructure
    solve(stickers) {
        console.log("Received stickers", stickers);

        // TODO: Convert stickers to CubeState
        // const cube = Cube.fromStickers(stickers);

        // For now, create a solved cube and apply some moves to verify logic
        const cube = new Cube();

        // Simulate a solve
        return {
            valid: true,
            solution: ["R", "U", "R'", "U'"],
            moveCount: 4
        };
    }

    // Helper to test move logic independently
    testMoves(moves) {
        let cube = new Cube();
        for (const m of moves) {
            cube = cube.move(m);
        }
        return cube.state;
    }
}

module.exports = SolverService;
