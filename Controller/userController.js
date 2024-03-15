
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
const bannersModel = require('../Models/bannerDatas')



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
        const bannerDatas = await bannersModel.find()
        const categoryDatas = await categoryModel.find().lean();
        const productDatas = await productsModel
            .find({ createdAt: { $gte: oneWeekAgo } })
            .sort({ createdAt: -1 })
            .limit(8);
        res.render('user-home', { productDatas, categoryDatas, bannerDatas });
    } catch (err) {
        console.log('Cannot render userhome properly', err);
    }
}

exports.getAllProducts = async (req, res) => {
    try {
    let productDatas;
    const categoryDatas = await categoryModel.find()
    const wishlistDatasMain = await wishlistModel.findOne({ userId: req.session.user })
    const wishlistDatas = wishlistDatasMain ? wishlistDatasMain.productId : []

    if (req.query.search) {
        const search = req.query.search
        productDatas = await productsModel.find({
            productname:
                { $regex: search,$options: 'i' }
        })
    } else {
            productDatas = await productsModel.find()

    }
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
        res.render('productview', { productDatas, relatedProducts, cart, error })

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
    if (!sizes || !color) {
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
                return res.redirect(`/user/checkout?productId=${productId}&quantity=${quantity}&size=${size}&color=${color}`)
            }
        }
    }

}










