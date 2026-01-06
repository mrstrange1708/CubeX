const express = require('express');
const router = express.Router();
const { solveCube } = require('../controllers/solver.controller');

router.post('/solve', solveCube);

module.exports = router;
