const mongoose = require('mongoose');

const userType = mongoose.Schema({
    typeId:{
        type: Number,
        unique: true,
        required: true
    },
    typeDesc:{
        type: String,
        unique: true,
        required: true
    },
})

module.exports = mongoose.model('UserType', userType);