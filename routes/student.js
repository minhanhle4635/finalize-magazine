const express = require('express')
const router = express.Router()
const { Logout } = require('../Login')
const Article = require('../models/Article')
const Faculty = require('../models/Faculty')
const Topic = require('../models/Topic')
const User = require('../models/User')
const Profile = require('../models/Profile')
// const Comment = require('../models/Comment')
const multer = require('multer')
const path = require('path')
const uploadPath = path.join('public', Article.fileBasePath)
const uploadAvatarPath = path.join('public', Profile.avatarBasePath)
const fileMimeTypes = require('../helper/mime-file')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const fs = require('fs');

const bcrypt = require('bcrypt')
const Room = require('../models/Room')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath)
    },
    fileFilter: (req, file, callback) => {
        callback(null, fileMimeTypes.includes(file.mimetype))
    },
    filename: (req, file, callback) => {
        let extension = '';
        const mimeFile = file.mimetype;
        switch (mimeFile) {
            case fileMimeTypes[0]:
                extension = '.doc';
                break;
            case fileMimeTypes[1]:
                extension = '.docx';
                break;
            case fileMimeTypes[2]:
                extension = '.pdf';
                break;
        }
        const fileSave = `${file.fieldname}-${Date.now()}${extension}`
        callback(null, fileSave)
    }
})

const upload = multer({ storage: storage })

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

//Student Account without Faculty
router.get('/temp', isStudent, async(req,res)=>{
    res.render('student/temp')
})

router.post('/temp', isStudent, async(req,res)=>{
    
    const sender = await User.findById(req.session.userId);
    const receiver = null;//await User.find({role: 'admin'});
    const message = req.body.message;
    
    if(!message){
        req.flash('errorMessage','Cant send empty message')
        return res.redirect('back')
    }

    const newRoom = new Room({
        sender: sender,
        receiver: receiver,
        message: message
    })
    try{
        await newRoom.save()
        req.flash('errorMessage', 'Sent Successfully')
        return res.redirect('back')
    }catch (e){
        console.log(e)
        req.flash('errorMessage', 'Cant be sent')
        return res.redirect('back')
    }
})

//get topic index page 
router.get('/topic', isStudent, async (req, res) => {
    try {
        const topics = await Topic.find({}).populate('faculty')
        const facultyList = {}
        const nonExpiredFacultyList = {}

        topics.forEach(topic => {
            if (new Date <= topic.expiredDate) {
                if (!nonExpiredFacultyList[topic.faculty._id]) {
                    nonExpiredFacultyList[topic.faculty._id] = {
                        name: topic.faculty.name,
                        topics: [],
                    }
                }
                nonExpiredFacultyList[topic.faculty._id].topics.push(topic);
            }
        })

        topics.forEach(topic => {
            if (!facultyList[topic.faculty._id]) {
                facultyList[topic.faculty._id] = {
                    name: topic.faculty.name,
                    topics: [],
                }
            }
            facultyList[topic.faculty._id].topics.push(topic);
        })

        res.render('student/topic', {
            nonExpiredList: nonExpiredFacultyList,
            faculties: facultyList
        })
    } catch {
        res.redirect('/user')
    }
})


//show topic
router.get('/topic/:id', isStudent, async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id)
        console.log(req.params.id)
        res.render('student/showTopic', {
            topic: topic
        })
    } catch (error) {
        console.log(error)
        res.redirect('/student/topic')
    }
})

//get page article index
router.get('/poster', isStudent, async (req, res) => {
    let query = Article.find({ poster: req.session.userId })
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'))
    }
    try {
        const status = req.body.status
        const article = await query.exec()
        res.render('student/poster', {
            articles: article,
            searchOptions: req.query,
            status: status
        })
    } catch (err) {
        console.log(err)
        res.redirect('/student')
    }
})

router.post('/poster', isStudent, async (req, res) => {
    const status = req.body.status
    try {
        if (status === 'all') {
            let query = Article.find({ poster: req.session.userId }).limit(10)
            if (req.query.name != null && req.query.name != '') {
                query = query.regex('name', new RegExp(req.query.name, 'i'))
            }
            const article = await query.exec()
            return res.render('student/poster', {
                articles: article,
                searchOptions: req.query,
                status: status
            })
        } else if (status === 'pending') {
            let query = Article.find({ status: 'pending', poster: req.session.userId })
            if (req.query.name != null && req.query.name != '') {
                query = query.regex('name', new RegExp(req.query.name, 'i'))
            }
            const article = await query.exec()
            res.render('student/poster', {
                articles: article,
                searchOptions: req.query,
                status: status
            })
        } else if (status === 'accepted') {
            let query = Article.find({ status: 'accepted', poster: req.session.userId })
            if (req.query.name != null && req.query.name != '') {
                query = query.regex('name', new RegExp(req.query.name, 'i'))
            }
            const article = await query.exec()
            res.render('student/poster', {
                articles: article,
                searchOptions: req.query,
                status: status
            })
        } else if (status === 'rejected') {
            let query = Article.find({ status: 'refused', poster: req.session.userId })
            if (req.query.name != null && req.query.name != '') {
                query = query.regex('name', new RegExp(req.query.name, 'i'))
            }
            const article = await query.exec()
            res.render('student/poster', {
                articles: article,
                searchOptions: req.query,
                status: status
            })
        }
    } catch (err) {
        console.log(err)
        res.redirect('/user')
    }
})

router.get('/poster/:id', isStudent, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate("topic").exec()
        res.render('student/showArticle', { article: article })
    } catch (error) {
        console.log(error)
        res.redirect('/user')
    }
})

//get article edit page
router.get('/poster/:id/edit', isStudent, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
        const topic = await Topic.find({})
        const params = {
            article: article,
            topics: topic
        }
        res.render('student/editArticle', params)
    } catch (error) {
        console.log(error)
        res.redirect(`/student/article/${article._id}`)
    }
})

//edit article
router.put('/poster/:id/edit', isStudent, upload.single('file'), async (req, res) => {
    let article
    try {
        article = await Article.findById(req.params.id)

        const topic = await Topic.findById(article.topic)
        const dateNow = Date.now()
        const FED = topic.finalExpiredDate

        const file = req.file

        if (dateNow.getDate() === FED.getDate()) {
            article.name = req.body.name
            article.author = req.body.author
            article.description = req.body.description
            article.topic = req.body.topic
            article.file = file.originalname
            saveCover(article, req.body.cover)

            await article.save()
            res.redirect(`/student/article/${article._id}`)
        } else {
            req.flash('errorMessage', 'Cant edit this article because final deadline has expire')
            res.redirect('back')
        }
    } catch (error) {
        console.log(error)
        if (article != null) {
            req.flash('errorMessage', 'Cannot edit this topic')
            res.redirect('back')
        } else {
            res.redirect('/student/article')
        }
    }
})

//delete article
router.delete('/poster/:id', isStudent, async (req, res) => {
    let article
    try {
        article = await Article.findById(req.params.id)
        console.log(article)
        await article.remove()
        res.redirect('/student/article')
    } catch {
        if (article != null) {
            res.render('student/showArticleIndex', {
                article: article,
            })
            req.flash('errorMessage', 'Could not delete the article')
        } else {
            res.redirect(`/student/article/${article._id}`)
        }
    }
})



// get page new Article
router.get('/newarticle', isStudent, async (req, res) => {
    const user = await User.findById(req.session.userId)
    const faculty = await Faculty.findById(user.faculty)
    const topic = await Topic.find({ faculty: faculty })
    const notExpiredTopic = topic.filter(topic => topic.expiredDate > Date.now())
    res.render('student/newArticle', {
        topics: notExpiredTopic
    })
})

//create new Article
router.post('/newarticle', isStudent, upload.single('file'), async (req, res) => {
    const topic = await Topic.findOne({ _id: req.body.topic })
    const deadline = new Date(topic.expiredDate);
    const faculty = topic.faculty
    //validation
    const isTermAccepted = req.body.isTermAccepted
    const newName = req.body.name
    const description = req.body.description
    const newAuthor = req.body.author
    const file = req.file
    if (!newName) return req.flash('errorMessage', 'Name must be added')
    if (!newAuthor) return req.flash('errorMessage', 'Author must be added')
    if (!description) return req.flash('errorMessage', 'Description must be added')
    if (!file) {
        req.flash('errorMessage', 'File must be added')
        res.redirect('back')
    }

    try {
        if (isTermAccepted) {
            //new article
            const article = new Article({
                name: newName,
                description: description,
                author: newAuthor,
                poster: req.session.userId,
                topic: req.body.topic,
                faculty: faculty,
                fileName: file.filename
            })
            saveCover(article, req.body.cover)
            //compare deadline
            const dateNow = new Date();
            // const deadline = topic.expiredDate
            if (dateNow.getTime() <= deadline.getTime()) {
                await article.save();
                req.flash('errorMessage', 'Wait for permision')
                res.redirect('/student/poster')
            } else {
                if (article.fileName != null) { removefile(article.fileName) }
                req.flash('errorMessage', 'This topic has met its deadline')
                res.redirect('back')
            }
        } else {
            req.flash('errorMessage', 'You have to accept term')
            res.redirect('back')
        }
    } catch (error) {
        if (article.fileName != null) { removefile(article.fileName) }
        req.flash('errorMessage', 'Cant create this article');
        res.redirect('back');
    }
})

//download article
router.get('/article/download/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
        const pathToFile = path.join(uploadPath, article.fileName);
        res.download(pathToFile, article.fileName)
    } catch (error) {
        console.log(error)
        res.redirect('/student/article')
    }
})


//get all article
router.get('/article', async (req, res) => {
    try {
        let query = Article.find({ status: 'accepted' })
        if (req.query.name != null && req.query.name != '') {
            query = query.regex('name', new RegExp(req.query.name, 'i'))
        }
        const article = await query.exec()
        res.render('student/article', {
            articles: article,
            searchOptions: req.query
        })
    } catch (error) {
        res.redirect('/student')
    }
})

//show specific Article
router.get('/article/:id', isStudent, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate("topic").exec()
        res.render('student/showArticleIndex', { article: article })
    } catch (error) {
        console.log(error)
        res.redirect('/student')
    }
})

//PROFILE SECTION

router.get('/profile/:id', isStudent, async (req, res) => {
    const user = await User.findById(req.session.userId)
    const profile = await Profile.findOne({ user: user._id })
    res.render('student/showProfile', {
        profile: profile
    })
})

router.get('/profile/:id/edit', isStudent, async (req, res) => {
    const profile = await Profile.findById(req.params.id)
    res.render('student/editProfile', {
        profile: profile
    })
})

router.put('/profile/:id/edit', [isStudent, uploadAvatar.single('avatar')], async (req, res) => {
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
        profile.introduction = 'I am a student in FPT college'
    }
    if (newEmail) {
        profile.email = newEmail
    } else {
        req.flash('errorMessage', 'You need to add your email')
        return res.redirect('back')
    }
    if (avatar) {
        if(profile.avatarImageName){
            removeAvatar(profile.avatarImageName)
        }
        //new avatar
        profile.avatarImageName = avatar.filename
    }
    try {
        await profile.save()
        req.flash('errorMessage', 'Updated Successfully')
        return res.redirect(`/student/profile/${profile.id}`)
    } catch (error) {
        console.log(error)
        if (profile.avatarImageName != null) { removeAvatar(profile.avatarImageName) }
        req.flash('errorMessage', 'Can not update this profile')
        return res.redirect('back')
    }
})

router.get('/profile/:id/changepassword', isStudent, async (req, res) => {
    try {
        const user = await User.findById(req.session.userId)
        const profile = await Profile.findOne({ user: user.id })
        res.render('student/changepassword', {
            user: user,
            profile: profile
        })
    } catch (e) {
        console.log(e)
        return res.redirect(`/student/profile/${profile.id}`)
    }

})

router.get('/profile/:id/avatar', async (req, res) => {
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


router.put('/profile/:id/changepassword', isStudent, async (req, res) => {
    const password = req.body.password
    const verifyPassword = req.body.verifyPassword

    let hashedPassword
    if(password === verifyPassword){
        hashedPassword = await bcrypt.hash(password, 10)
    }
    
    if(password != verifyPassword){
        req.flash('errorMessage','Verify Password is wrong')
        res.redirect('back')
    }

    const user = await User.findById(req.session.userId)
    const profile = await Profile.findById(req.params.id)

    user.password = hashedPassword
    try {
        await user.save()
        req.flash('errorMessage', 'Saved Successfully')
        return res.redirect(`/student/profile/${profile.id}`)
    } catch (e) {
        console.log(e)
        req.flash('errorMessage', 'Can not be updated')
        return res.redirect('back')
    }
})

router.get('/logout', Logout)

router.get('/', isStudent, async (req, res) => {
    try {
        const articles = await Article.find({ status: 'accepted' })
        const profile = await Profile.findOne({ user: req.session.userId })
        res.render('student/index', {
            articles: articles,
            profile: profile
        })
    } catch (e) {
        console.log(e)
        res.redirect('back')
    }

})

function saveCover(article, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
        article.coverImage = new Buffer.from(cover.data, 'base64')
        article.coverImageType = cover.type
    }
}

function removefile(fileName) {
    fs.unlink(path.join(uploadPath, fileName), err => {
        if (err) console.error(err)
    })
}

function removeAvatar(avatarName) {
    fs.unlink(path.join(uploadAvatarPath, avatarName), err => {
        if (err) console.error(err)
    })
}

function isStudent(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/')
    }
    else if (req.session.isCoordinator === true) {
        return res.redirect('/coordinator')
    } else if (req.session.isAdmin === true) {
        return res.redirect('/admin')
    } else if (req.session.isManager === true) {
        return res.redirect('/manager')
    } else if (req.session.isGuest === true) {
        return res.redirect('/guest')
    }
    else {
        next()
    }
}

module.exports = router