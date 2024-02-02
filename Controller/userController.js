
const twilio = require('twilio')
const userModel = require('../Models/signupDatas')
const mailOTP = require('../public/mail-otp')
const passwordRegex =/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/
const flash = require('connect-flash')
const bcrypt = require('bcrypt')

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid,authToken)
const verifysid = process.env.TWILIO_VERIFY_SID;

exports.getOTP = (req,res)=>{
    const phone = req.params.num
    res.render('otp',{phone})
}

exports.postOTP = async (req,res)=> {

    const data = req.params.num

const {digit1, digit2, digit3, digit4} = req.body
const one = digit1
const two = digit2
const three = digit3
const four = digit4
const otp = digit1+ digit2 + digit3 + digit4



 
try {
    const verification_check = await client.verify.v2.services(verifysid)
    .verificationChecks
    .create({to:`+91${data}`, code:otp})

    if(verification_check.status === 'approved'){
        await userModel.findOneAndUpdate({phone:data},{$set:{user:true}})
        res.redirect('/login')
    }else {
        console.log('failed to verify the OTP');
        res.redirect('/signup')
    }


}catch (err){
console.log('error occured', err);
}

}


exports.resendOTP = async (req,res)=>{
    const phone = (req.params.phone);
    const twiliophone = phone
    console.log(twiliophone);


    try {
        if(phone) {
            const verification = await client.verify.v2.services(verifysid)
            .verifications
            .create({to:`+91${phone}`, channel:'sms'})
            .then((verification) => console.log(verification.status))
            .catch((error) => console.log((error.message)))
        }

    }catch(err) {
        console.log(err);
    }
   
}



exports.getUserHome = (req,res)=>{
    res.render('user-home')
}

exports.getforgotareaotp = (req,res)=>{
    const mail = req.params.mail
    res.render('forgot-area-otp',{mail})
}

exports. postforgotareaotp= (req,res)=>{
    const mail = req.params.mail
const {digit1, digit2, digit3, digit4} = req.body
const one = digit1
const two = digit2
const three = digit3
const four = digit4
const result = digit1+ digit2 + digit3 + digit4


if(result == mailOTP.otp) {
    res.redirect(`/user/changepassword/${mail}`)
}else {
    res.send('The mailOTP verification is failed')
}
}



exports.getChangePassword = (req,res)=>{

    const mail = req.params.mail
    res.render('passwordchange',{mail})
}



exports.postChangePassword = async (req,res)=>{
const mail = req.params.mail
    const {newpassword, confirmpassword} = req.body

    const salting = await bcrypt.genSalt(10)
    const hashedpassword = await bcrypt.hash(newpassword, salting)

    if(newpassword===confirmpassword) {
       const email=mail
        const user = await userModel.updateOne({email},{$set:{ password:hashedpassword}})
        console.log(user);

        
        
    }else {
        console.log('moonji');

    }
    
    res.send ('reached')
}









 