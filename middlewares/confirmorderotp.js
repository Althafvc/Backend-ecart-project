var nodemailer = require('nodemailer');




function confirmOtp(email,otp){

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.myemail,
      pass: process.env.mypass
    }
});

var mailOptions = {
    from: process.env.myemail,
    to: email,
    subject: 'Sending Email using Node.js',
    text: `The OTP for you is ${otp} `
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email has sent: ' + info.response);
    }
});

}

module.exports = confirmOtp