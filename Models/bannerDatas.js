const mongoose = require('mongoose')


const bannerDatas = new mongoose.Schema({

    bannername: {
    type: String,
    required: true
  },
  heading: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },

  
  offerprice: {
    type: Number,
  },
  startingdate: {
    type: Date
  },

  endingdate: {
    type: Date
  }

});

const bannersModel = new mongoose.model('banners', bannerDatas)
module.exports = bannersModel