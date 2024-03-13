
const twilio = require('twilio')
const userModel = require('../Models/signupDatas')
const mailOTP = require('../middlewares/mail-otp')
const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/
const flash = require('connect-flash')
const bcrypt = require('bcrypt')
const productsModel = require('../Models/productDatas')
const categoryModel = require('../Models/categoryDatas')
const cartModel = require('../Models/cartDatas')
const wishlistModel = require('../Models/wishlistDatas')
const profileModel = require('../Models/profileDatas')
const couponsModel = require("../Models/couponDatas")
const { AddressConfigurationInstance } = require('twilio/lib/rest/conversations/v1/addressConfiguration')
const { json } = require('express')
const { TrustProductsEntityAssignmentsInstance } = require('twilio/lib/rest/trusthub/v1/trustProducts/trustProductsEntityAssignments')
const orderDataModel = require('../Models/orderDetails')
const confirmOtp = require('../middlewares/confirmorderotp')

let otp = parseInt(Math.random()*10000)



const oneWeekAgo = new Date();
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken)
const verifysid = process.env.TWILIO_VERIFY_SID;

exports.getOTP = (req, res) => {
    const phone = req.params.num
    res.render('otp', { phone })
}

exports.postOTP = async (req, res) => {

    const data = req.params.num

    const { digit1, digit2, digit3, digit4 } = req.body
    const one = digit1
    const two = digit2
    const three = digit3
    const four = digit4
    const otp = digit1 + digit2 + digit3 + digit4




    try {
        const verification_check = await client.verify.v2.services(verifysid)
            .verificationChecks
            .create({ to: `+91${data}`, code: otp })

        if (verification_check.status === 'approved') {
            await userModel.findOneAndUpdate({ phone: data }, { $set: { user: true } })
            res.redirect('/login')
        } else {
            console.log('failed to verify the OTP');
            res.redirect('/signup')
        }


    } catch (err) {
        console.log('error occured', err);
    }

}


exports.resendOTP = async (req, res) => {
    const phone = (req.params.phone);
    const twiliophone = phone
    console.log(twiliophone);


    try {
        if (phone) {
            const verification = await client.verify.v2.services(verifysid)
                .verifications
                .create({ to: `+91${phone}`, channel: 'sms' })
                .then((verification) => console.log(verification.status))
                .catch((error) => console.log((error.message)))
        }

    } catch (err) {
        console.log(err);
    }

}





exports.getforgotareaotp = (req, res) => {
    const mail = req.params.mail
    const error = ('error')
    res.render('forgot-area-otp', { mail })
}

exports.postforgotareaotp = (req, res) => {
    const mail = req.params.mail
    const { digit1, digit2, digit3, digit4 } = req.body
    const one = digit1
    const two = digit2
    const three = digit3
    const four = digit4
    const result = digit1 + digit2 + digit3 + digit4


    if (result == mailOTP.otp) {
        res.status(200).redirect(`/user/changepassword/${mail}`)
    } else {
        res.send('The mailOTP verification is failed')
    }
}

exports.getChangePassword = (req, res) => {

    const mail = req.params.mail
    res.render('passwordchange', { mail })
}



exports.postChangePassword = async (req, res) => {
    const mail = req.params.mail
    const { newpassword, confirmpassword } = req.body

    const salting = await bcrypt.genSalt(10)
    const hashedpassword = await bcrypt.hash(newpassword, salting)
    if (newpassword === confirmpassword) {
        const email = mail
        const user = await userModel.updateOne({ email }, { $set: { password: hashedpassword } })



    } else {
        console.log('your new password and confrmpassword does not match');

    }
    res.status(200).redirect('/login')
}


exports.getUserHome = async (req, res) => {
    try {
        const categoryDatas = await categoryModel.find().lean();
        const productDatas = await productsModel
            .find({ createdAt: { $gte: oneWeekAgo } })
            .sort({ createdAt: -1 })
            .limit(8);
        res.render('user-home', { productDatas, categoryDatas });
    } catch (err) {
        console.log('Cannot render userhome properly', err);
    }
}

exports.getAllProducts = async (req, res) => {
    try {
        const productDatas = await productsModel.find()
        const categoryDatas = await categoryModel.find()
        const wishlistDatasMain = await wishlistModel.findOne({ userId: req.session.user })
        const wishlistDatas = wishlistDatasMain ? wishlistDatasMain.productId : []
        res.render('allproducts', { productDatas, categoryDatas, wishlistDatas })
    } catch (err) {
        console.log('cannot find productDatas properly', err);
    }
}



exports.getProductView = async (req, res) => {
    const id = req.params.id;

    try {

        const productDatas = await productsModel.findById(id)

        const relatedProducts = await productsModel.find({ category: productDatas.category })

        const cart = await cartModel.findOne({ userId: req.session.user })
const error = req.flash('error', "")
        res.render('productview', { productDatas, relatedProducts, cart, error})

    } catch (err) {
        console.log('cannot render product viewpage properly', err);
    }

}




exports.getCategoryPage = async (req, res) => {
    const category = req.query.element;

    try {
        const productDatas = await productsModel.find({ category: category })
        const categoryDatas = await categoryModel.find()
        res.status(200).render('categories', { productDatas, categoryDatas })

    } catch (err) { console.log('cannot render category page properly', err) }

}

exports.getSubcategoryPage = async (req, res) => {
    const subcategory = req.query.element;

    try {
        const productDatas = await productsModel.find({ subcategory: subcategory })
        const categoryDatas = await categoryModel.find()

        res.status(200).render('subcategories', { productDatas, categoryDatas })

    } catch (err) { console.log('cannot render subcategory page properly', err) }

}

exports.getAddUserprofile = (req, res) => {
    const error = req.flash('error')
    res.render('userprofile', { error })
}

exports.postAddUserprofile = async (req, res) => {
    const { email, phone, housename, housenumber, city, district, state, pincode } = req.body

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!req.session.user) {
        req.flash('error', 'please try to login first')
        res.redirect('/login')

    } else if (!emailRegex.test(email)) {
        req.flash('error', 'invalid email address')
        res.redirect('/user/profile')

    } else if (!email || !phone || !housename || !housenumber || !city || !district || !state || !pincode) {

        req.flash('error', 'All fields are mandatory')
        res.redirect('/user/profile')

    } else {
        try {
            const newSchema = new profileModel({
                email,
                phone,
                housename,
                housenumber,
                city,
                district,
                pincode,
                state,
            })

            await newSchema.save()

            const findingUser = await userModel.findOneAndUpdate({ _id: req.session.user }, { $set: { email: email } })
            res.redirect('/user/home')

        } catch (err) { console.log('error in posting profile datas', err) }
    }

}

exports.getuserPasswordChange = (req, res) => {
    const error = req.flash('error')
    res.render('profilechangepasssword', { error })
}

exports.postuserPasswordChange = async (req, res) => {
    const { oldpassword, newpassword, confirmpassword } = req.body
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/
    if (!req.session.user) {
        req.flash('error', 'please try to login first')
        res.redirect('/login')

    } else if (!oldpassword || !newpassword || !confirmpassword) {
        req.flash('error', 'All fields are mandatory')
        res.redirect('/user/updatepassword')

    } else if (passwordRegex.test(!newpassword)) {
        req.flash('error', 'Invalid password format')
        res.redirect('/user/updatepassword')
    } else if (newpassword != confirmpassword) {
        req.flash('error', 'Both fields are not matching')
        res.redirect('/user/updatepassword')

    } else {
        const existingUser = await userModel.findOne({ _id: req.session.user })

        if (!existingUser) {
            req.flash('error', 'usernot found')
            res.redirect('/login')
        } else {
            const checkPass = await bcrypt.compare(oldpassword, existingUser.password)

            if (checkPass) {
                const salt = await bcrypt.genSalt(10)
                const newhashedPassword = await bcrypt.hash(newpassword, salt)

                await userModel.updateOne({ _id: existingUser._id }, { $set: { password: newhashedPassword } })
            }
        }
    }
}

exports.postBuyNow = async (req, res) => {

    const id = req.query.productid

    const { sizes, color, quantity } = req.body
    if(!sizes || !color) {
        req.flash('error', 'please select the size  and color you needed')
        return res.redirect(`/user/productview/${id}`)

    } else {
        const product = await productsModel.findOne({ _id: req.query.productid })
        const user = req.session.user
        if (!product) {
            console.log('product not found');
    
        } else {
    
            if (!req.session.user) {
                req.flash('error', 'your session has expired')
                return res.redirect('/login')
            } else {
                
                const quantity = req.body.quantity
                const productId = req.query.productid
                const color = req.body?.color || ''
                const size = req.body?.sizes || ''
              return  res.redirect(`/user/checkout?productId=${productId}&quantity=${quantity}&size=${size}&color=${color}`)
            }
        }
    }
   
}


exports.getCheckout = async (req, res) => {

    const userId = req.session.user ? req.session.user : null;
    const useremail = req.session.email
    
    if (!userId || !useremail) {
        req.flash('error', 'your session has expired')
        return res.redirect('/login')
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
            const user = await userModel.findOne({ email: useremail })
            const address = await profileModel.findOne({ email: useremail })
            const addressdetails = await profileModel.find({ email: useremail })

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



exports.getChangeQuantity = async  (req,res)=> {

    const {qty, id, Amount, discount, total}= req.query

    const newAmount = parseInt(Amount*qty)

    const newdiscount = parseInt(Amount*5/100)
    const newtotal = parseInt(Amount-discount)

        const product = await cartModel.findOneAndUpdate({_id:id}, {$set:{quantity:qty}})

            return res.status(200).json({success:true,newAmount,newdiscount,newtotal})
   
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
const order = req.body.orderObj
req.session.order = order
if(!userId){
    req.flash('error', 'Your session has expired')
    res.redirect('/login')
}else {

    if(order.paymentMeth=='COD'){

       confirmOtp(email,otp)
       return res.status(200).json({success:true, COD:true, email})
   
    }

    }
   
}

exports.orderConfirmOTPget = (req,res)=> {
    const email = req.query.email
    res.render('orderconfirmotp',{email})
}

exports.orderConfirmOTPpost = async (req,res)=> {

    const {digit1, digit2, digit3, digit4} = req.body

    const recievedotp = Number(digit1+digit2+digit3+digit4)

    const order = req.session.order

    if(recievedotp==otp) {


        const userId = req.session.user
         
     const existingOrder = await orderDataModel.findOne({userId:userId})

        if(existingOrder) {
            let newOrder = order.orders.forEach(async (order) => {
    const orderPush= await orderDataModel.updateOne({userId:userId}, {$push:{orders:order}})



            }) 
        } else {
            const newOrderObj = {
                userId:userId,
                orders:req.body.orderObj.orders 
            }
                await orderDataModel.create(newOrderObj)
        }  

        res.redirect('/user/home')

    }
}

     



