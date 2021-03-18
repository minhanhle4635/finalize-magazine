const mongoose = require('mongoose')

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
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    }
})

module.exports = mongoose.model('Topic', topicSchema)