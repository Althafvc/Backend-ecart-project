const mongoose = require('mongoose')



const schema = {
    username: {
        type: String,
        required: [true, 'name is required']
    },

    phone: {
        type: Number,
        required: [true, 'phone number is required']
    },

    email: {
        type: String,
        required: [true, 'E-mail is required']

    },

    password: {
        type: String,
        required: [true, 'password is required']
    },
    verified: {
        type: Boolean, default: false
    }

}

const adminDataSchema = new mongoose.Schema(schema)
const adminDataModel = new mongoose.model('AdminDatas', adminDataSchema)
module.exports = adminDataModel
