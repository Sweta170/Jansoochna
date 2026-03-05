const express = require('express');
const router = express.Router();
const { Department } = require('../models');

// Public route to get all departments
router.get('/', async (req, res) => {
    try {
        const departments = await Department.findAll({ attributes: ['id', 'name', 'description'] });
        res.json(departments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

module.exports = router;
