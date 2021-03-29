const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const User = require('../models/User')
const Article = require('../models/Article')
// const mongoose = require('mongoose')
const { Login, Logout } = require('../Login')
const path = require('path')
const Profile = require('../models/Profile')
const Room = require('../models/Room')
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
        
        const newProfile = new Profile({
            fullName: req.body.name,
            user: newUser.id
        })

        await newProfile.save()
        req.flash('errorMessage','Register Successfully')
        return res.redirect('/login')
    } catch (err) {
        console.log(err)
        return res.redirect('/register')
    }
})



router.get('/', async (req, res) => {
    return res.render('index')
})

module.exports = router