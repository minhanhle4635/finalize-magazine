const mongoose = require('mongoose')
const Article = require('../models/Article')


const userSchema = mongoose.Schema({
    name:{
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
    createdAt:{
        type: Date,
        required: true,
        default: Date.now()
    },
    role:{
        type: String,
        enum: ['admin','coordinator','student','manager','guest'],
        default: 'guest'
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

userSchema.pre('remove', function(next){
    const articles = Article.find({poster: this.id})
    if(err){
        next(err)
    } else if( articles.length > 0){
        req.flash('errorMessage', 'This faculty can not be deleted')
        next(new Error('This user has article still'))
    } else {
        next()
    }
})

module.exports = mongoose.model( 'User', userSchema )