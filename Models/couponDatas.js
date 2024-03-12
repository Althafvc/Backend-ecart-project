const mongoose = require('mongoose')


const couponDatas = new mongoose.Schema({

    couponcode: {
    type: String,
    required: true
  },
  minimumpurchaseamount: {
    type: Number,
    required: true
  },
  discountprice: {
    type: Number,
    required: true
  },


  availability: {
    type: String,
    required: true
  },

  
  beginningdate: {
    type: Date,
  },
  expirydate: {
    type: Date
  }
 
});

const couponsModel = new mongoose.model('coupons', couponDatas)
module.exports = couponsModel