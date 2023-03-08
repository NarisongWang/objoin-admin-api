const mongoose = require('mongoose');

const installationOrderSchema = mongoose.Schema({
    installationOrderNumber:{
        type: String,
        unique: true,
        required: true
    },
    customer:{
        type: String,
        required: true
    },
    shipName:{
        type: String,
        required: true
    },
    shipAddress:{
        type: String,
        required: true
    },
    entryDate:{
        type: Date,
        required: true
    },
    dueDate:{
        type: Date,
        required: true
    },
    workStatus:{
        type: Number,
        default: 0
    },
    deliverers:[
        {
            fullName: {
                type: String,
                required: true
            },
            id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'User'
            }
        }
    ],
    installers:[
        {
            fullName: {
                type: String,
                required: true
            },
            id: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'User'
            }
        }
    ],
    files:[
        {
            type: String,
        }
    ],
    localFilePath:{
        type: String,
        default: ''
    },
    photos1:[
        {
            type: String,
        }
    ],
    deliveryComment:{
        type: String,
        default: ''
    },
    photos2:[
        {
            type: String,
        }
    ],
    checkList:[
        {
            title:{
                type: String,
            },
            index:{
                type: Number,
            },
            status:{
                //0:not selected, 1:YES, 2:NO, 3:N/A 
                type: Number,
            },
            note:{
                type: String,
            }
        }
    ],
    checkItems:[
        {
            type: String,
        }
    ],
    checkListSignature:{
        signed:{
            type: Boolean,
            default:false
        },
        signature:{
            type: String
        },
        time:{
            type: Date,
        }
    },
    timeFrames:[
        {
            workStatus:{
                type: Number,
            },
            time:{
                type: Date,
            }
        }
    ]
},{
    timestamps:true
})

module.exports = mongoose.model('InstallationOrder', installationOrderSchema);