import { io } from 'socket.io-client'

let socket = null

// Connect to the same origin; nginx will proxy /socket.io to backend
export function connectSocket(token) {
  if (socket) return socket
  const origin = window?.location?.origin || ''
  socket = io(origin, { path: '/socket.io', auth: { token } })
  return socket
}

export function getSocket() { return socket }
