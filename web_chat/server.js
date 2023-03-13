// Description: Server side of the web chat app
const express = require('express')
const path = require('path')
const http = require('http')
const socket = require('socket.io')

// connect to the database
const { userConnect, userDisconnect } = require('./users')

// init express
const app = express()
// create server
const server = http.createServer(app)

// set static folder
app.use(express.static(path.join(__dirname, 'public')))

// start server
const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log('Server running on http://localhost:' + PORT))


// one instance of socket.io for the whole app
const io = socket(server)

// when a client connects to the server (socket) we get a socket object back
io.on('connection', socket => {
  // inside this callback we have access to the socket object
  console.log('New WS connection...', socket.id)

  // when a new client connects to the server
  socket.on('user', (userName) => {
    userConnect(socket.id, userName)
    // broadcast = send to everyone except the client that sent the message
    socket.broadcast.emit('userConnection', `${userName} has joined the chat`)
  })

  socket.on('message', message => {
    // emit to all socets including the one that sent the message
    io.sockets.emit('newMessage', message)
  })

  // when user typing a message
  socket.on('typing', (userName) => {
    // broadcast to everyone when a user is typing
    socket.broadcast.emit('typing', userName)
  })

  // when user stops typing a message
  socket.on('stoppedTyping', () => {
    // broadcast to everyone when a user stops typing
    socket.broadcast.emit('stoppedTyping')
  })

  // when user disconects from the server
  socket.on('disconnect', () => {
    // get the user id from the socket id
    const user = userDisconnect(socket.id)
    // broadcast to everyone when a user disconects
    io.sockets.emit('userConnection', `${user.userName} has left the chat`)
  })


})