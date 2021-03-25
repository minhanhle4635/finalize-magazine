if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const session = require('express-session')
const flash = require('express-flash')
const mongoose = require('mongoose')
const passport = require('passport')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const RequestLog = require('./models/requestLog')
const moment = require('moment')

const app = express()

mongoose.connect(
    process.env.DB_CONNECT,
    { useNewUrlParser: true, useUnifiedTopology: true }
)

app.set('view engine', 'ejs')
app.set('views', __dirname + '/views')
app.set('layout', 'layouts/layout')
app.use(expressLayouts)

app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({extended:false}))  
app.use(session({
    secret: 'absolute secret',
    resave: false,
    saveUninitialized: false
}))

app.use(flash())
app.use(methodOverride('_method'))

/**
 * Middleware write log access on all routes.
 */
 app.use((req, res, next) => {
    // check if previously have time-mark
    const accessTime = (req.session || {}).accessTime;
    if (!accessTime) {
        // default accessTime = right now.
        req.session.accessTime = Date.now();
        
        // perform write log at initial access.
        RequestLog.create({
            url: req.path,
            method: req.method,
            day: moment(req.session.accessTime).format("dddd"),
            hour: moment(req.session.accessTime).hour()
        });
        return next();
    }

    const currentTime = Date.now();
    if (currentTime - accessTime >= (30 * 1000)) {
        // if the last time access exceed 30 seconds
        // then mark as the new access, and reset timer.
        RequestLog.create({
            url: req.path,
            method: req.method,
            day: moment(currentTime).format("dddd"),
            hour: moment(currentTime).hour()
        });
        // reset time
        req.session.accessTime = currentTime;
    }
    // proceed
    return next();
});

//Import route
const indexRoute = require('./routes/index')
const adminRoute = require('./routes/admin')
const managerRoute = require('./routes/manager')
const coorRoute = require('./routes/coordinator')
const studentRoute = require('./routes/student')
const guestRoute = require('./routes/guest')

//Route

app.use('/admin', adminRoute)
app.use('/manager',managerRoute)
app.use('/coordinator', coorRoute)
app.use('/student', studentRoute)
app.use('/guest', guestRoute)
app.use('/', indexRoute)

const port = process.env.PORT || 80 
app.listen(port)