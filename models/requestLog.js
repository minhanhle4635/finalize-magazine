const mongoose = require('mongoose')

const requestLogSchema = mongoose.Schema({
    url: String,
    method: String,
    responseTime: Number,
    day: {
        type: String
    },
    hour: Number
})

module.exports = mongoose.model('RequestLog', requestLogSchema)