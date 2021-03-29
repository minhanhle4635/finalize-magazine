const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Article = require('../models/Article')
// const mongoose = require('mongoose')
const { Login, Logout } = require('../Login')
const path = require('path')
const Profile = require('../models/Profile')
const uploadPath = path.join('public', Article.fileBasePath)
// const avatarPath = path.join('public',Profile.avatarBasePath)



router.get('/login', (req, res) => {
    res.render('login')
})
router.post('/login', Login)

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', async (req, res) => {
    try {
        //checking if username is already used
        const ExistedUser = await User.findOne({ username: req.body.username })
        if (ExistedUser) {
            req.flash('errorMessage', 'Username has been used')
            res.redirect('back')
        }
        //hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        const newUser = new User({
            name: req.body.name,
            username: req.body.username,
            password: hashedPassword
        })

        await newUser.save()
        
        // const defaultMaleImage = path.join(avatarPath, 'male.jpg')
        // const defaultFemaleImage = path.join(avatarPath, 'female.jpg')
        const newProfile = new Profile({
            fullName: req.body.name,
            // avatar: defaultMaleImage,
            user: newUser.id
        })

        await newProfile.save()
        res.redirect('/')
    } catch (err) {
        console.log(err)
        res.redirect('/register')
    }
})

// router.get('/download/:id', async (req, res) => {
//     try {
//         const article = await Article.findById(req.params.id)
//         const pathToFile = path.join(uploadPath, article.fileName);
//         res.download(pathToFile, article.fileName)
//     } catch (error) {
//         console.log(error)
//         res.redirect('/')
//     }
// })

// router.get('/:id', async (req, res) => {
//     try {
//         const article = await Article.findById(req.params.id)
//         res.render('showArticle', {
//             article: article
//         })
//     } catch (error) {
//         console.log(error)
//         res.redirect('/')
//     }
// })

router.get('/', async (req, res) => {
    let article
    try {
        article = await Article.find({
            status: 'accepted'
        })
            .sort({ createdAt: 'desc' })
            .limit(8)
            .exec()
        res.render('index', {
            articles: article
        })
    } catch (error) {
        articles = []
    }
})

module.exports = router