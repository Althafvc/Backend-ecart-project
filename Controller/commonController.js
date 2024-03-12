const userModel = require('../Models/signupDatas')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');
const twilio = require('twilio')
const nodemailer = require('nodemailer')
const mailOTP = require('../middlewares/mail-otp')



exports.defaultRoute = (req, res) => {
    res.status(200).redirect('/user/home')
}

exports.getSignup = (req, res) => {
    const error = req.flash('error')
    res.render('signup', { error })
}

exports.postSignup = async (req, res) => {

    const { username, email, password, phone, confirmpassword } = req.body


    if (password != confirmpassword) {
        req.flash('error', 'please confirm your password properly')
        res.status(400).redirect(`/signup`)

    } else {


        try {
            const salting = await bcrypt.genSalt(10)
            const hashedpassword = await bcrypt.hash(password, salting)
            const newSchema = new userModel({
                email, username, phone,
                password: hashedpassword,
                user: false,
                isBlocked: "Unblocked"
            })
            await newSchema.save()
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const client = twilio(accountSid, authToken)
            const verifysid = process.env.TWILIO_VERIFY_SID;
            const twiliophone = phone
    


            if (phone) {
                const verification = await client.verify.v2.services(verifysid)
                    .verifications
                    .create({ to: `+91${twiliophone}`, channel: 'sms' })
                    .then((verification) => console.log(verification.status))
                    .catch((error) => console.log((error.message)))

                res.redirect(`/user/otp/${phone}`)
            } else {
                console.log('otp verification failed');
            }

        } catch (err) {
            console.log('error occured while sending the OTP code', err);
            res.status(500).json({ error: 'failed to send verification code' })
        }
    }
}


exports.getLogin = (req, res) => {
    const error = req.flash("error")
    res.render('login', { error })
}

exports.postLogin = async (req, res) => {
    const { email, password } = req.body
    const userDatas = await userModel.findOne({ email })

    if (!userDatas) {
        req.flash("error", "User doesn't exists, please try to Signup")
        res.redirect("/login")
        
    } else if(userDatas.isBlocked=='Blocked'){
        req.flash('error', "your account is blocked")
        res.redirect("/login")


    }
    else {

        if (userDatas) {

            const passwordMatch = await bcrypt.compare(password, userDatas.password);

            if (passwordMatch) {

                req.session.user= userDatas._id
                req.session.email = userDatas.email
                res.redirect('/user/home')
            } else {
                req.flash('error', "you have entered a wrong password")
                res.redirect('/login',)
            }

        } else {
            req.flash('error', 'user does not found')
            res.render('login')

        }
    }
}




exports.getForgotPassword = (req, res) => {
    res.render('verifyforgotpassword')
}

exports.postForgotPassword = (req, res) => {

    const { email } = req.body


    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'althafvellanchola46@gmail.com',
            pass: 'ppjf wyqm lzbm gtri'
        }
    })




    var mailOptions = {
        from: 'althafvellanchola46@gmai.com',
        to: email,
        subject: 'Sending Email using Node.js',
        text: ` The OTP for you is ${mailOTP.otp} `
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email has sent: ' + info.response);
        }
    });
    res.redirect(`/user/forgot/otp/${email}`)
}