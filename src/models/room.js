const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
    users: [{
        type: String,
        ref:'User'
    }],
    name: {
        type: String
    }
},{
    timestamps: true
})

//relasionship with messages
roomSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'room'
})

const room = mongoose.model('Room', roomSchema)
module.exports = room
