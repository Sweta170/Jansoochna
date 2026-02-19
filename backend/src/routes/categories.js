const express = require('express');
const router = express.Router();
const { Category } = require('../models');

// Public route to get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll({ attributes: ['id', 'name'] });
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

module.exports = router;
