const mongoose = require('mongoose')

const roomSchema = mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message:{
        // type: mongoose.Schema.Types.ObjectId,
        // ref: 'Message'
        type: String
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    receivedAt:{
        type: Date
    },
    status:{
        type: String,
        enum: ['unread','read'],
        default: 'unread'
    }
})

module.exports = mongoose.model('Room', roomSchema)