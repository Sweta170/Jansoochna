const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Get Leaderboard (Top 10 users by points)
router.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.findAll({
            order: [['points', 'DESC']],
            limit: 10,
            attributes: ['id', 'name', 'points', 'rank'] // Exclude sensitive info
        });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

module.exports = router;
