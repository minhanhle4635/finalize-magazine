const express = require('express')
const { Logout } = require('../Login')
const Topic = require('../models/Topic')
const router = express.Router()
const User = require('../models/User')
const Faculty = require('../models/Faculty')
const Article = require('../models/Article')

router.get('/', isCoordinator, async (req, res) => {
    const user = await User.findById(req.session.userId).populate("faculty").exec()
    const article = await Article.find({ faculty: user.faculty, status: 'pending' }).limit(5)
    const allArticle = await Article.find({}).countDocuments()
    const totalPendingArticle = await Article.find({ status: 'pending' }).countDocuments()
    const totalRejectedArticle = await Article.find({ status: 'refused' }).countDocuments()
    const totalAcceptedArticle = await Article.find({ status: 'accepted' }).countDocuments()
    res.render('coordinator/index', {
        user: user,
        articles: article,
        totalArticle: allArticle,
        allPendingArticle: totalPendingArticle,
        allAcceptedArticle: totalAcceptedArticle,
        allRejectedArticle: totalRejectedArticle
    })
})

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
            req.flash('errorMessage', 'Cannot edit this topic')
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
router.get('/allArticle', isCoordinator, async (req, res) => {
    const query = Article.find()
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'))
    }

    try {
        const articles = await query.exec()
        res.render('coordinator/allArticle', {
            articles: articles,
            searchOptions: req.query
        })
    } catch (e) {
        console.log(e)
        res.redirect('/coordinator')
    }

})

router.post('/allArticle', isCoordinator, async (req, res) => {
    try {
        const permission = req.body.permission
        const articleId = req.body.articleId
        const article = await Article.findById(articleId)
        if (permission === 'accept') {
            article.status = 'accepted'
            article.comment = req.body.comment
            await article.save()
            req.flash('errorMessage','Updated Successfully')
            res.redirect('back')
        } else if (permission === 'refuse') {
            article.status = 'refused'
            article.comment = req.body.comment
            await article.save()
            req.flash('errorMessage','Updated Successfully')
            res.redirect('back')
        }
    } catch (error) {
        req.flash('errorMessage', 'Cannot permit this article')
        res.redirect('back')
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
        const today = new Date()
        const expiredDate = new Date(article.createdAt + 12096e5)
        if (today.getTime() <= expiredDate.getTime()) {
            if (permission === 'accept') {
                article.status = 'accepted'
                article.comment = req.body.comment
                await article.save()
                res.redirect('back')
            } else if (permission === 'refuse') {
                article.status = 'refused'
                article.comment = req.body.comment
                await article.save()
                res.redirect('back')
            }
        } else {
            article.status = 'refused'
            await article.save()
        }
    } catch (error) {
        req.flash('errorMessage', 'Cannot permit this article')
        res.redirect('back')
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

router.get('/logout', Logout)

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