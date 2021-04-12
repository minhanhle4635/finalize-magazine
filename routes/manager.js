const express = require('express')
const router = express.Router()
const Faculty = require('../models/Faculty')
const Topic = require('../models/Topic')
const Article = require('../models/Article')
const { Logout } = require('../Login')


const fs = require("fs");
const path = require("path");
const AdmZip = require('adm-zip');
const articleFilePath = path.join('public', Article.fileBasePath)

// Faculty Section
router.get('/', isManager, async (req, res) => {
    let query = Faculty.find()
    if (req.query.name != null && req.query.name != '') {
        query = query.regex('name', new RegExp(req.query.name, 'i'))
    }
    try {
        const faculty = await query.exec()
        res.render('manager/index', {
            faculty: faculty,
            searchOptions: req.query
        })
    } catch (err) {
        console.log(err)
        res.redirect('/manager')
    }
})

router.get('/faculty/:id', isManager, async (req, res) => {
    try {
        const faculty = await Faculty.findById(req.params.id)
        const topic = await Topic.find({ faculty: faculty._id })
        res.render('manager/showFaculty', {
            faculty: faculty,
            topic: topic
        })
    } catch (err) {
        console.log(err)
        res.redirect('/manager/faculty')
    }
})

router.get('/faculty/downloadAll/:id',isManager ,async (req, res) => {
    const faculty = await Faculty.findOne({ _id: req.params.id })
    const articles = await Article.find({ faculty: faculty._id })
    if (!articles || articles.length === 0) {
        return res.redirect('back');
    }

    try {
        const zip = new AdmZip();
        articles.forEach(article => {
            const pathToFile = path.join(articleFilePath, article.fileName);
            if (fs.existsSync(pathToFile)) {
                zip.addLocalFile(pathToFile);
            }

            const binaryCover = article.coverImage;
            if (binaryCover) {
                if (article.coverImageType === 'image/png') {
                    const type = '.png';
                    zip.addFile(article.fileName + type, binaryCover, '', 0644 << 16);
                } else if (article.coverImageType === 'image/jpeg') {
                    const type = '.jpeg';
                    zip.addFile(article.fileName + type, binaryCover, '', 0644 << 16);
                } else if (article.coverImageType === 'images/gif') {
                    const type = '.gif';
                    zip.addFile(article.fileName + type, binaryCover, '', 0644 << 16);
                }

            }
        });

        const zipFilename = `${new Date().valueOf()}_All_Articles.zip`;
        // write everything to disk
        const pathTemp = path.join(articleFilePath, zipFilename);
        zip.writeZip(pathTemp, () => {
            return res.download(pathTemp, zipFilename, () => {
                fs.unlinkSync(pathTemp)
            });
        });
    } catch (e) {
        console.log(e);
        return res.redirect('back');
    }
})

router.get('/topic/:id', isManager,async (req, res) => {
    const topic = await Topic.findById(req.params.id)
    const articles = await Article.find({ topic: topic.id })
    res.render('manager/showTopic', {
        topic: topic,
        articles: articles
    })
})

router.get('/article/:id', isManager, async (req, res) => {
    const article = await Article.findById(req.params.id)

    let allFiles = [];
    const files = article.fileName;
    files.map(async(file)=>{
        allFiles.push(file)
    })

    return res.render('manager/showArticle', {
        article: article,
        allFiles: allFiles
    })
})

router.get('/logout', Logout)

function isManager(req, res, next) {
    if (req.session.isManager === true || req.session.isAdmin === true) {
        next()
    } else if (req.session.isUser === true) {
        return res.redirect('/user')
    } else if (req.session.isCoordinator === true) {
        return res.redirect('/coordinator')
    }
    else {
        return res.redirect('/')
    }
}

module.exports = router