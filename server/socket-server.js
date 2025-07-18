const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

// In-memory storage (in production, use Redis or database)
const rooms = new Map()
const userSessions = new Map()

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
})

// Middleware for authentication and validation
io.use((socket, next) => {
  const { userId, userName, userEmail } = socket.handshake.auth
  
  if (!userId || !userName || !userEmail) {
    return next(new Error('Authentication required'))
  }
  
  // Store user info in socket
  socket.userId = userId
  socket.userName = userName
  socket.userEmail = userEmail
  
  next()
})

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userName} (${socket.userId})`)
  
  // Join room for specific content
  socket.on('join-room', (data) => {
    const { contentId, contentType } = data
    
    if (!contentId || !contentType) {
      socket.emit('error', { message: 'Invalid room data' })
      return
    }
    
    const roomId = `${contentType}-${contentId}`
    
    // Leave previous room if any
    if (socket.roomId) {
      socket.leave(socket.roomId)
      removeUserFromRoom(socket.roomId, socket.userId)
    }
    
    // Join new room
    socket.join(roomId)
    socket.roomId = roomId
    
    // Add user to room presence
    addUserToRoom(roomId, {
      id: socket.userId,
      name: socket.userName,
      email: socket.userEmail,
      isOnline: true,
      lastSeen: new Date(),
      currentSection: 'introduction'
    })
    
    // Send current room state to user
    const roomState = getRoomState(roomId)
    socket.emit('room-state', roomState)
    
    // Notify others in room
    socket.to(roomId).emit('user-joined', {
      id: socket.userId,
      name: socket.userName,
      email: socket.userEmail,
      isOnline: true,
      lastSeen: new Date()
    })
    
    console.log(`User ${socket.userName} joined room: ${roomId}`)
  })
  
  // Handle content changes
  socket.on('content-change', (data) => {
    const { content, section } = data
    
    if (!socket.roomId) {
      socket.emit('error', { message: 'Not in a room' })
      return
    }
    
    // Validate content
    if (typeof content !== 'string' || content.length > 50000) {
      socket.emit('error', { message: 'Invalid content' })
      return
    }
    
    // Update room content
    updateRoomContent(socket.roomId, content)
    
    // Update user's current section
    updateUserSection(socket.roomId, socket.userId, section || 'body')
    
    // Broadcast to others in room
    socket.to(socket.roomId).emit('content-change', { 
      content,
      updatedBy: socket.userId,
      timestamp: new Date()
    })
  })
  
  // Handle new comments
  socket.on('new-comment', (comment) => {
    if (!socket.roomId) {
      socket.emit('error', { message: 'Not in a room' })
      return
    }
    
    // Validate comment
    if (!comment.content || comment.content.length > 1000) {
      socket.emit('error', { message: 'Invalid comment' })
      return
    }
    
    // Add comment to room
    const newComment = {
      ...comment,
      id: comment.id || generateId(),
      author: {
        id: socket.userId,
        name: socket.userName,
        email: socket.userEmail
      },
      timestamp: new Date()
    }
    
    addCommentToRoom(socket.roomId, newComment)
    
    // Broadcast to all in room
    io.to(socket.roomId).emit('new-comment', newComment)
  })
  
  // Handle comment resolution
  socket.on('resolve-comment', (data) => {
    const { commentId } = data
    
    if (!socket.roomId) {
      socket.emit('error', { message: 'Not in a room' })
      return
    }
    
    const success = resolveCommentInRoom(socket.roomId, commentId)
    
    if (success) {
      io.to(socket.roomId).emit('comment-resolved', { commentId })
    } else {
      socket.emit('error', { message: 'Comment not found' })
    }
  })
  
  // Handle user activity (typing, cursor position, etc.)
  socket.on('user-activity', (data) => {
    if (!socket.roomId) return
    
    const { section, activity } = data
    
    updateUserActivity(socket.roomId, socket.userId, {
      section,
      activity,
      timestamp: new Date()
    })
    
    // Broadcast to others (throttled)
    socket.to(socket.roomId).emit('user-activity', {
      userId: socket.userId,
      userName: socket.userName,
      section,
      activity,
      timestamp: new Date()
    })
  })
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userName} (${socket.userId})`)
    
    if (socket.roomId) {
      // Mark user as offline but keep in room
      updateUserPresence(socket.roomId, socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      })
      
      // Notify others
      socket.to(socket.roomId).emit('user-left', {
        id: socket.userId,
        name: socket.userName,
        lastSeen: new Date()
      })
    }
    
    // Clean up user session
    userSessions.delete(socket.userId)
  })
})

// Room management functions
function addUserToRoom(roomId, user) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      content: '',
      comments: [],
      users: new Map(),
      createdAt: new Date(),
      lastActivity: new Date()
    })
  }
  
  const room = rooms.get(roomId)
  room.users.set(user.id, user)
  room.lastActivity = new Date()
}

function removeUserFromRoom(roomId, userId) {
  const room = rooms.get(roomId)
  if (room) {
    room.users.delete(userId)
    room.lastActivity = new Date()
    
    // Clean up empty rooms after some time
    if (room.users.size === 0) {
      setTimeout(() => {
        const currentRoom = rooms.get(roomId)
        if (currentRoom && currentRoom.users.size === 0) {
          rooms.delete(roomId)
          console.log(`Cleaned up empty room: ${roomId}`)
        }
      }, 300000) // 5 minutes
    }
  }
}

function getRoomState(roomId) {
  const room = rooms.get(roomId)
  if (!room) return null
  
  return {
    content: room.content,
    comments: Array.from(room.comments.values()),
    users: Array.from(room.users.values()),
    lastActivity: room.lastActivity
  }
}

function updateRoomContent(roomId, content) {
  const room = rooms.get(roomId)
  if (room) {
    room.content = content
    room.lastActivity = new Date()
  }
}

function updateUserSection(roomId, userId, section) {
  const room = rooms.get(roomId)
  if (room && room.users.has(userId)) {
    const user = room.users.get(userId)
    user.currentSection = section
    user.lastSeen = new Date()
  }
}

function updateUserActivity(roomId, userId, activity) {
  const room = rooms.get(roomId)
  if (room && room.users.has(userId)) {
    const user = room.users.get(userId)
    user.currentSection = activity.section
    user.lastSeen = new Date()
  }
}

function updateUserPresence(roomId, userId, presence) {
  const room = rooms.get(roomId)
  if (room && room.users.has(userId)) {
    const user = room.users.get(userId)
    Object.assign(user, presence)
  }
}

function addCommentToRoom(roomId, comment) {
  const room = rooms.get(roomId)
  if (room) {
    room.comments.push(comment)
    room.lastActivity = new Date()
  }
}

function resolveCommentInRoom(roomId, commentId) {
  const room = rooms.get(roomId)
  if (room) {
    const comment = room.comments.find(c => c.id === commentId)
    if (comment) {
      comment.resolved = true
      room.lastActivity = new Date()
      return true
    }
  }
  return false
}

function generateId() {
  return Math.random().toString(36).substr(2, 9)
}

// Health check endpoint
httpServer.on('request', (req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      status: 'healthy',
      rooms: rooms.size,
      connections: io.engine.clientsCount,
      timestamp: new Date().toISOString()
    }))
  } else {
    res.writeHead(404)
    res.end()
  }
})

const PORT = process.env.SOCKET_PORT || 4001

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`)
  console.log(`📊 Health check available at http://localhost:${PORT}/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down Socket.IO server...')
  io.close(() => {
    console.log('✅ Socket.IO server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('🛑 Shutting down Socket.IO server...')
  io.close(() => {
    console.log('✅ Socket.IO server closed')
    process.exit(0)
  })
}) 