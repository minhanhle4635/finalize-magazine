const express = require('express')
const { Logout } = require('../Login')
const Topic = require('../models/Topic')
const router = express.Router()
const User = require('../models/User')
const Faculty = require('../models/Faculty')
const Article = require('../models/Article')
const Profile = require('../models/Profile')
// const messageRoom = require('../models/messageRoom')
const fs = require('fs')
const multer = require('multer')
const path = require('path')
const uploadAvatarPath = path.join('public', Profile.avatarBasePath)
const {imageMimeTypes} = require('../helper/mime-file')

const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadAvatarPath)
    },
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    },
    filename: (req, file, callback) => {
        let extension = '';
        const mimeAvatar = file.mimetype;
        switch (mimeAvatar) {
            case imageMimeTypes[0]:
                extension = '.jpeg';
                break;
            case imageMimeTypes[1]:
                extension = '.png';
                break;
            case imageMimeTypes[2]:
                extension = '.gif';
                break;
        }
        const fileSave = `${file.fieldname}-${Date.now()}${extension}`
        callback(null, fileSave)
    }
})

const uploadAvatar = multer({ storage: avatarStorage })


router.get('/', isCoordinator, async (req, res) => {
    const user = await User.findById(req.session.userId).populate("faculty").exec()
    const article = await Article.find({ faculty: user.faculty, status: 'pending' }).limit(5)
    const allArticle = await Article.find({}).countDocuments()
    const totalPendingArticle = await Article.find({ status: 'pending' }).countDocuments()
    const totalRejectedArticle = await Article.find({ status: 'refused' }).countDocuments()
    const totalAcceptedArticle = await Article.find({ status: 'accepted' }).countDocuments()
    const profile = await Profile.findOne({user: req.session.userId})
    console.log(profile)
    res.render('coordinator/index', {
        profile: profile,
        user: user,
        articles: article,
        totalArticle: allArticle,
        allPendingArticle: totalPendingArticle,
        allAcceptedArticle: totalAcceptedArticle,
        allRejectedArticle: totalRejectedArticle
    })
})

/**
 * Message Section
 */
// router.get('/message', isCoordinator, async(req,res)=>{
//     const rooms = await messageRoom.find().populate(['sender','receiver']).exec()
//     return res.render('coordinator/message',{
//         rooms: rooms
//     })
// })

// router.get('/message/:id', isCoordinator, async (req, res) => {
//     const room = await messageRoom.findById(req.params.id).populate(['sender','receiver']).exec()
//     console.log(room)
//     res.render('coordinator/showMessage', {
//         room: room
//     })
// })

// router.post('/message/:id', isCoordinator, async (req, res) => {
//     const room = await messageRoom.findById(req.params.id)
//     const receiver = await User.findById(req.session.userId)
//     const isDone = req.body.status
//     try{
//     if (isDone === 'done') {
//         room.receiver = receiver.id
//         room.receivedAt = Date.now()
//         await room.save()
//         req.flash('errorMessage', 'Action is done successfully ')
//         return res.redirect('/coordinator/message')
//     }}catch(e){
//         console.log(e)
//         req.flash('errorMessage', 'Can execute this action')
//         return res.redirect('back')
//     }
// })

// router.get('/message/:id/read', isCoordinator, async (req, res) => {
//     const room = await messageRoom.findById(req.params.id).populate(['sender','receiver']).exec()
//     console.log(room)
//     res.render('coordinator/readMessage', {
//         room: room
//     })
// })

/**
 * Topic Section
 */
router.get('/topic', isCoordinator, async (req, res) => {
    let query = Topic.find()
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'))
    }
    try {
        const user = await User.findById(req.session.userId)
        const topic = await Topic.find({ faculty: user.faculty })

        res.render('coordinator/topic', {
            topic: topic,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
        res.redirect('/coordinator')

    }
})

router.get('/topic/new', isCoordinator, (req, res) => {
    res.render('coordinator/newTopic')
})

router.post('/topic/new', isCoordinator, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
        const existedTopic = await Topic.findOne({ name: req.body.name })
        const newTopic = new Topic({
            name: req.body.name,
            expiredDate: req.body.expiredDate,
            finalExpiredDate: req.body.finalExpiredDate,
            description: req.body.description,
            faculty: user.faculty
        })
        if (existedTopic == null) {
            await newTopic.save()
            res.redirect('/coordinator/topic')
        } else {
            req.flash('errorMessage', 'Topic is existed')
            res.redirect('back')
        }
    } catch (error) {
        console.log(error)
        res.redirect('/coordinator')
    }
})

router.get('/topic/:id', isCoordinator, async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id).exec()
        res.render('coordinator/showTopic', {
            topic: topic
        })
    } catch (error) {
        console.log(error)
        res.redirect('/coordinator/topic')
    }
})

router.get('/topic/:id/edit', isCoordinator, async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id)
        const params = {
            topic: topic
        }
        res.render('coordinator/editTopic', params)
    } catch (error) {
        console.log(error)
        res.redirect(`/coordinator/topic/${topic._id}`)
    }
})

router.put('/topic/:id/edit', isCoordinator, async (req, res) => {
    let topic
    try {
        topic = await Topic.findById(req.params.id)
        topic.name = req.body.name
        topic.expiredDate = req.body.expiredDate
        topic.description = req.body.description
        await topic.save()
        res.redirect(`/coordinator/topic/${topic._id}`)
    } catch (error) {
        console.log(error)
        if (topic != null) {
            req.flash( 'errorMessage', 'Cannot edit this topic' )
            res.redirect('back')
        } else {
            res.redirect('/coordinator/topic')
        }
    }
})

router.delete('/topic/:id', isCoordinator, async (req, res) => {
    let topic
    try {
        topic = await Topic.findById(req.params.id)
        await topic.remove()
        res.redirect('/coordinator/topic')
    } catch (error) {
        console.log(error)
        if (topic != null) {
            req.flash('errorMessage', 'Could not delete this topic')
            res.render('coordinator/showTopic', {
                topic: topic
            })
        } else {
            res.redirect(`/topic/${topic._id}`)
        }
    }
})

//show all Article
router.get('/allArticle',isCoordinator,async(req,res)=>{
    const query = Article.find()
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'))
    }

    try{
        const articles = await query.exec()
        res.render('coordinator/allArticle',{
            articles: articles,
            searchOptions: req.query
        })
    }catch(e){
        console.log(e)
        res.redirect('/coordinator')
    }
    
})

//article permission
router.get('/article', isCoordinator, async (req, res) => {
    let query = Article.find()
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'))
    }
    try {
        const user = await User.findById(req.session.userId)
        const article = await Article.find({ faculty: user.faculty, status: 'pending' })

        res.render('coordinator/article', {
            articles: article,
            searchOptions: req.query
        })
    } catch (error) {
        console.log(error)
        res.redirect('/coordinator')
    }
})

router.post('/article', isCoordinator, async (req, res) => {
    try {
        const permission = req.body.permission
        const articleId = req.body.articleId
        const article = await Article.findById(articleId)
        //can't comment after 14 days
        const today = Date.now()
        const expiredDate = article.createdAt + 14
        if(today < expiredDate){
        if (permission === 'accept') {
            article.status = 'accepted'
            article.comment = req.body.comment
            await article.save()
            res.redirect('/coordinator/article')
        } else if (permission === 'refuse') {
            article.status = 'refused'
            article.comment = req.body.comment
            await article.save()
            res.redirect('/coordinator/article')
        }} else{
            article.status = 'refused'
            await article.save()
        }
    } catch (error) {
        req.flash('errorMessage', 'Cannot permit this article')
        res.redirect('/coordinator/article')
    }
})

router.get('/article/:id', isCoordinator, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate('topic').exec()
        res.render('coordinator/showArticle', { article: article })
    } catch (error) {
        console.log(error)
        res.redirect('/coordinator')
    }
})

router.post('/article/:id', isCoordinator, async (req, res) => {
    try {
        article.comment = req.body.comment
        await article.save()
    } catch (error) {
        console.log(error)
        req.flash('errorMessage', 'Cannot add comment to this article')
        res.redirect('back')
    }
})

/**
 * Profile Section
 */

router.get('/profile/:id', isCoordinator, async (req, res) => {
    const user = await User.findById(req.session.userId)
    const profile = await Profile.findOne({ user: user._id })
    res.render('coordinator/showProfile', {
        profile: profile
    })
})

router.get('/profile/:id/edit', isCoordinator, async (req, res) => {
    const profile = await Profile.findById(req.params.id)
    res.render('coordinator/editProfile', {
        profile: profile
    })
})

router.put('/profile/:id/edit', [isCoordinator, uploadAvatar.single('avatar')], async (req, res) => {
    let profile = await Profile.findById(req.params.id)

    const newName = req.body.fullname
    const newGender = req.body.gender
    const newDob = req.body.dob
    const newIntro = req.body.introduction
    const newEmail = req.body.email
    const avatar = req.file;

    if (newName) {
        profile.fullName = newName
    }
    if (newGender) {
        profile.gender = newGender
    } else {
        req.flash('errorMessage', 'Gender must be filled')
        return res.redirect('back')
    }
    if (newDob) {
        profile.dob = newDob
    }
    if (newIntro) {
        profile.introduction = newIntro
    } else {
        profile.introduction = 'I am a coordinator in FPT college'
    }
    if (newEmail) {
        profile.email = newEmail
    } else {
        req.flash('errorMessage', 'You need to add your email')
        return res.redirect('back')
    }
    if (avatar) {
        if (profile.avatarImageName) {
            removeAvatar(profile.avatarImageName)
        }
        //new avatar
        profile.avatarImageName = avatar.filename
    }
    try {
        await profile.save()
        req.flash('errorMessage', 'Updated Successfully')
        return res.redirect(`/coordinator/profile/${profile.id}`)
    } catch (error) {
        console.log(error)
        if (profile.avatarImageName != null) { removeAvatar(profile.avatarImageName) }
        req.flash('errorMessage', 'Can not update this profile')
        return res.redirect('back')
    }
})

router.get('/profile/:id/changepassword', isCoordinator, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
        const profile = await Profile.findOne({ user: user.id })
        res.render('coordinator/changepassword', {
            user: user,
            profile: profile
        })
    } catch (e) {
        console.log(e)
        return res.redirect(`/coordinator/profile/${profile.id}`)
    }

})

router.get('/profile/:id/avatar', isCoordinator,async (req, res) => {
    const defaultPath = path.join(__dirname, '../public/uploads/avatar');
    const profileId = req.params.id;
    if (!profileId) {
        return res.status(404);
    }
    const profile = await Profile.findById(profileId);
    if (!profile) {
        return res.status(404);
    }
    // const userId = req.params.id;
    const defaultName = profile.gender === "male" ? 'male.jpg' : "female.jpg";
    let defaultAvatar = path.join(defaultPath, defaultName);
    if (profile.avatarImageName) {
        defaultAvatar = path.join(defaultPath, profile.avatarImageName);
    }

    if (fs.existsSync(defaultAvatar)) {
        return res.sendFile(defaultAvatar);
    }

    return res.status(404);
});


router.put('/profile/:id/changepassword', isCoordinator, async (req, res) => {
    const password = req.body.password
    const verifyPassword = req.body.verifyPassword

    let hashedPassword
    if (password === verifyPassword) {
        hashedPassword = await bcrypt.hash(password, 10)
    }

    if (password != verifyPassword) {
        req.flash('errorMessage', 'Verify Password is wrong')
        res.redirect('back')
    }

    const user = await User.findById(req.session.userId)
    const profile = await Profile.findById(req.params.id)

    user.password = hashedPassword
    try {
        await user.save()
        req.flash('errorMessage', 'Saved Successfully')
        return res.redirect(`/coordinator/profile/${profile.id}`)
    } catch (e) {
        console.log(e)
        req.flash('errorMessage', 'Can not be updated')
        return res.redirect('back')
    }
})

router.get('/logout', Logout)

function removeAvatar(avatarName) {
    fs.unlink(path.join(uploadAvatarPath, avatarName), err => {
        if (err) console.error(err)
    })
}

function isCoordinator(req, res, next) {
    if (req.session.isCoordinator === true || req.session.isAdmin === true) {
        next()
    } else if (req.session.isUser === true) {
        return res.redirect('/user')
    } else {
        return res.redirect('/')
    }
}

module.exports = router