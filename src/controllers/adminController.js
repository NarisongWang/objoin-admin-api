const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Admin = require('../models/Admin')
const User = require('../models/User')
const UserType = require('../models/UserType')
const InstallationStatus = require('../models/InstallationStatus')
const KitchenInstallChecklist = require('../models/KitchenInstallChecklist')

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
            const checkList = await KitchenInstallChecklist.find({})

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
                    checkList:checkList
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

//Generate token
const generateToken = (id) =>{
    return jwt.sign({ id }, process.env.JWT_SECRET_ADMIN)
}

module.exports = {
    getAllUsers,
    registerAdmin,
    loginAdmin
}