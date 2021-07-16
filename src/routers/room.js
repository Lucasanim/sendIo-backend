const express = require('express')

const Room = require('../models/room')
const Message = require('../models/message')
const User = require('../models/user')

const authMiddleware = require('../middleware/auth')

const router = new express.Router()

// Create new room
router.post('', authMiddleware, async (req, res) => {

    const otherUser = await User.findById(req.body.userId)

    const room = new Room({
        // users: [req.user._id, req.body.userId],
        users: [req.user.username, otherUser.username],
        name: `${req.user._id}${req.body.userId}`
    })
    console.log(room)
    try {
        await room.save()
        console.log(room)
        res.status(201).send(room)
    } catch (e) {
        res.status(400).send(e)
    }
})

// Get rooms
router.get('', authMiddleware, async (req, res) => {
    const match = {}
    const sort = {}

    // if(req.query.completed) {
    //     match.completed = req.query.completed === 'true'
    // }

    // if(req.query.sortBy){
    //     const parts = req.query.sortBy.split(':') //or _
    //     sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    // }

    try {
        await req.user.populate({
            path: 'rooms',
            match
        }).execPopulate()
        if(!req.user.rooms){
            return res.status(404).send()
        }
        res.send(req.user.rooms)
    } catch (e) {
        res.status(500).send(e)
    }

})

module.exports = router
