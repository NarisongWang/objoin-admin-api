const mongoose = require('mongoose');

const installationStatusSchema = mongoose.Schema({
    statusId:{
        type: Number,
        unique: true,
        required: true
    },
    statusDesc:{
        type: String,
        unique: true,
        required: true
    },
})

module.exports = mongoose.model('InstallationStatus', installationStatusSchema);