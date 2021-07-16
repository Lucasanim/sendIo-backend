const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Message = require('../models/message')

const chatSocket = async (socket, io) => {

    // Get token
    const token = socket.handshake.headers.authorization
    if(!token){
        return socket.disconnect()
    }
    // Get user
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

    if(!user){
        return socket.disconnect()
    }
    // find rooms
    
    await user.populate({
        path: 'rooms',
    }).execPopulate()
    
    const room = user.rooms.find(room => room._id == socket.handshake.headers.id)
    
    // Filter and find messages of that room
    const match = {}
    const sort = {}

    if(socket.handshake.headers.completed) {
        match.completed = socket.handshake.headers.completed === 'true'
    }

    if(socket.handshake.headers.sortBy){
        const parts = socket.handshake.headers.sortBy.split(':') //or _
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    await room.populate({
        path: 'messages',
        match,
        options: {
            limit: parseInt(socket.handshake.headers.limit),
            skip: parseInt(socket.handshake.headers.skip),
            sort
        }
    }).execPopulate()
    // console.log(room)

    // Filter and find messages
    socket.emit('firstFetch', room.messages)

    socket.join(room.name)

    socket.on('sendMessage', async (msg, callback) => {
        console.log('.')
        const message = new Message({
            text: msg,
            owner: user.username,
            room: room._id
        })
        await message.save()
        console.log(msg)
        io.to(room.name).emit('message', message)
        // callback()
    })

}

module.exports = chatSocket