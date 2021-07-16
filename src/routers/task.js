const express = require('express')

const Task = require('../models/task')
const authMiddleware = require('../middleware/auth')

const router = new express.Router()

router.post('/tasks', authMiddleware, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

// GET /tasks?completed=false
// limit skip
// ?completed=true&limit=3&skip=3
// GET /tasks?sortBy=createdAt_asc
// GET /tasks?sortBy=createdAt_desc
router.get('/tasks', authMiddleware, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':') //or _
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        // const tasks = await Task.find({
        //     owner: req.user._id
        // })
        //or..
        // await req.user.populate('tasks').execPopulate()
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        if (!req.user.tasks) {
            return res.status(404).send()
        }
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', authMiddleware, async (req, res) => {
    const { id } = req.params

    try {
        const task = await Task.findOne({
            _id: id,
            owner: req.user._id
        })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', authMiddleware, async (req, res) => {
    const { id } = req.params

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'complete']
    const isValid = updates.every((item) => allowedUpdates.includes(item))

    if (!isValid) {
        return res.status(400).send()
    }

    try {
        const task = await Task.findOne({ _id: id, owner: req.user._id })


        if (!task) {
            return res.status(404).send()
        }

        updates.forEach((update) => task[update] = req.body[update])

        await task.save()

        res.send(task)

    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router