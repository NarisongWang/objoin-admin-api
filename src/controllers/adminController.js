const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mailer = require('nodemailer')
const Admin = require('../models/Admin')
const User = require('../models/User')
const UserType = require('../models/UserType')
const InstallationStatus = require('../models/InstallationStatus')

// @desc    Register a new admin
// @request POST
// @route   /admin/register
// @acccess Private and only super admin can access
const registerAdmin = asyncHandler( async( req, res ) =>{
    try {
        const { name, email, password } = req.body;
        if(!name || !email || !password){
            res.status(400)
            throw new Error('Please include all fields')
        }

        //Find if user already exists
        const adminExists = await Admin.findOne({email})
        if(adminExists){
            res.status(400)
            throw new Error('Admin account already exists')
        }

        //Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)

        //Create admin account
        const admin = await Admin.create({
            name,
            email,
            password:hashedPassword
        })

        if(admin){
            res.status(201).json({
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                token: generateToken(admin._id)
            })
        }else{
            res.status(400)
            throw new Error('Invalid user data')
        }
    } catch (error) {
        res.status(400)
        throw error
    }
}) 

// @desc    Login an admin, return admin info and dictionary info
// @request POST
// @route   /admin/login
// @acccess Public
const loginAdmin = asyncHandler( async( req, res ) =>{
    try{
        const { email, password } = req.body;

        const admin = await Admin.findOne({email}) 
        if(admin && (await bcrypt.compare(password, admin.password))){

            const workStatus = await InstallationStatus.find({})
            const userType = await UserType.find({})

            res.status(200).json({
                user:{
                    _id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    token: generateToken(admin._id)
                },
                dictionary:{
                    workStatus:workStatus,
                    userType:userType,
                }
            })
        }else{
            res.status(401)
            throw new Error('Invalid email or password')
        }
    } catch (error) {
        res.status(400)
        throw error
    }
})

// @desc    Get all users
// @request GET
// @route   /admin/getallusers
// @acccess Private
const getAllUsers = asyncHandler( async(req, res) => {
    try{
        const users = await User.find({})
        if(users){
            res.status(200).send(users)
        }else{
            res.status(400)
            throw new Error('Invalid query')
        }
    } catch (error) {
        res.status(400)
        throw error
    }
})

// @desc    Register a new user
// @request POST
// @route   /admin/activateuser
// @acccess Private, protected by admin auth

const activateUser = asyncHandler( async( req, res ) =>{
    try{
        const { fullName, email, userType } = req.body;
        if(!fullName || !email ||!userType){
            res.status(400)
            throw new Error('Please include all fields')
        }

        //Find if user already exists
        const userExists = await User.findOne({email})
        if(userExists){
            res.status(400)
            throw new Error('This account has already been activated')
        }

        //random 6 digit initial password
        const password = Math.floor(100000 + Math.random() * 900000)
        //Generate email validation token
        const email_token = generateToken2(email);
        //Create user account
        const user = await User.create({
            email,
            password,
            fullName,
            isActive: false,
            userType,
            token: email_token
        })

        //send verification email to account
        const trans = mailer.createTransport({
            service: 'gmail',
            auth:{
                user: process.env.EMAIL_ADDR,
                pass: process.env.EMAIL_PASS
            }
        })

        const mailOptions = {
            from: process.env.EMAIL_ADDR,
            to: email,
            subject: 'Activate your account ',
            html: `Please open the below link in browser to activate your user account!<br>
            This link will expair in 3 days,<br>
            ${process.env.APP_URL}/activate/${email_token}/${user.email}`
        }

        trans.sendMail(mailOptions, function(error, info){
            if (error) {
                throw new Error('Failed to send validation email!')
            } 
        })

        if(user){
            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email
            })
        }else{
            res.status(400)
            throw new Error('Invalid user data')
        }
    } catch (error) {
        res.status(400)
        throw error
    }
}) 

// @desc    Resend a new validation email
// @request POST
// @route   /admin/resendemail
// @acccess Private, protected by admin auth

const resendEmail = asyncHandler( async( req, res ) =>{
    try{
        const { email } = req.body;
        if(!email){
            res.status(400)
            throw new Error('Please include email')
        }

        //Find if user already exists
        const userExists = await User.findOne({email})
        if(userExists&&userExists.isActive){
            res.status(400)
            throw new Error('This account is currently active')
        }

        //Generate email validation token
        const email_token = generateToken2(email)

        await User.findByIdAndUpdate(
            userExists._id,
            { token : email_token }, 
            { new : true }
        )
        
        //send verification email to account
        const trans = mailer.createTransport({
            service: 'gmail',
            auth:{
                user: process.env.EMAIL_ADDR,
                pass: process.env.EMAIL_PASS
            }
        })

        const mailOptions = {
            from: process.env.EMAIL_ADDR,
            to: email,
            subject: 'Activate your account ',
            html: `Please open the below link in browser to activate your user account!<br>
            This link will expair in 3 days,<br>
            ${process.env.APP_URL}/activate/${email_token}/${email}`
        }

        trans.sendMail(mailOptions, function(error, info){
            if (error) {
                throw new Error('Failed to send validation email!')
            } 
        })

        res.status(201).json({
            _id: userExists._id,
            fullName: userExists.fullName,
            email: userExists.email
        })

    } catch (error) {
        res.status(400)
        throw error
    }
}) 

//Generate token
const generateToken = (id) =>{
    return jwt.sign({ id }, process.env.JWT_SECRET_ADMIN)
}

//Generate token for email validation
const generateToken2 = (email) =>{
    return jwt.sign({ email }, process.env.JWT_SECRET_EMAIL,{
        expiresIn: '3d',
    })
}

module.exports = {
    getAllUsers,
    registerAdmin,
    loginAdmin,
    activateUser,
    resendEmail
}