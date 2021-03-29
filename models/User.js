const mongoose = require('mongoose')
const Article = require('../models/Article')


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        min: 1
    },
    username: {
        type: String,
        required: true,
        min: 1
    },
    password: {
        type: String,
        required: true,
        min: 1,
        select: false
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now()
    },
    role: {
        type: String,
        enum: ['admin', 'coordinator', 'student', 'manager', 'guest', null],
        default: null
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId || String,
        ref: 'Faculty',
        default: null
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId || String,
        ref: 'Topic',
        default: null
    }
})

userSchema.pre('remove', function (next) {
    Article.find({ poster: this.id }, (err, articles) => {
        if (err) {
            next(err)
        } else if (articles.length > 0) {
            next(new Error('This user has article still'))
        } else {
            next()
        }
    })
})

module.exports = mongoose.model('User', userSchema)