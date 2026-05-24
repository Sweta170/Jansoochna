require('dotenv').config()
const { validateEnv } = require('./config/validateEnv')
validateEnv()

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const connectDB = require('./config/db')
const rateLimit = require('express-rate-limit')

// Start the background Bull worker
require('./workers/petitionWorker')

const app = express()
const server = http.createServer(app)

// Connect to MongoDB
connectDB()

const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8081', process.env.CLIENT_URL].filter(Boolean);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP for development and maps integrations
}))

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Attach io to req
app.use((req, res, next) => {
  req.io = io
  next()
})

// Debug middleware
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.path}`)
    next()
  })
}

// Rate limiting (basic application to auth to prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: 'Too many requests, please try again later.'
})

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'))
app.use('/api/user',       require('./routes/user'))
app.use('/api/posts',      require('./routes/posts'))
app.use('/api/issues',     require('./routes/issues'))
app.use('/api/form-guide', require('./routes/formGuide'))
app.use('/api/neta',       require('./routes/neta'))
app.use('/api/janbot',     require('./routes/janbot'))
app.use('/api/petition',   require('./routes/petition'))

// Admin Routes
app.use('/api/admin/auth', authLimiter, require('./routes/adminAuth'))
app.use('/api/admin/stats', require('./routes/stats'))
app.use('/api/admin',      require('./routes/admin'))

// Basic status route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', env: process.env.NODE_ENV })
})

// Socket.io connection logic
io.on('connection', (socket) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔌 Client connected: ${socket.id}`)
  }

  socket.on('join-pincode', (pincode) => {
    socket.join(pincode)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🏠 Socket ${socket.id} joined pincode room: ${pincode}`)
    }
  })

  socket.on('leave-pincode', (pincode) => {
    socket.leave(pincode)
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚪 Socket ${socket.id} left pincode room: ${pincode}`)
    }
  })

  socket.on('disconnect', () => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔌 Client disconnected: ${socket.id}`)
    }
  })
})

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack)
  res.status(500).json({ error: 'Server details error. Kuch galat ho gaya!' })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 JanSoochna server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
})

