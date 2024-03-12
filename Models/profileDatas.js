

const mongoose = require('mongoose')
const schema = {
    email: {
        type: String,
        required: [true, 'email is required']
    },

    phone: {
        type: Number,
        required: [true, 'phone number is required']
    },

    housename: {
        type: String,
        required: [true, 'housename is required']

    },

    housenumber: {
        type: Number,
        required: [true, 'housenumber is required']
    },

    city: {
        type: String,
        required: [true, 'city is required']
    },

    pincode: {
        type: String,
        required: [true, 'city is required']
    },

    district: {
        type: String,
        required: [true, 'district is required']
    },

    state: {
        type: String,
        required: [true, 'state is required']
    },
   
}

const profileSchema = new mongoose.Schema(schema)
const profileModel = new mongoose.model('profiledatas', profileSchema)
module.exports = profileModel
