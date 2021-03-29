const express = require('express')
const router = express.Router()

const Room = require('../models/Room')
const User = require('../models/User')
const {Logout} = require('../Login')


router.get('/logout', Logout)


//Student Account without Faculty
router.get('/', isTemp,async (req, res) => {
    return res.render('noRole/noRole')
})

router.post('/', isTemp,async (req, res) => {

    const sender = await User.findById(req.session.userId);
    const receiver = null; //await User.find({role: 'admin'});
    const message = req.body.message;

    if (!message) {
        req.flash('errorMessage', 'Cant send empty message')
        return res.redirect('back')
    }

    const newRoom = new Room({
        sender: sender,
        receiver: receiver,
        message: message
    })
    try {
        await newRoom.save()
        req.flash('errorMessage', 'Sent Successfully')
        return res.redirect('back')
    } catch (e) {
        console.log(e)
        req.flash('errorMessage', 'Cant be sent')
        return res.redirect('back')
    }
})


function isTemp(req,res,next){
    if(req.session.isTemp === true){
        next()
    } else {
        return res.redirect('/')
    }
}

module.exports = router