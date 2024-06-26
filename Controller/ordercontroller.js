const productsModel = require('../Models/productDatas')
const categoryModel = require('../Models/categoryDatas')
const cartModel = require('../Models/cartDatas')
const wishlistModel = require('../Models/wishlistDatas')
const profileModel = require('../Models/profileDatas')
const couponsModel = require("../Models/couponDatas")
const userModel = require('../Models/signupDatas')
const bannersModel = require('../Models/bannerDatas')
const confirmOtp = require('../middlewares/confirmorderotp')
const razorpay = require('razorpay')
const {ObjectId} = require('mongodb')

var instance = new razorpay({
    key_id: process.env.mykey_id,
    key_secret: process.env.mykey_secret
  });





const orderDataModel = require('../Models/orderDetails')
const { default: mongoose } = require('mongoose')
let otp = parseInt(Math.random()*10000)




exports.getCheckout = async (req, res) => {

    const userId = req.session.user ? req.session.user : null;
        const useremail = req.session.email

    const user = await userModel.findOne({ email: useremail })
    const address = await profileModel.findOne({ email: useremail })
    const addressdetails = await profileModel.find({ email: useremail })
   
    
        if (!userId || !useremail) {
            req.flash('error', 'your session has expired')
            return res.redirect('/login')
        } else if(addressdetails.length==0){
            req.flash('error', 'Please complete your profile first')
            return res.redirect('/user/profile')
        } else {    
    
            try {
    let singleProduct;
    let singleProductDetails
    let singleArray=[]
                let total = 0;
                let order = 0;
                let Amount=0
                let discount = 0
                let totalPrice = 0
                let carted = false;
                let cartedOnes;
                const cart = await cartModel.findOne({ userId: userId }).populate('productId.id')
                if (req.query.total) {
                    carted=true
                     Amount = parseInt( req.query.Amount)
                     discount = parseInt(Amount* 5 / 100)
                    totalPrice = Math.round(Amount-discount)
                    total = parseInt(req.query.total || null);
                    let order = cart.productId;
                    req.session.preorder = order;
    
                } else {
                     singleProductDetails = req.query
                     singleProduct = await productsModel.findOne({_id:singleProductDetails.productId})
                     let newObj = {id:singleProduct}
                     Amount =singleProduct.oldprice
                     discount = parseInt(Amount* 5 / 100)
                     totalPrice = Math.round(Amount-discount)
                     singleArray.push(newObj)
                    
                    const productId = req.query.productId
                    const size = req.query.size
                    const color = req.query.color
                    const qty = req.query.quantity
                    quantity = qty;
                    const productid = await productsModel.findOne({ _id: productId })
                    order = [{ productid, quantity: qty, size:size, color: color}]
                    total = parseInt(productid.oldprice * qty)
                    req.session.preorder = order;
                    quantity = req.query.quantity;
                }
    
    
                if(carted) {
                     cartedOnes = cart.productId
                }else {
                    cartedOnes= singleArray
                }
                const coupons = await couponsModel.find()
                res.render('checkout', { order, total, user, coupons, address, addressdetails, cartedOnes, Amount, discount, totalPrice, total, carted, singleProduct, singleProductDetails})
    
            } catch (err) { console.log('cannot render checkout properly', err); }
    
        }
    }

exports.setCoupon = async (req,res)=> {
    const {couponcode} = req.query

    try {
        const aptCoupon = await couponsModel.findOne({couponcode:req.query.couponcode})

       if(aptCoupon) {
        const discount = aptCoupon.discountprice

        res.status(200).json({success:true,discount})

       }else {
        res.status(278).json({success:false})

       }
    }catch (err) {console.log('error in finding the coupon'),err}

}


exports.postCheckout = async (req,res)=> {
const userId = req.session.user
const email = req.session.email

 req.body.orderObj.orders.forEach((id)=> {
    id.productId = new ObjectId( id.productId)
})

req.session.order = req.body.orderObj
const order = req.session.order

if(!userId){
    req.flash('error', 'Your session has expired')
    res.redirect('/login')
}else {

    if(order.paymentMeth=='COD'){

       confirmOtp(email,otp)
       return res.status(200).json({success:true, COD:true, email})
   
    }else {
        const totalAmount = parseInt(order.totalAmount)*100
        const key = process.env.mykey_id
        const orderOptions = {
            amount: totalAmount,
            currency: 'INR',
            receipt: 'receipt_order_1',
            payment_capture: 1
        };
        const ordered = await instance.orders.create(orderOptions);
        res.status(200).json({sucess:true, ordered, key, totalAmount})
    }
    } 
}



exports.orderConfirmOTPget = (req, res) => {
    const email = req.query.email
    res.render('orderconfirmotp', { email })
}

exports.orderConfirmOTPpost = async (req, res) => {

    const { digit1, digit2, digit3, digit4 } = req.body

    const recievedotp = Number(digit1 + digit2 + digit3 + digit4)
    
    const order = req.session.order

    if (recievedotp == otp) {

        
        const userId = req.session.user

        const existingOrder = await orderDataModel.findOne({ userId: userId })

        if (existingOrder) {
           order.orders.forEach(async (ordersProduct) => {
                const orderPush = await orderDataModel.updateOne({ userId: userId }, { $push: { orders: ordersProduct } })

            })
        } else {
            const userId=req.session.user
            const order = req.session.order
            const newOrderObj = {
                userId: userId,
                orders: order.orders
            }

            await orderDataModel.create(newOrderObj)
        }
        res.redirect('/user/home')
    }
}

exports.getonlinePayment= async (req,res)=> {

    const userId = req.session.user

    const order = req.session.order

        const existingOrder = await orderDataModel.findOne({ userId: userId })
        if (existingOrder) {
            for (const ordersProduct of order.orders) {
                const orderPush = await orderDataModel.updateOne({ userId: userId }, { $push: { orders: ordersProduct } });
            }
        }else {
            const newOrderObj = {
                userId: userId,
                orders: order.orders
            }
            const neworder = await orderDataModel.create(newOrderObj)

        }
        res.redirect('/user/home')
    }


    exports.getUserOrders = async(req,res)=> {
        const userId = req.session.user

        if(!userId) {
            req.flash('error','Your session has expired')
            res.redirect('/login')
        }else {
            try {
                const orderDatas  =  await orderDataModel.findOne({userId:userId}).populate("orders.productId")

                res.render('userorderslist',{orderDatas})    

            }catch(err) {console.log('cannot render userorders properly', err)}

        }

}

exports.getOrderCancelled = async (req,res)=> {
    const id = req.query.id

    try {
        const aptOrder = await orderDataModel.findOneAndUpdate(
            { "orders._id": id },
            { $set: { "orders.$.status": "cancelled" } }); 
            
            res.status(200).json({success:true})


         }catch(err){console.log('error in cancelling the product',err)}

}



