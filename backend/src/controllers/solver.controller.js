const solverService = require('../services/solver/solver.service');

// Service is already instantiated on export


const solveCube = (req, res) => {
    try {
        const stickers = req.body;
        // Basic validation that we have the faces
        if (!stickers || !stickers.U || !stickers.D || !stickers.F || !stickers.B || !stickers.L || !stickers.R) {
            res.status(400).json({ valid: false, error: "Missing face data" });
            return;
        }

        const result = solverService.solve(stickers);
        res.json(result);
    } catch (error) {
        console.error("Solver error:", error);
        res.status(500).json({ valid: false, error: "Internal server error" });
    }
};

module.exports = { solveCube };
