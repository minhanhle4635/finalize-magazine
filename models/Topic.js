const mongoose = require('mongoose')
const Article = require('../models/Article')

const topicSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    expiredDate: {
        type: Date,
        required: true
    },
    finalExpiredDate:{
        type: Date,
        required: true
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    }
})

topicSchema.pre('remove', function(next){
    Article.find({topic: this.id}, (err,articles)=>{
        if(err){
            next(err)
        } else if( articles.length > 0){
            next(new Error('This topic has article still'))
        } else {
            next()
        }
    })
})

module.exports = mongoose.model('Topic', topicSchema)