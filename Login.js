const User = require('./models/User')
const bcrypt = require('bcrypt')
const { loginValidation } = require('./validation')

const Login = async (req,res,next) => {
    const {username, password} = req.body
    //Login Validation
    const{error} = loginValidation(req.body)
    if(error) return res.status(400).send(error.details[0].message)
    // find user in database
    const user = await User.findOne({username: username}).select(['+password']).exec()
    //if no username is founded
    if(!user) return res.status(400).send('Username is wrong')
    //if the password is wrong
    const validPass = await bcrypt.compare(password, user.password)
    if(!validPass) return res.status(400).send('Invalid Password')
    // khi them "select" trong schema thi can than thieu field password (vi no bi exclude khoi model tra ve luon). de them vao model
    // trong tra ve thi them `select([<ten field>]) vao. su dung `+` (de them) hoac `-` de khong select.
    if(!user){
        return res.redirect('/')
    } else if(user){
        bcrypt.compare(password, user.password, (err, same) =>{
            if(same){
                req.session.userId = user._id;
                req.session.isAdmin = user.role === 'admin';
                req.session.isCoordinator = user.role === 'coordinator';
                req.session.isUser = user.role === 'user';
            
                if(user.role === "admin"){
                    return res.redirect('/admin')
                } else if(user.role === "coordinator") {
                    return res.redirect('/coordinator')
                } else if(user.role === "user"){
                    return res.redirect('/user')
                }
            } else {
                console.log(err)
                return res.redirect('/')
            }
        })
    }  else{
        return res.redirect('/')
    }
}

const Logout = (req,res,next)=>{
    
    if(req.session){
        req.session.destroy((err)=>{
            if(err){
                return next(err)
            } else{
                
                return res.redirect('/')
            }
        })
    }
}

module.exports = { Login, Logout }