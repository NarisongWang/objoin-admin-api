const asyncHandler = require('express-async-handler')
const User = require('../models/User')
const InstallationOrder = require('../models/InstallationOrder')
const { findPdfFiles, uploadPdfFilesToAzure, deleteInstallationOrderDirectoryFromAzure } = require('./fileController')

// @desc    create installation orders from loaded sales orders
// @request POST
// @route   /admin/loadinstallationorders
// @acccess Private & protected by adminAuth
const loadInstallationOrders = asyncHandler(async (req, res) =>{
    try {
        const {installationOrderLoads} = req.body
        for (let i = 0; i < installationOrderLoads.length; i++) {
            const installationOrderLoad = installationOrderLoads[i]
            if(installationOrderLoad.orderDetails){
                const orderDetails = installationOrderLoad.orderDetails.split('|')
                let checkItems = []
                if(orderDetails && orderDetails.length>0){
                    for (let j = 0; j < orderDetails.length; j++) {
                        checkItems.push(orderDetails[j].replaceAll('&amp;', 'and'))
                    }
                }
                installationOrderLoad.checkItems = checkItems
            }
            await InstallationOrder.create(installationOrderLoad)
        }
        res.status(200).json(installationOrderLoads)
    } catch (error) {
        res.status(400)
        throw error
    }
})

// @desc    setup a new installation order, update { workStatus, deliverers, installers, checkList, timeFrames, files, localFilePath }
// @request POST
// @route   /admin/setupinstallationorder
// @acccess Private & protected by adminAuth
const setupInstallationOrder = asyncHandler(async (req, res) =>{
    try {
        const {installationOrderId, update} = req.body
        const updateInstallationOrder = await InstallationOrder.findByIdAndUpdate(
            installationOrderId, 
            update, 
            { new : true }
        )
        //add installation order id to installationOrders field
        await updateUserInstallationOrdersInfo(update, installationOrderId)
        //upload pdf files to Azure blob storage
        await uploadPdfFilesToAzure(updateInstallationOrder.installationOrderNumber, update.localFilePath, update.files)
        if(updateInstallationOrder){
            res.status(200).json(updateInstallationOrder)
        }else{
            res.status(400)
            throw new Error('Invalid data')
        }
    } catch (error) {
        res.status(400)
        throw error
    }
    
})

// @desc    edit an existing installation order, update { deliverers, installers, files, localFilePath }
// @request POST
// @route   /admin/editinstallationorder
// @acccess Private & protected by adminAuth
const editInstallationOrder = asyncHandler(async (req, res) =>{
    try{
        const {installationOrderId, update} = req.body;
        const installationOrder = await InstallationOrder.findById(installationOrderId);
        //delete installation order id from installationOrders field for previous deliverers and installers
        await deleteUserInstallationOrdersInfo(installationOrder)
        const updateInstallationOrder = await InstallationOrder.findByIdAndUpdate(
            installationOrderId, 
            update, 
            { new : true }
        )
        //add installation order id to installationOrders field for new deliverers and installers
        await updateUserInstallationOrdersInfo(update, installationOrderId)
        //upload pdf files to Azure blob storage
        await uploadPdfFilesToAzure(updateInstallationOrder.installationOrderNumber, update.localFilePath, update.files)
        if(updateInstallationOrder){
            res.status(200).json(updateInstallationOrder);
        }else{
            res.status(400)
            throw new Error('Invalid data')
        }
    }catch(error){
        res.status(400)
        throw error
    }
})

// @desc    delete an existing installation order
// @request POST
// @route   /admin/deleteinstallationorder
// @acccess Private & protected by adminAuth
const deleteInstallationOrder = asyncHandler(async (req, res) =>{
    try{
        const {installationOrderId} = req.body
        const installationOrder = await InstallationOrder.findById(installationOrderId)
        //delete installation order id from installationOrders field for deliverers and installers
        await deleteUserInstallationOrdersInfo(installationOrder)

        //delete document from InstallationOrder collection
        const result = await InstallationOrder.findByIdAndDelete(installationOrderId)

        //delete all documents under the installation order number on Azure blob storage
        await deleteInstallationOrderDirectoryFromAzure(installationOrder.installationOrderNumber)

        if(result){
            res.status(200).json(result)
        }else{
            res.status(400)
            throw new Error('Delete Operation Error')
        }
    }catch(error){
        res.status(400)
        throw error
    }
})

// @desc    get all installation orders
// @request GET
// @route   /admin/installationorders
// @acccess Private & protected by adminAuth
const getInstallationOrders = asyncHandler(async (req, res) =>{
    try{
        const installationOrders = await InstallationOrder.find({}).sort({installationOrderNumber:-1})
        if(installationOrders){
            res.status(200).send(installationOrders)
        }else{
            res.status(400)
            throw new Error('Invalid query')
        }
    }catch(error){
        res.status(400)
        throw error
    }
})

// @desc    get one installation order and related pdf files by id
// @request GET
// @route   /admin/installationorders/:id
// @acccess Private & protected by adminAuth
const getInstallationOrder = asyncHandler(async (req, res) =>{
    try{
        const installationOrder = await InstallationOrder.findById(req.params.id)
        const users = await User.find({})
        // find all pdf files under the local file server directory
        let fileDir = `${process.env.LOCAL_FILE_SERVER2+installationOrder.entryDate.toString().substring(11,15)}\\${installationOrder.customer}\\${installationOrder.shipName.trim()} - ${installationOrder.shipAddress}`
        fileDir = fileDir.substring(0,fileDir.length-6) + ' - ' + installationOrder.installationOrderNumber
        const files = await findPdfFiles(fileDir)
        
        if(installationOrder){
            res.status(200).json({installationOrder, users, files})
        }else{
            res.status(404)
            throw new Error('Installation order not found')
        }
    }catch(error){
        console.log(error.message)
        res.status(400)
        throw error
    }
})

// @desc    update an installation order by _id
// @request PUT
// @route   /admin/installationrders/:id
// @route   /installationrders/:id
// @acccess Private & protected by adminAuth or userAuth
const updateInstallationOrder = asyncHandler(async (req, res) =>{
    try{
        const updateInstallationOrder = await InstallationOrder.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new : true }
        )

        if(updateInstallationOrder){
            res.status(200).json(updateInstallationOrder)
        }else{
            res.status(400)
            throw new Error('Update failed, invalid data')
        }
    }catch(error){
        res.status(400)
        throw error
    }
})

// @desc    close installation order and delete order id
// @request POST
// @route   /admin/loadinstallationorders
// @acccess Private & protected by adminAuth
const closeInstallationOrder = asyncHandler(async (req, res) =>{
    try{
        const {installationOrderId} = req.body
        const installationOrder = await InstallationOrder.findByIdAndUpdate(
            installationOrderId, 
            { workStatus: 5 }, 
            { new : true }
        )
        //delete installation order id from installationOrders field for deliverers and installers
        await deleteUserInstallationOrdersInfo(installationOrder)
        res.status(200).json(installationOrder);
    }catch(error){
        res.status(400)
        throw error
    }
})

// @desc    add installtionOrderId to the installationOrders field for delivery and installation users
// @request N/A
// @route   N/A
// @acccess Private function
const updateUserInstallationOrdersInfo = (update, installationOrderId) =>{
    return new Promise(async(resolve, reject) =>{
        try {
            //update installers info with new updated installation order _id
            for (let i = 0; i < update.installers.length; i++) {
                const installer = await User.findOne({ _id:update.installers[i].id })
                await installer.updateOne({$set: {installationOrders:[...installer.installationOrders, installationOrderId]}})
            }
            //update deliverers info with new updated installation order _id
            for (let i = 0; i < update.deliverers.length; i++) {
                const deliverer = await User.findOne({ _id:update.deliverers[i].id })
                await deliverer.updateOne({$set: {installationOrders:[...deliverer.installationOrders, installationOrderId]}})
            }
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

// @desc    delete installtionOrderId from the installationOrders field for delivery and installation users
// @request N/A
// @route   N/A
// @acccess Private function
const deleteUserInstallationOrdersInfo = (installationOrder) =>{
    return new Promise(async(resolve, reject)=>{
        try{
            //delete installation order id from delievery user's installation order field
            for (let i = 0; i < installationOrder.deliverers.length; i++) {
                const userId = installationOrder.deliverers[i].id
                const deliverer = await User.findOne({ _id:userId })
                const installationOrders = deliverer.installationOrders.filter((iOrder)=>{if(!iOrder.equals(installationOrder._id)) return iOrder})
                await deliverer.updateOne({$set: {installationOrders:installationOrders}})
            }
            //delete installation order id from installation user's installation order field
            for (let i = 0; i < installationOrder.installers.length; i++) {
                const userId = installationOrder.installers[i].id
                const installer = await User.findOne({ _id:userId })
                const installationOrders = installer.installationOrders.filter((iOrder)=>{if(!iOrder.equals(installationOrder._id)) return iOrder})
                await installer.updateOne({$set: {installationOrders:installationOrders}})
            }
            resolve()
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = {
    loadInstallationOrders,
    setupInstallationOrder,
    editInstallationOrder,
    deleteInstallationOrder,
    getInstallationOrders,
    getInstallationOrder,
    updateInstallationOrder,
    closeInstallationOrder
}