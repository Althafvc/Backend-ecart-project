const productsModel = require('../Models/productDatas')
const CategoryModel = require('../Models/categoryDatas')
const categoryModel = require('../Models/categoryDatas')
const userModel = require('../Models/signupDatas')
const flash = require('connect-flash')
const cartModel = require('../Models/cartDatas')
const { default: mongoose } = require('mongoose')

exports.getAddToCart = async (req,res)=> {
    const product = new mongoose.Types.ObjectId(req.query.id)
    const userId = new mongoose.Types.ObjectId(req.session.user)
    try {

    if(!req.session.user) {
        return res.status(278).json({success:false})
    }  else {
        
        const existingUser = await cartModel.findOne({userId:userId})
        const cartObj ={
            id:product,
            quantity: 1
        }

        if(existingUser){
            const exist = await cartModel.findOne({userId:userId,"productId.id":product})
            if(exist){
                return res.status(200).json({success: true, exist: true})
            }else{
                await cartModel.updateOne({userId}, {$push :{productId:cartObj}})
                return res.status(200).json({success: true, added: true})
            }
            
        }else{
    
            const newSchema = new cartModel({
                userId: userId,
                productId:[cartObj]
            })
            await newSchema.save()
            return res.status(200).json({success:true, newCart: true})
        }
    }

}catch(err) {console.log('cannot render cart page properly',err)}
}


    
exports.getCartPage = async (req,res)=> {

           
    if(!req.session.user){
        req.flash('error','please try to login first')
        return res.redirect('/login')
    }
    const cartDatas = await cartModel.findOne({userId:req.session.user}).populate("productId.id")

    const cartProducts = cartDatas ? cartDatas.productId : []
    
    const cartTotal = cartProducts.reduce((acc,currentvalue)=> {
        
      return acc += parseInt(currentvalue.id.oldprice*currentvalue.quantity)
    },0);       
const cartCount = cartDatas.productId.length



const gst = Math.round(cartTotal*1/100)

const discount = Math.round(cartTotal*5/100)

const totalAmount = Math.round((cartTotal+gst)-discount)

    res.render('cart',{cartDatas, cartTotal,cartCount,gst,totalAmount})      
}

exports.deleteFromCart = async (req,res)=> {
    const id =(req.query.id)
    const session_id = req.session.user

    if(!session_id) {
           res.redirect('/login')
    } else {

        try {

            const deleteProduct = await cartModel.updateOne(
                {userId:session_id}, 
                {$pull:{productId:{id:id}}})

            if (deleteProduct) {
                return res.status(200).json({ success: true })
                
            } else {
                return res.status(289).json({ success: false })
    
            }
        } catch (err) { console.log('error occured while deleting the cartedproduct ',err) }

    }
}


exports.addQuantity = async (req, res) => {
    const  id= req.query.id;
    const quantity = req.query.quantity;

    const userId = req.session.user;


    const cartObj = {
        id: id,
        quantity: quantity,
    };
    console.log(id,quantity);
   
    const cartDocument = await cartModel.findOne({ userId: userId });

    if (cartDocument) {
        const update = await cartModel.updateOne(
            { userId: userId, 'productId.id':id},
            {'productId.$.quantity':quantity} 
        );

    } else {
        console.log('Cart not found for the user');
    }

    res.redirect('/user/cart');
};
