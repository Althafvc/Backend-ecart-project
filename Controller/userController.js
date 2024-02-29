
const twilio = require('twilio')
const userModel = require('../Models/signupDatas')
const mailOTP = require('../middlewares/mail-otp')
const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/
const flash = require('connect-flash')
const bcrypt = require('bcrypt')
const productsModel = require('../Models/productDatas')
const CategoryModel = require('../Models/categoryDatas')
const categoryModel = require('../Models/categoryDatas')
const cartModel = require('../Models/cartDatas')
const wishlistModel = require('../Models/wishlistDatas')

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

exports.getAllProducts = async (req,res)=> {
    try {
        const productDatas= await productsModel.find()
        const categoryDatas = await categoryModel.find()
        const wishlistDatasMain = await wishlistModel.findOne({userId : req.session.user})
        const wishlistDatas = wishlistDatasMain ? wishlistDatasMain.productId : []
        res.render('allproducts',{productDatas, categoryDatas,wishlistDatas})
    }catch (err) {
        console.log('cannot find productDatas properly',err);
    }
}



exports.getProductView =async (req,res)=> {
const id = req.params.id;

try {

    const productDatas = await productsModel.findById(id) 

    const relatedProducts = await productsModel.find({category:productDatas.category})

    const cart = await cartModel.findOne({userId:req.session.user})
    
    res.render('productview',{productDatas,relatedProducts,cart})

} catch (err){
    console.log('cannot render product viewpage properly', err);
}

} 


   

exports.getCategoryPage = async(req,res)=> {
    const category = req.query.element;

    try {
        const productDatas = await productsModel.find({category:category})
        const categoryDatas = await categoryModel.find()
        res.status(200).render('categories',{productDatas,categoryDatas})

    }catch(err){ console.log('cannot render category page properly',err)}
   
}

exports.getSubcategoryPage = async(req,res)=> {
    const subcategory = req.query.element;

    try {
        const productDatas = await productsModel.find({subcategory:subcategory})
        const categoryDatas = await categoryModel.find()
    
        res.status(200).render('subcategories',{productDatas,categoryDatas})

    }catch(err) {console.log('cannot render subcategory page properly',err)}
    
}








