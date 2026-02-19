const { User } = require('../models');

async function addPoints(userId, points) {
    try {
        const user = await User.findByPk(userId);
        if (!user) return;

        user.points = (user.points || 0) + points;

        // Update Rank based on points
        if (user.points < 100) {
            user.rank = 'Citizen';
        } else if (user.points < 500) {
            user.rank = 'Activist';
        } else {
            user.rank = 'Hero';
        }

        await user.save();
        return user;
    } catch (error) {
        console.error(`Error adding points to user ${userId}:`, error);
    }
}

module.exports = { addPoints };
