const express = require('express');
const router = express.Router();
const { Complaint, Department, Category, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get high-level city insights
router.get('/performance', async (req, res) => {
    try {
        // 1. Complaint Status Distribution
        const statusDist = await Complaint.findAll({
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['status']
        });

        // 2. Category Distribution
        const categoryDist = await Complaint.findAll({
            include: [{ model: Category, as: 'category', attributes: ['name'] }],
            attributes: [[sequelize.fn('COUNT', sequelize.col('Complaint.id')), 'count']],
            group: ['category_id']
        });

        // 3. Department Performance (Avg Resolution Time in Hours)
        // We calculate (resolved_at - created_at)
        const deptPerformance = await Complaint.findAll({
            where: { status: 'resolved', resolved_at: { [Op.ne]: null } },
            include: [{ model: Department, as: 'department', attributes: ['name'] }],
            attributes: [
                'department_id',
                [sequelize.fn('AVG', sequelize.literal('strftime("%s", resolved_at) - strftime("%s", created_at)')), 'avg_seconds']
            ],
            group: ['department_id']
        });
        // Note: strftime is for SQLite fallback. For MySQL use: TIMESTAMPDIFF(SECOND, created_at, resolved_at)

        // 4. Monthly Trends
        const trends = await Complaint.findAll({
            attributes: [
                [sequelize.fn('strftime', '%Y-%m', sequelize.col('created_at')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['month'],
            order: [[sequelize.col('month'), 'ASC']]
        });

        res.json({
            statusDist,
            categoryDist,
            deptPerformance,
            trends
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// Get public transparency metrics
router.get('/public', async (req, res) => {
    try {
        const isSqlite = sequelize.getDialect() === 'sqlite';

        const totalComplaints = await Complaint.count();
        const resolvedCount = await Complaint.count({ where: { status: 'resolved' } });
        const resolvedPercentage = totalComplaints > 0 ? (resolvedCount / totalComplaints) * 100 : 0;

        // Simplified average rating
        const avgRatingResult = await Complaint.findAll({
            attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
            where: { rating: { [Op.ne]: null } },
            raw: true
        });
        const avgRating = avgRatingResult[0]?.avgRating || 0;

        // Department-wise stats - simplified for SQLite
        const departmentStatsRaw = await Complaint.findAll({
            attributes: [
                'department_id',
                [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
                [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating']
            ],
            group: ['department_id'],
            where: { department_id: { [Op.ne]: null } },
            raw: true
        });

        // Fetch department names separately to avoid join/group issues in SQLite
        const depts = await Department.findAll({ attributes: ['id', 'name'], raw: true });
        const departmentStats = departmentStatsRaw.map(stat => ({
            ...stat,
            department: depts.find(d => d.id === stat.department_id) || { name: 'Unknown' }
        }));

        // Monthly trends
        let dateFunc;
        if (isSqlite) {
            dateFunc = [sequelize.fn('strftime', '%Y-%m', sequelize.col('created_at')), 'month'];
        } else {
            dateFunc = [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'];
        }

        const monthlyTrend = await Complaint.findAll({
            attributes: [
                dateFunc,
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['month'],
            order: [[sequelize.col('month'), 'DESC']],
            limit: 6,
            raw: true
        });

        // Status distribution
        const complaintsByStatus = await Complaint.findAll({
            attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['status'],
            raw: true
        });

        res.json({
            totalComplaints,
            resolvedPercentage: Math.round(resolvedPercentage),
            avgRating: parseFloat(avgRating).toFixed(1),
            departmentStats,
            monthlyTrend,
            complaintsByStatus
        });
    } catch (err) {
        console.error('Public analytics error stack:', err.stack);
        res.status(500).json({ error: 'Failed to fetch public transparency data', details: err.message });
    }
});

module.exports = router;
