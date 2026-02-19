require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// security middleware (helmet, rate limiter)
try { require('./middleware/security')(app); } catch (e) { console.error('security middleware failed to load', e); }

// Models and auth
const models = require('./models');
const authRoutes = require('./routes/auth');
const { authenticate } = require('./middleware/auth');

// Temporary in-memory fallback for complaints when DB not used
const complaints = [];
let nextId = 1;

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);

// Temporary routes removed. Using DB routes below.

// Basic Socket.IO connection
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('complaint:subscribe', (complaintId) => {
    socket.join(`complaint:${complaintId}`);
  });

  socket.on('disconnect', () => { });
});

// expose io to routes via app
app.set('io', io);

// Routes
const complaintsRoutes = require('./routes/complaints');
app.use('/api/complaints', complaintsRoutes);

const PORT = process.env.PORT || 4000;

// Sync DB and start server
async function seedRoles() {
  try {
    const names = ['admin', 'authority', 'citizen'];
    for (const n of names) {
      const [r] = await models.Role.findOrCreate({ where: { name: n }, defaults: { name: n } });
    }
    console.log('Default roles ensured');
  } catch (err) { console.error('Failed seeding roles', err); }
}

models.sequelize.sync({ alter: false }).then(async () => {
  await seedRoles();
  server.listen(PORT, () => console.log(`Backend listening on ${PORT}`));
  // start AI worker in same process (for now)
  try {
    const startAIWorker = require('./ai/worker');
    startAIWorker(io);
  } catch (e) { console.error('Failed to start AI worker', e); }
}).catch(err => {
  console.error('Failed to sync DB', err);
  server.listen(PORT, () => console.log(`Backend listening on ${PORT} (DB sync failed)`));
});

// register authority routes
const authorityRoutes = require('./routes/authority');
app.use('/api/authority', authorityRoutes);

// register admin routes
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// register public category routes
const categoryRoutes = require('./routes/categories');
app.use('/api/categories', categoryRoutes);

// register notification routes
const notificationRoutes = require('./routes/notifications');
app.use('/api/notifications', notificationRoutes);

// register AI routes
const aiRoutes = require('./routes/ai');
app.use('/api/ai', aiRoutes);

// register Gamification routes
const gamificationRoutes = require('./routes/gamification');
app.use('/api/gamification', gamificationRoutes);
