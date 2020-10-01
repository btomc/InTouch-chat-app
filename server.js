const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

// Set static folder
app.use(express.static(path.join(__dirname, 'public')))

const botName = 'InTouch Bot'

// Run when client connects
io.on('connection', socket => {
    socket.on('joinChannel', ({ username, channel }) => {
        const user = userJoin(socket.id, username, channel)

        socket.join(user.channel)

        // Welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to InTouch!'))

        // Broadcast when a user connects
        socket.broadcast.to(user.channel).emit('message', formatMessage(botName, `${user.username} has joined the chat`))
    })

    
    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id)

        io.to(user.channel).emit('message', formatMessage(user.username, msg))
    })

    // Run when client disconnects
    socket.on('disconnect', () => {
        io.emit('message', formatMessage(botName,'A user has left the chat'))
    })
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))


