const express = require('express');
const router = express.Router();
const { User, Complaint, Upvote, sequelize } = require('../models');

// Get Leaderboard (Top 10 users with impact breakdown)
router.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                'id', 'name', 'points', 'rank',
                [sequelize.literal('(SELECT COUNT(*) FROM complaints WHERE reporter_id = User.id)'), 'report_count'],
                [sequelize.literal('(SELECT COUNT(*) FROM upvotes WHERE user_id = User.id)'), 'upvote_count'],
                [sequelize.literal('(SELECT COUNT(*) FROM complaints WHERE verified_by LIKE CONCAT("%", User.id, "%"))'), 'verification_count']
            ],
            order: [['points', 'DESC']],
            limit: 10
        });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'server error' });
    }
});

module.exports = router;
