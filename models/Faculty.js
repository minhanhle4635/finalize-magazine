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

module.exports = mongoose.model('Faculty', facultySchema)