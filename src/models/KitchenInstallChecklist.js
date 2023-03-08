const mongoose = require('mongoose')

const kitchenInstallChecklist = mongoose.Schema({
    index:{
        type:Number,
        unique:true,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    status:{
        type:Number,
        required:true
    },
    note:{
        type:String
    },
})

module.exports = mongoose.model('KitchenInstallChecklist', kitchenInstallChecklist)