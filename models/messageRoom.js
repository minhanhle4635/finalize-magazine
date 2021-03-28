const mongoose = require('mongoose')

const messageRoomSchema = mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    receiver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    messageLog:{
        type: [String]
    },
    createdAt:{
        type: Date,
        default: Date.now()
    },
    receivedAt:{
        type: Date
    }
})

module.exports = mongoose.model('messageRoom', messageRoomSchema)