const mongoose = require('mongoose')
const Faculty = require('./Faculty')


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
        enum: ['admin','coordinator','user'],
        default: 'user'
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

module.exports = mongoose.model( 'User', userSchema )