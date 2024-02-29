const mongoose = require('mongoose');


const wishlistSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId },
    productId: [{
        type:mongoose.Schema.Types.ObjectId,
        ref:'products'
    }]
});
const wishlistModel = mongoose.model('wishlist',wishlistSchema)
module.exports = wishlistModel