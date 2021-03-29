const mongoose = require('mongoose')
const Article = require('../models/Article')
const Topic = require('../models/Topic')

const facultySchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    description:{
        type: String
    }
})

facultySchema.pre('remove', function(next){
    Article.find({faculty: this.id}, (err,articles)=>{
        if(err){
            next(err)
        } else if( articles.length > 0){
            next(new Error('This faculty has article still'))
        } else {
            next()
        }
    })
})

facultySchema.pre('remove', function(next){
    Topic.find({faculty: this.id}, (err,topics)=>{
        if(err){
            next(err)
        } else if(topics.length > 0){
            next(new Error('This faculty has topic still'))
        } else {
            next()
        }
    })
})

module.exports = mongoose.model('Faculty', facultySchema)