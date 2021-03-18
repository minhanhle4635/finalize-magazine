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

//Add new article validation
// const newArticleValidation = (data) =>{
//     const newArticleSchema = Joi.object({
//         name: Joi.string().required(),
//         description: Joi.string(),
//         author: Joi.string().required(),

//     })
//     return newArticleSchema.validate(data)
// }


module.exports.registerValidation = registerValidation
module.exports.loginValidation = loginValidation
// module.exports.newArticleValidation = newArticleValidation