const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        trim: true
    },
    owner: {
        type: String,
        required: true,
        ref: 'User'
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Room'
    }
}, {
    timestamps: true
})

//relasionship with room
// messageSchema.virtual('room', {
//     ref: 'Room',
//     localField: '_id',
//     foreignField: 'messages'
// })

const message = mongoose.model('Message', messageSchema)
module.exports = message