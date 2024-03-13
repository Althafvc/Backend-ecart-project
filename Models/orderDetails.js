const mongoose = require('mongoose')

const orderObj = {
    productId:{
        type:String,
        required:true
    },
    size:{
        type:String,
        required:true
    }   ,
    color:{
        type:String,
        required:true
    }   ,
    quantity:{
        type:Number,
        required:true
    },
    deliveryDate:{
        type:Date,
        required:true
    },
    orderDate:{
        type:Date,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    paymentMeth:{
        type:String,
        required:true
    }
  }


const schema = {
    userId: {
        type: mongoose.Types.ObjectId,
        required: [true, 'userId is required']
    },
    orders: [orderObj]

}

const orderDataSchema = new mongoose.Schema(schema)
const orderDataModel = new mongoose.model('orderDatas', orderDataSchema)
module.exports = orderDataModel
