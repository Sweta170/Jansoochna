console.log('[DEBUG INDEX] Starting...');
require('dotenv').config();
console.log('[DEBUG INDEX] Dotenv loaded');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

const { authenticate } = require('./middleware/auth');
const authUploads = require('./middleware/auth_uploads');

// Public access to uploads removed. Now requires token.
app.use('/uploads', authenticate, authUploads, express.static('uploads'));

console.log('[DEBUG INDEX] Middleware set up');

// security middleware (helmet, rate limiter)
try {
  console.log('[DEBUG INDEX] Loading security middleware...');
  require('./middleware/security')(app);
} catch (e) { console.error('security middleware failed to load', e); }

console.log('[DEBUG INDEX] Loading models...');
const models = require('./models');

// register routes BEFORE listen
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const complaintsRoutes = require('./routes/complaints');
app.use('/api/complaints', complaintsRoutes);

const adminRoutes = require(path.join(__dirname, 'routes', 'admin'));
app.use('/api/admin', adminRoutes);

const authorityRoutes = require(path.join(__dirname, 'routes', 'authority.js'));
app.use('/api/authority', authorityRoutes);

const categoryRoutes = require('./routes/categories');
app.use('/api/categories', categoryRoutes);

const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

const gamificationRoutes = require('./routes/gamification');
app.use('/api/gamification', gamificationRoutes);

const officialRoutes = require('./routes/official');
app.use('/api/official', officialRoutes);

const whatsappWebhook = require('./routes/webhooks/whatsapp');
app.use('/api/webhooks/whatsapp', whatsappWebhook);

const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

const sharingRoutes = require('./routes/sharing');
app.use('/share', sharingRoutes);

const chatbotRoutes = require('./routes/chatbot');
app.use('/api/chatbot', chatbotRoutes);

const servicesRoutes = require('./routes/services');
app.use('/api/services', servicesRoutes);

const departmentsRoutes = require('./routes/departments');
app.use('/api/departments', departmentsRoutes);

const emergencyRoutes = require('./routes/emergency');
app.use('/api/emergency', emergencyRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// expose io to routes via app
app.set('io', io);

// Basic Socket.IO connection
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('complaint:subscribe', (complaintId) => {
    socket.join(`complaint:${complaintId}`);
  });

  socket.on('location:update', async ({ lat, lng }) => {
    try {
      const { Complaint } = require('./models');
      const { Op } = require('sequelize');
      const hazards = await Complaint.findAll({
        where: {
          status: 'open',
          priority_score: { [Op.gt]: 10 },
          latitude: { [Op.between]: [lat - 0.005, lat + 0.005] },
          longitude: { [Op.between]: [lng - 0.005, lng + 0.005] }
        }
      });

      if (hazards.length > 0) {
        socket.emit('hazard:nearby', {
          count: hazards.length,
          primary: hazards[0].title,
          coords: { lat: hazards[0].latitude, lng: hazards[0].longitude }
        });
      }
    } catch (e) {
      console.error('Socket location error', e);
    }
  });

  socket.on('disconnect', () => { });
});

const PORT = process.env.PORT || 4000;

// Initialize SLA Escalation Service
try {
  const { initSLAService } = require('./services/SLAService');
  initSLAService(io);
} catch (e) { console.error('SLA Service failed to start', e); }

// Sync DB and start server
async function seedRoles() {
  try {
    const names = ['admin', 'authority', 'citizen', 'official'];
    for (const n of names) {
      await models.Role.findOrCreate({ where: { name: n }, defaults: { name: n } });
    }
    console.log('Default roles ensured');
  } catch (err) { console.error('Failed seeding roles', err); }
}

const isSQLite = models.sequelize.getDialect() === 'sqlite';
models.sequelize.sync({ alter: !isSQLite }).then(async () => {
  await seedRoles();
  server.listen(PORT, '0.0.0.0', () => console.log(`Backend listening on ${PORT}`));
}).catch(err => {
  console.error('Failed to sync DB', err);
  server.listen(PORT, '0.0.0.0', () => console.log(`Backend listening on ${PORT} (DB sync failed)`));
});
