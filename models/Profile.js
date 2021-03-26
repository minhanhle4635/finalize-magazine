const mongoose = require('mongoose')

const avatarBasePath = 'uploads/avatar'

const profileSchema = mongoose.Schema({
    fullName:{
        type: String,
        required: true
    },
    dob:{
        type: Date
    },
    gender:{
        type: String,
        enum: ['male', 'female', 'other'],
        required: true,
        default: 'male'
    },
    avatarImageName: {
        type: String
    },
    email: {
        type: String
    },
    introduction: {
        type: String
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }  
})

module.exports = mongoose.model('Profile', profileSchema)
module.exports.avatarBasePath = avatarBasePath