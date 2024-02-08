const mongoose =  require('mongoose')



const productDatas = new mongoose.Schema({
    productname: {
      type: String,
      required: true
    },
    oldprice: {
      type: Number,
      required: true
    },
    newprice: {
      type: Number,
      required: true
    },

    
    category: {
      type: String,
      required: true
    },

    product_img: {
      type: Array,
      default: false
    },
    size: {
      type: Array,
    },
    color: {
      type: Array
    },
    subcategory: {
      type: String,
      required: true
    },

    stock:{
      type: Number,
      required: true
    },

   
    description: {
      type: String,
      required: true
    }
  });
  
const productsModel = new mongoose.model('products', productDatas)
module.exports = productsModel