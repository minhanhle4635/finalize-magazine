const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Article = require('../models/Article')
// const mongoose = require('mongoose')
const { Login, Logout } = require('../Login')
const path = require('path')
const uploadPath = path.join('public', Article.fileBasePath)


router.get('/login',(req,res)=>{
    res.render('login')
})
router.post('/login', Login)

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', async (req, res) => {
    //checking if username is already used
    const ExistedUser = await User.findOne({ username: req.body.username })
    if (ExistedUser) {
        req.flash('errorMessage','Username has been used')
        res.redirect('back')
    }
    //hash password
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        password: hashedPassword
    })
    try {
        await newUser.save()
        res.redirect('/')
    } catch (err) {
        console.log(err)
        res.redirect('/register')
    }
})

router.get('/:id', async (req, res) => {
    try {
       const article = await Article.findById(req.params.id)
       res.render('showArticle',{
        article: article
    })
    } catch (error) {
        console.log(error)
        res.redirect('/')
    } 
})

router.get('/download/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
        const pathToFile = path.join(uploadPath, article.fileName);
        res.download(pathToFile, article.fileName)
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

router.get('/', async (req, res) => {
    let article
    try {
       article = await Article.find({
           status: 'accepted'
        })
        .limit(6)
        .exec()
       res.render('index',{
        articles: article
    })
    } catch (error) {
        articles = []
    }
    
})

module.exports = router