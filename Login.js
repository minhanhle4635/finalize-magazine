const User = require('./models/User')
const bcrypt = require('bcrypt')

const Login = async (req, res, next) => {
    const { username, password } = req.body
    // find user in database
    const user = await User.findOne({ username: username }).select(['+password']).exec()
    //if no username is founded
    if (!user) {
        req.flash('errorMessage', 'username is not found')
        return res.redirect('back')
    }
    //if the password is wrong
    const validPass = await bcrypt.compare(password, user.password)
    if (!validPass) {
        req.flash('errorMessage', 'password is incorrect')
        return res.redirect('back')
    }
    // khi them "select" trong schema thi can than thieu field password (vi no bi exclude khoi model tra ve luon). de them vao model
    // trong tra ve thi them `select([<ten field>]) vao. su dung `+` (de them) hoac `-` de khong select.
    if (!user) {
        return res.redirect('/')
    } else if (user) {
        bcrypt.compare(password, user.password, (err, same) => {
            if (same) {
                req.session.userId = user._id;
                req.session.isAdmin = user.role === 'admin';
                req.session.isManager = user.role === 'manager';
                req.session.isCoordinator = user.role === 'coordinator';
                req.session.isStudent = user.role === 'student';
                req.session.isGuest = user.role === 'guest';

                if (user.role === "admin") {
                    return res.redirect('/admin')
                } else if (user.role === "manager") {
                    return res.redirect('/manager')
                } else if (user.role === "coordinator") {
                    return res.redirect('/coordinator')
                } else if (user.role === "student") {
                    if (user.faculty === null) {
                        req.session.isTemp = true
                        return res.redirect('/student/temp')
                    } else {
                        return res.redirect('/student')
                    }
                } else if (user.role === "guest") {
                    return res.redirect('/guest')
                }
            } else {
                return res.redirect('/')
            }
        })
    } else {
        return res.redirect('/')
    }
}

const Logout = (req, res, next) => {

    if (req.session) {
        req.session.destroy((err) => {
            if (err) {
                return next(err)
            } else {
                return res.redirect('/')
            }
        })
    }
}

module.exports = { Login, Logout }