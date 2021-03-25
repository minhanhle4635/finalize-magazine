const mongoose = require('mongoose')

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
            req.flash('errorMessage', 'This faculty can not be deleted')
            next(new Error('This faculty has article still'))
        } else {
            next()
        }
    })
})

module.exports = mongoose.model('Faculty', facultySchema)