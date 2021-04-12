const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const fileBasePath = 'uploads/file';

const articleSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        required: true,
        default: Date.now
    },
    description:{
        type: String
    },
    coverImage:{
        type: Buffer,
        required: true
    },
    coverImageType: {
        type: String,
        required: true
    },
    fileName: {
        type: [],
        required: true
    },
    author: {
        type: String,
        required: true,
        default: 'Anonymous'
    },
    poster:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Topic'
    },
    faculty:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Faculty'
    },
    status: {
        type: String,
        enum: ['pending','accepted','refused'],
        default: 'pending',
        required: true
    },
    comment: {
        type: String
    }
})

articleSchema.virtual('coverImagePath').get(function(){
    if(this.coverImage != null && this.coverImageType != null){
        return `data: ${this.coverImageType}; charset=utf-8;base64,${this.coverImage.toString('base64')}`
    }
})

articleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Article', articleSchema)
module.exports.fileBasePath = fileBasePath