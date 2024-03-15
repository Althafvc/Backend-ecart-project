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
    user: {
        type: Boolean, 
        default: false
    },

    isBlocked: {
        type: String
    }

}
const dataSchema = new mongoose.Schema(schema,{
    timestamps:true
}
)
const dataModel = new mongoose.model('signupDatas', dataSchema)
module.exports = dataModel
