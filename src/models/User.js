const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    installationOrders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'InstallationOrder'
        }
    ],
    userType:{
        type: Number,
        required: true
    },
    isActive:{
        type: Boolean,
        default: false
    },
    token:{
        type: String
    }
});

module.exports = mongoose.model('User', userSchema);