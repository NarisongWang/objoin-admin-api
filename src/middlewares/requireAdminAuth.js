const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminAuth = asyncHandler(async (req, res, next) =>{
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            //get token from header
            token = req.headers.authorization.split(' ')[1]
            //verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN)
            //get user from token
            req.user = await Admin.findById(decoded.id).select('-password')
            next()
        } catch (err) {
            res.status(401)
            throw new Error('Not authorized')
        }
    }

    if(!token){
        res.status(401)
        throw new Error('Not authorized')
    }
})

module.exports = {adminAuth}