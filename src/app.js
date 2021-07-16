const express = require('express')
const http = require('http')
const socketio = require('socket.io')
require('./db/mongoose')

const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();
// increase the limit
myEmitter.setMaxListeners(15)

const userRouter = require('./routers/user')
const roomRouter = require('./routers/room')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const rootSocket = require('./socket/rootSocket')(io);

app.use(express.json())

app.use('/users', userRouter)
app.use('/rooms', roomRouter)

module.exports = {
    app : server
}