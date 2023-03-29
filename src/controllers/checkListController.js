const asyncHandler = require('express-async-handler')
const CheckList = require('../models/KitchenInstallChecklist')
// @desc    Register a new user
// @request POST
// @route   /admin/activateuser
// @acccess Private, protected by admin auth
const getCheckList = asyncHandler( async( req, res ) =>{
    try{
        const checkList = await CheckList.find({})
        if(checkList){
            res.status(200).send(checkList)
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
const updateCheckList = asyncHandler( async( req, res ) =>{
    try{ 
        const { checkList } = req.body
        await CheckList.deleteMany({})
        for (let i = 0; i < checkList.length; i++) {
            const check = checkList[i];
            await CheckList.create({
                title: check.title,
                index: check.index,
                status:check.status,
                note:''
            })
        }
        const result = await CheckList.find({})
        if(result){
            res.status(200).send(result)
        }else{
            res.status(400)
            throw new Error('Invalid query')
        }
    } catch (error) {
        res.status(400)
        throw error
    }
})

module.exports = {
    getCheckList,
    updateCheckList
}