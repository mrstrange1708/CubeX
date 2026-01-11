const express = require('express');
const router = express.Router();
const { solveCube } = require('../controllers/solver.controller');

router.post('/solve', solveCube);
router.get('/scramble', (req, res) => {
    const solverService = require('../services/solver/solver.service');
    const result = solverService.scramble();
    res.json(result);
});

module.exports = router;
