const express = require('express')
const router = express.Router()
const Faculty = require('../models/Faculty')
const Topic = require('../models/Topic')
const {Logout} = require('../Login')
const User = require('../models/User')
const Article = require('../models/Article')

router.get('/logout', Logout)

router.get('/',async (req,res)=>{
    const user = await User.findById(req.session.userId)
    const faculty = await Faculty.findById(user.faculty)
    const topic = await Topic.find({faculty: faculty.id})
    const articles = await Article.find({faculty: faculty.id})
    console.log(topic)
    res.render('guest/index',{
        faculty: faculty, 
        articles: articles,
        topics: topic

    })
})

router.get('/:id', async (req, res) => {
    try {
       const article = await Article.findById(req.params.id)
       res.render('guest/showArticle',{
        article: article
    })
    } catch (error) {
        console.log(error)
        res.redirect('/')
    } 
})





module.exports = router