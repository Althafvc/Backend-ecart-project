const bcrypt= require('bcrypt')
const adminModel = require('../Models/adminDatas')


exports.getSignup = (req,res)=> {
    const error = req.flash('error')
    res.render('adminsignup',{error})
}

exports.postSignup = async (req,res)=> {
    const { username, email, password, phone, confirmpassword } = req.body

    if(password != confirmpassword) {
        req.flash('error', 'please confirm your password properly')
        res.status(400).redirect('/admin/signup')
    } else {

        try {
            const salting = await bcrypt.genSalt(10)
            const hashedpassword = await bcrypt.hash(password, salting)
            const newSchema = new adminModel({
                email, username, phone,
                password: hashedpassword,
                verified: false
            })
            await newSchema.save()
            res.redirect(`/admin/adminkey/${email}`)
    }catch (err) {
        console.log(`cannot post signup`, err);
    }
    }

   
}





















exports.getAdminLogin = (req,res)=> {
    res.render('adminlogin')
}

exports.postAdminLogin = (req,res)=>{

    res.render('Adminhome')

}














exports.getAdminVerify = (req,res)=> {
    res.render('adminverify')
}


exports.postAdminVerify = async(req,res)=> {
const {email} = req.body

try{
     const admin = await adminModel.findOne({email:email})
   

     if(admin) {
        res.status(200).redirect(`/admin/forgotareaadminkey/${email}`)
     }else {
      res.status(404)
      console.log('admin n ot found');
     }
}catch(err) {
console.log('cant find user', err);
}

}





exports.getAdminKey = (req,res)=> {
    const email = (req.params.mail);
    const error = req.flash('error')
    res.render('adminkey',{email,error})
}

exports.postAdminKey = async (req,res)=> {
    const mail= (req.params.mail);
    const {recievedAdminKey} = req.body

    const adminkey = process.env.adminkey


try{
    if(recievedAdminKey==adminkey) {
        await adminModel.findOneAndUpdate({email:mail},{$set:{verified:true}})
        res.status(200).redirect(`/admin/login`)


    }else {
        req.flash('error',"invalid adminkey")
        res.status(500).redirect(`/admin/adminkey/${mail}`)
    }
}catch(err) {
 console.log('adminkey validation failed',err);
}
}














exports.getPAsswordChange = (req,res)=>{
    const email = req.params.mail 
    const error = req.flash('error')
    res.render('adminforgotpassword',{email,error})
}


exports.postPaswordChange = async (req,res) => {
    const email = req.params.mail
    const {newpassword , confirmpassword} = req.body
    console.log(req.body);

    try {
        console.log('here');
        if(newpassword != confirmpassword) {
            console.log('there');
            req.flash('error', 'new and confirm password fields does not match')
            res.status(404).redirect(`/admin/passwordchange/${email}`)
        }else {

            const salting = await bcrypt.genSalt(10)
            const hashedpassword = await bcrypt.hash(newpassword, salting)

            await adminModel.findOneAndUpdate({email:email},{$set:{password:newpassword}})

            res.status(200).redirect('/admin/login')
            

        }

    }catch(err) {
        console.log('error occured while updating the password', err);
    }


   
}















exports.getAdminForgotareaKey = (req,res)=> {
    const email = req.params.mail
    const error = req.flash('error')
    res.render('admin-forgotarea-key',{email,error})
}



exports.postAdminForgotareaKey = async (req,res)=> {
    const email=(req.params.mail);
    const {recievedAdminKey} = req.body

    const adminkey = process.env.adminkey
    console.log(adminkey);
    console.log(recievedAdminKey);

    try{
        if(recievedAdminKey==adminkey) {
            res.status(200).redirect(`/admin/passwordchange/${email}`)

        }else {
            req.flash('error','invalid adminkey')
                res.redirect(`/admin/forgotareaadminkey/${email}`)

        }
    }catch (err) {
        console.log('error occured while comparing the adminkeuy', err);
    }
}
   