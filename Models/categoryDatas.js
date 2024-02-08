const mongoose = require('mongoose');
const { array } = require('../middlewares/multer');


const categoryDatas = new mongoose.Schema({
    category: {
      type: String,
      required: true
    },
    subcategory: {
      type: Array,
      required: true
    },
 
    category_img: {
      type: String,
      default: false
    }
   
  });
  
const categoryModel = new mongoose.model('categories', categoryDatas)
module.exports = categoryModel