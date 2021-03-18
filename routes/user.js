const express = require('express')
const router = express.Router()
const { Logout } = require('../Login')
const Article = require('../models/Article')
const Faculty = require('../models/Faculty')
const Topic = require('../models/Topic')
const User = require('../models/User')
const multer = require('multer')
const path = require('path')
const uploadPath = path.join('public', Article.fileBasePath)
const fileMimeTypes = require('../helper/mime-file')
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const fs = require('fs');

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

router.get('/', isUser, (req, res) => {
    res.render('user/index')
})


//get topic index page 
router.get('/topic', isUser, async (req, res) => {
    try {
        const topics = await Topic.find({}).populate('faculty');
        // cần phân loại các topics dựa trên faculty của nó
        // nên tôi tạo ra 1 "hash-map" - aka Object.
        const facultyList = {};

        topics.forEach(topic => {
            // điểm khác biệt của object với array là tôi có
            // thể phân biệt được "faculty" mà tôi check tại topic này
            // đã được phân loại chưa
            if (!facultyList[topic.faculty._id]) {
                // nếu trong trường hợp "chưa được phân loại"
                //
                // thì `facultyList.abc` = undefined;
                //
                // với `abc` là `topic.faculty._id`
                facultyList[topic.faculty._id] = {
                    name: topic.faculty.name,
                    topics: [],
                }
                // nếu chưa có faculty đó thì tôi tạo 1 object
                // chứa: name của faculty + các topic của nó.
                // vd:
                // facultyList = {
                //      abc: {
                //          name: "IT",
                //          topics: []  <- array topics của faculty
                //      }
                // }
                //
            }
            // sau đó tôi chỉ việc push cái thông tin topic
            // vào cái `topics` array bên trên.
            facultyList[topic.faculty._id].topics.push(topic);
        })
        res.render('user/topic', {
            faculties: facultyList
        })
    } catch {
        res.redirect('/user')
    }
})


//show topic
router.get('/topic/:id', isUser, async (req, res) => {
    try {
        const topic = await Topic.findById(req.params.id)
        console.log(req.params.id)
        res.render('user/showTopic', {
            topic: topic
        })
    } catch (error) {
        console.log(error)
        res.redirect('/user/topic')
    }
})

//get page accepted article index
router.get('/article', isUser, async (req, res) => {
    let query = Article.find({status: 'accepted'})
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'))
    }
    try {
        const article = await query.exec()
        res.render('user/article', {
            articles: article,
            searchOptions: req.query
        })
    } catch (err) {
        console.log(err)
        res.redirect('/user')
    }
})

//get page rejected article
router.get('/rejectedarticle', isUser, async(req,res)=>{
    let query = Article.find({ status: 'refused'})
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'))
    }
    try {
        const article = await query.exec()
        res.render('user/rejectedarticle', {
            articles: article,
            searchOptions: req.query
        })
    } catch (err) {
        console.log(err)
        res.redirect('/user')
    }
})

// get page new Article
router.get('/newarticle', isUser, async (req, res) => {
    const topic = await Topic.find({})
    res.render('user/newArticle', {
        topics: topic
    })
})

//create new Article
router.post('/newarticle', isUser, upload.single('file'), async (req, res) => {
    const topic = await Topic.find({ _id: req.body.topic })
    const faculty = topic[0].faculty
    const article = new Article({
        name: req.body.name,
        description: req.body.description,
        author: req.body.author,
        poster: req.session.userId,
        topic: req.body.topic,
        faculty: faculty,
        fileName: req.file.filename
    })
    saveCover(article, req.body.cover)
    try {
        await article.save();
        req.flash({ errorMessage: 'Wait for permision' })
        res.redirect('/user/article')      
    } catch (error) {
        if (article.fileName != null) { removefile(article.fileName) }
        req.flash({ errorMessage: 'Cant create this article' });
        res.redirect('back');
    }
})

//show accepted Article
router.get('/article/:id', isUser, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate("topic").exec()
        res.render('user/showArticle', { article: article })
    } catch (error) {
        console.log(error)
        res.redirect('/user')
    }
})

//show refused Article
router.get('/rejectedarticle/:id', isUser, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id).populate("topic").exec()
        res.render('user/showArticle', { article: article })
    } catch (error) {
        console.log(error)
        res.redirect('/user')
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
        res.redirect('/user/article')
    }
})

//get article edit page
router.get('/article/:id/edit', isUser, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id)
        const topic = await Topic.find({})
        const params = {
            article: article,
            topics: topic
        }
        res.render('user/editArticle', params)
    } catch (error) {
        console.log(error)
        res.redirect(`/user/article/${article._id}`)
    }
})

//edit article
router.put('/article/:id/edit', isUser, upload.single('file'), async (req, res) => {
    let article
    try {
        article = await Article.findById(req.params.id)
        article.name = req.body.name
        article.author = req.body.author
        article.description = req.body.description
        article.topic = req.body.topic
        article.file = req.file.originalname
        saveCover(article, req.body.cover)

        await article.save()
        res.redirect(`/user/article/${article._id}`)
    } catch (error) {
        console.log(error)
        if (article != null) {
            req.flash({errorMessage: 'Cannot edit this topic'})
            res.redirect('back')
        } else {
            res.redirect('/user/article')
        }
    }
})

//delete article
router.delete('/article/:id', isUser, async (req, res) => {
    let article
    try {
        article = await Article.findById(req.params.id)
        console.log(article)
        await article.remove()
        res.redirect('/user/article')
    } catch {
        if (article != null) {
            res.render('user/showArticle', {
                article: article,
            })
            req.flash('errorMessage', 'Could not delete the article')
        } else {
            res.redirect(`/user/article/${article._id}`)
        }
    }
})

//get article from user
router.get('/poster', async(req,res)=>{
    try {
        const article = await Article.find({poster: req.session.userId})
        res.render('user/poster',{
            articles: article
        })
    } catch (error) {
        res.redirect('/user')
    }
})

router.get('/logout', Logout)

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

function isUser(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/')
    }
    else if (req.session.isCoordinator === 'true') {
        return res.redirect('/coordinator')
    }
    else {
        next()
    }
}

module.exports = router