const { Server } = require('socket.io')

const io = new Server(4001, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

console.log('Socket.IO server running on port 4001')

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)

  // Relay content changes
  socket.on('content-change', (data) => {
    socket.broadcast.emit('content-change', data)
  })

  // Relay new comments
  socket.on('new-comment', (data) => {
    socket.broadcast.emit('new-comment', data)
  })

  // Relay presence updates
  socket.on('presence-update', (data) => {
    socket.broadcast.emit('presence-update', data)
  })

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id)
  })
}) 