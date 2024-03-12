const mongoose = require('mongoose');


const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    productId: [{
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
        quantity: Number,
        color:String,
        size: String,
        _id: false 
    }]
});
const cartModel = mongoose.model('cart',cartSchema)
module.exports = cartModel