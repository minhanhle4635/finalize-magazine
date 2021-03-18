//Validation
const Joi = require('@hapi/joi')


//Register Validation
const registerValidation = (data) =>{
    const registerSchema = Joi.object({
        name: Joi.string().min(3).required(),
        username: Joi.string().min(4).required(),
        password: Joi.string().min(3).required()
    })
    return registerSchema.validate(data)
}

//login validation
const loginValidation = (data) =>{
    const loginSchema = Joi.object({
        username: Joi.string().min(4).required(),
        password: Joi.string().min(3).required()
    })
    return loginSchema.validate(data)
}

module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation