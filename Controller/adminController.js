const bcrypt = require('bcrypt')
const adminModel = require('../Models/adminDatas')
const userModel = require('../Models/signupDatas')
const multer = require('multer')
const productsModel = require('../Models/productDatas')
const categoryDatas = require('../Models/categoryDatas')
const categoryModel = require('../Models/categoryDatas')
const path = require('path')
const fs = require('fs')
const { log } = require('console')



exports.getSignup = (req, res) => {
    const error = req.flash('error')
    res.render('adminsignup', { error })
}

exports.postSignup = async (req, res) => {
    const { username, email, password, phone, confirmpassword } = req.body

    if (password != confirmpassword) {
        req.flash('error', 'please confirm your password properly')
        res.status(400).redirect('/admin/signup')
    } else if (!email) {

        req.flash('error', 'please enter your email properly')
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
        } catch (err) {
            console.log(`cannot post signup`, err);
        }
    }


}

exports.getAdminLogin = (req, res) => {
    const error = req.flash('error')
    res.render('adminlogin', { error })
}

exports.postAdminLogin = async (req, res) => {

    const { email, password } = req.body


    try {
        const adminDatas = await adminModel.findOne({ email })

        if (!adminDatas) {
            req.flash('error', 'admin does not exists, plase try to signup')
            res.status(404).redirect('/admin/login')

        } else {

            const passwordMatch = await bcrypt.compare(password, adminDatas.password);

            if (passwordMatch) {
                res.status(200).redirect('/admin/home')
            } else {

                req.flash('error', 'incorrect password entered')
                res.status(401).redirect('/admin/login')

            }


        }

    } catch (err) {
        console.log('cannot complete admin login', err);
    }

}

exports.getAdminVerify = (req, res) => {
    res.render('adminverify')
}


exports.postAdminVerify = async (req, res) => {
    const { email } = req.body

    try {
        const admin = await adminModel.findOne({ email: email })


        if (admin) {
            res.status(200).redirect(`/admin/forgotareaadminkey/${email}`)
        } else {
            res.status(404)
            console.log('admin n ot found');
        }
    } catch (err) {
        console.log('cant find user', err);
    }

}

exports.getAdminKey = (req, res) => {
    const email = (req.params.mail);
    const error = req.flash('error')
    res.render('adminkey', { email, error })
}

exports.postAdminKey = async (req, res) => {
    const mail = (req.params.mail);
    const { recievedAdminKey } = req.body

    const adminkey = process.env.adminkey


    try {
        if (recievedAdminKey == adminkey) {
            await adminModel.findOneAndUpdate({ email: mail }, { $set: { verified: true } })
            res.status(200).redirect(`/admin/login`)


        } else {
            req.flash('error', "invalid adminkey")
            res.status(500).redirect(`/admin/adminkey/${mail}`)
        }
    } catch (err) {
        console.log('adminkey validation failed', err);
    }
}



exports.getPAsswordChange = (req, res) => {
    const email = req.params.mail
    const error = req.flash('error')
    res.render('adminforgotpassword', { email, error })
}


exports.postPaswordChange = async (req, res) => {
    const email = req.params.mail
    const { newpassword, confirmpassword } = req.body
    console.log(req.body);

    try {
        console.log('here');
        if (newpassword != confirmpassword) {
            console.log('there');
            req.flash('error', 'new and confirm password fields does not match')
            res.status(404).redirect(`/admin/passwordchange/${email}`)
        } else {

            const salting = await bcrypt.genSalt(10)
            const hashedpassword = await bcrypt.hash(newpassword, salting)

            await adminModel.findOneAndUpdate({ email: email }, { $set: { password: newpassword } })

            res.status(200).redirect('/admin/login')


        }

    } catch (err) {
        console.log('error occured while updating the password', err);
    }



}







exports.getAdminForgotareaKey = (req, res) => {
    const email = req.params.mail
    const error = req.flash('error')
    res.render('admin-forgotarea-key', { email, error })
}



exports.postAdminForgotareaKey = async (req, res) => {
    const email = (req.params.mail);
    const { recievedAdminKey } = req.body

    const adminkey = process.env.adminkey

    try {
        if (recievedAdminKey == adminkey) {
            res.status(200).redirect(`/admin/passwordchange/${email}`)

        } else {
            req.flash('error', 'invalid adminkey')
            res.redirect(`/admin/forgotareaadminkey/${email}`)

        }
    } catch (err) {
        console.log('error occured while comparing the adminkey', err);
    }
}







exports.getAdminhome = (req, res) => {



    res.render('adminhome')
}



exports.getUsersList = async (req, res) => {
    let datas = await userModel.find()
    res.render('userList', { datas })

}


exports.DeleteUser = async (req, res) => {
    console.log(req.params.mail);
    const email = req.params.mail

    try {
        await userModel.deleteOne({ email: email })

        res.status(200).redirect('/admin/users')

    } catch (err) {
        console.log('cannot delete the user', err)
    }

}



exports.getaddProduct = async (req, res) => {
    try {
        let categoryDatas = await categoryModel.find()
        res.render('addproduct', { categoryDatas })
    } catch (err) { console.log('cannot find categoryDatas', err); }

}

exports.postaddProduct = async (req, res) => {
    const product_img = req.files.map(file => file.filename);

    const { productname, oldprice, size, color, subcategory, stock, description, category } = req.body

    const productExists = await productsModel.findOne({productname:req.body.productname})

    if(productExists) {
        console.log('product already exists');
        return res.status(298).json(({ success: false }))
    }else {
        try {

            if (!req.files) {
    
                return res.status(298).json(({ success: false }))
    
            } else {
                const products = new productsModel({ productname, oldprice, size, color, subcategory, stock, category, description, product_img })
                await products.save()
                return res.status(200).json({ success: true })
    
            }
    
        } catch (err) {
            console.log('file not found', err);
        }

    }
     
}

exports.getAdminProductsList = async (req, res) => {
    try {
        let productDatas = await (productsModel.find())
        res.render('productsList', { productDatas })
    } catch (err) { console.log('cannot find productDatas', err) }

}

exports.getAddCategory = (req, res) => {
    res.status(200).render('addcategory')
}

exports.postAddCategory = async (req, res) => {


    const { subcategory, category } = req.body

    try {

        if (!req.file) {
            return res.status(298).json({ success: false })
        }

        else {

            const categoryparser = JSON.parse(category)
            const subcategoryparser = JSON.parse(subcategory)
            const category_img = req.file.filename

            const categories = new categoryModel({ category_img, category: categoryparser, subcategory: subcategoryparser })

            await categories.save()

            return res.status(200).json({ success: true })
        }

    } catch (err) {
        console.log('catch is working', err);
    }

}


exports.getEditProduct = async (req, res) => {
    const id = req.params.id
    try {
        let categoryDatas = await categoryModel.find()
        const productDatas = await productsModel.findOne({ _id: id })
        res.render('editproduct', { categoryDatas, productDatas, id })
    } catch (error) { console.log('cannot find categoryDatas properly', error) };
}



exports.postEditProduct = async (req, res) => {
    const id = req.params.id
    const { productname, oldprice, size, color, subcategory, stock, description, category } = req.body

    try {
        const product = await productsModel.findOne({ _id: id })

        const productObj =
        {
            productname,
            oldprice,
            size,
            color,
            subcategory,
            stock,
            description,
            category,
            product_img: []
        }

        if (req.files.length > 0) {

            product.product_img.forEach(img => {
                const imagePath = './public/' + 'uploads/' + img
                if (fs.existsSync(imagePath)) {

                    fs.unlinkSync(imagePath)
                }
            });

            let images = req.files.map((file) => file.filename)
            productObj.product_img = images
        } else {
            productObj.product_img = product.product_img
        }



        await productsModel.updateOne({ _id: id }, productObj),

            res.status(200).redirect('/admin/products')

    } catch (err) { console.log('cannot access images', err) }

}

exports.DeleteProduct = async (req,res)=> {
 const id = req.params.id

 try {
    const deletedProduct = await productsModel.deleteOne({_id:id})
    if(deletedProduct){
        return res.status(200).json({ success: true })
    }else{
        return res.status(290).json({ success: false })
    }

 }catch (err) {console.log('product not found'.err)}

}
