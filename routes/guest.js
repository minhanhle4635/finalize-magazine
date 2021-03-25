const express = require('express')
const router = express.Router()
const Faculty = require('../models/Faculty')
const Topic = require('../models/Topic')
const {Logout} = require('../Login')
const User = require('../models/User')

router.get('/',async (req,res)=>{
    const user = await User.findById(req.session.userId)
    const faculty = await Faculty.findById(user.faculty)
    const topic = await Topic.find({_id: faculty.id})
    console.log(topic)
    res.render('guest/index',{
        faculty: faculty,
        topics: topic

    })
})

router.get('/logout', Logout)



module.exports = router