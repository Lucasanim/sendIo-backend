const express = require('express')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/user')
const authMiddleware = require('../middleware/auth')

const router = new express.Router()

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

router.post('', async (req, res) => {
    const user = new User(req.body)
    console.log(req.body)
    try {
        await user.save()

        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// Update user
router.patch('/me', authMiddleware, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['username', 'name', 'password', 'email']

    const isValid = updates.every(item => allowedUpdates.includes(item))

    if (!isValid) {
        return res.status(400).send('Property not found.')
    }

    try {
        const user = req.user
        updates.forEach(update => user[update] = req.body[update])

        await user.save()
        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }

})

// Delete user
router.delete('/me', authMiddleware, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

// Get user's profile
router.get('/me', authMiddleware, async (req, res) => {
    res.send(req.user)
})

// Upload user's avatar
router.post('/me/avatar', authMiddleware, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()

    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

// Delete user's avatar
router.delete('/me/avatar', authMiddleware, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()

    res.send(req.user)
})

// Get user's avatar
router.get('/:username/avatar', async (req, res) => {
    try {
        // const user = await User.findById(req.params.id)
        const user = await User.findOne({username:req.params.username})

        if (!user || !user.avatar) {
            throw new Error()
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

// Login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

// logout current
router.post('/logout', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

// Logout all
router.post('/logoutAll', authMiddleware, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
})

// Search user
router.post('/search', authMiddleware, async (req, res) => {
    try {
        const regex = new RegExp(req.body.username, 'i') // i for case insensitive

        if(!req.body.username){
            return res.send([])
        }

        // Posts.find({ title: { $regex: regex } })
        const user = await User.find({ username: { $regex: regex } })

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})


module.exports = router