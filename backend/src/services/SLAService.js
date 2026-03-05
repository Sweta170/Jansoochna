const cron = require('node-cron');
const { Complaint, User, Notification } = require('../models');
const { Op } = require('sequelize');

function initSLAService(io) {
    console.log('[SLA SERVICE] Initializing Cron Job (Daily check at midnight)...');

    // Run every day at midnight (0 0 * * *)
    // For testing/demo, we can run every hour: (0 * * * *)
    cron.schedule('0 0 * * *', async () => {
        console.log('[SLA SERVICE] Checking for expired SLAs...');
        try {
            const now = new Date();
            const expiredComplaints = await Complaint.findAll({
                where: {
                    status: ['open', 'in_progress'],
                    sla_deadline: { [Op.lt]: now }
                },
                include: [{ model: User, as: 'reporter' }]
            });

            console.log(`[SLA SERVICE] Found ${expiredComplaints.length} overdue complaints.`);

            for (const complaint of expiredComplaints) {
                // 1. Log Escalation
                console.log(`[SLA ESCALATION] Complaint #${complaint.id} ("${complaint.title}") has exceeded SLA!`);

                // 2. Notify Admins (For now, we'll create a system notification)
                const admins = await User.findAll({
                    where: { role_id: 1 } // Admin Role
                });

                for (const admin of admins) {
                    await Notification.create({
                        user_id: admin.id,
                        type: 'sla_escalation',
                        message: `URGENT: Complaint #${complaint.id} is overdue!`,
                        complaint_id: complaint.id
                    });

                    // Emit socket event to admin hub
                    if (io) {
                        io.to(`user:${admin.id}`).emit('notification:new', {
                            message: `SLA Escalation for Complaint #${complaint.id}`
                        });
                    }
                }
            }
        } catch (error) {
            console.error('[SLA SERVICE] Error in task:', error);
        }
    });
}

module.exports = { initSLAService };
