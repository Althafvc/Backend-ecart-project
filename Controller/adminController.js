const bcrypt = require('bcrypt')
const adminModel = require('../Models/adminDatas')
const userModel = require('../Models/signupDatas')
const multer = require('multer')
const productsModel = require('../Models/productDatas')
const categoryDatas = require('../Models/categoryDatas')
const categoryModel = require('../Models/categoryDatas')
const couponsModel = require('../Models/couponDatas')
const path = require('path')
const fs = require('fs')
const { log } = require('console')
const bannersModel = require('../Models/bannerDatas')



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
    const email = req.params.mail

    try {
        let selectedUser = await userModel.findOne({ email })
        if (selectedUser.isBlocked == "Unblocked") {
            await userModel.updateOne({ email }, { $set: { isBlocked: "Blocked" } })
            return res.status(200).json({ success: true, block: true })

        } else {
            await userModel.updateOne({ email }, { $set: { isBlocked: "Unblocked" } })
            return res.status(200).json({ success: true, unblock: true })

        }

    } catch (err) {
        console.log('error occured while deleting the user', err)
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

    const productExists = await productsModel.findOne({ productname: req.body.productname })

    if (productExists) {
        console.log('product already exists');
        return res.status(298).json(({ success: false }))
    } else {
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
    try {
        
        if (!req.file) {
            console.log('image file is compulsory');
            return res.status(298).json({ success: false })
        }
        
        
            const { subcategory, category } = req.body
            const subcat = JSON.parse(subcategory)
            console.log(subcat);

        const sameCategory = await categoryModel.findOne({category:JSON.parse(category)})
        console.log(sameCategory);
         if (sameCategory) {

                const updation = await categoryModel.findOneAndUpdate({category:JSON.parse(category)},{$push:{subcategory:{$each:subcat
                  }}}) 
            

            return res.status(200).json({ success: true })

            console.log('subcategory added succefully');

        }

        else {

            const category_img = req.file.filename

            const categories = new categoryModel(
                {
                  category_img,
                  category:JSON.parse(category),
                  subcategory:JSON.parse(subcategory),
                })

            await categories.save()

            return res.status(200).json({ success: true })
        }

    } catch (err) {
        console.log('catch is working', err);
    }

}

exports.getCategoriesList = async (req, res) => {

    try {
        const categoryDatas = await categoryModel.find()
        res.render('categorylist', { categoryDatas })

    } catch (err) {
        console.log('cannot find categoryDatas properly', err);
    }
}

exports.DeleteCategory = async (req, res) => {
    const id = req.params.id;

    try {
        const deleteCategory = await categoryModel.findOneAndDelete({ _id: id })

        if (deleteCategory) {


            return res.status(200).json({ success: true })

        } else {
            return res.status(500).json({ success: false })

        }
    } catch (err) { console.log('error occured while deleting the category ') }

}


exports.getEditCategory = async (req, res) => {
    const id = req.params.id

    try {
        const categoryDatas = await categoryModel.findOne({ _id: id })
        console.log(categoryDatas);
        res.render('editcategory', { categoryDatas, id })

    } catch (err) { console.log('cannot find your category properly'), err }
}


exports.postEditCategory = (req, res) => {
    console.log(req.params.id);
    console.log(req.body);
    console.log(req.file);
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
                const imagePath = './public/' + 'uploads/' + 'products/' + img
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

exports.DeleteProduct = async (req, res) => {
    const id = req.params.id



    try {
        const deletedProduct = await productsModel.findByIdAndDelete(id);
        if (deletedProduct) {
            let imagearray = deletedProduct.product_img
            imagearray.forEach(img => {
                const imagePath = './public/' + 'uploads/' + 'products/' + img
                fs.unlinkSync(imagePath)
            });
            return res.status(200).json({ success: true })
        } else {
            return res.status(404).json({ success: false })
        }

    } catch (err) { console.log('product not found', err) }

}


exports.getBlockedUsers = async (req, res) => {

    const userDatas = await userModel.find({ isBlocked: 'Blocked' })

    res.render('blockedusers', { userDatas })
}


exports.getAddCoupons = (req, res) => {
    const error = req.flash('error')
    res.render('addcoupons', { error })
}

exports.postAddCoupons = async (req, res) => {
    const { couponcode, minimumpurchaseamount, discountpercentage, beginningdate, expirydate } = req.body

    const duplicateCoupon = await couponsModel.findOne({ couponcode: req.body.couponcode })

    if (!couponcode || !minimumpurchaseamount || !discountpercentage || !beginningdate || !expirydate) {


        req.flash('error', 'All fields are mandatory')
        res.status(404).redirect('/admin/addcoupons')
    }

    else if (duplicateCoupon) {
        req.flash('error', 'Coupon already exists')
        res.status(500).redirect('/admin/addcoupons')

    } else {

        try {

            const newSchema = new couponsModel({
                couponcode,
                minimumpurchaseamount,
                discountpercentage,
                beginningdate,
                expirydate
            })
            await newSchema.save()

            res.status(200).redirect('/admin/coupons')
        } catch (err) {
            console.log('Coupons saving failed', err);

        }
    }
}



exports.getCouponsList = async (req, res) => {

    const couponDatas = await couponsModel.find()

    res.render('couponsList', { couponDatas })
}


exports.deleteCoupons = async (req, res) => {
    const id = req.params.id

    try {
        const deletedCoupon = await couponsModel.findByIdAndDelete({ _id: id });

        if (deletedCoupon) {
            return res.status(200).json({ success: true })
        } else {
            return res.status(500).json({ success: false })

        }
    }
    catch (err) { console.log('error in deleting the coupon', err) }

}




exports.getEditCoupons = async (req, res) => {
    const id = req.params.id;

    try {
        const couponDatas = await couponsModel.findOne({ _id: id })
        res.render('editcoupon', { couponDatas, id })
    } catch (error) { console.log('cannot find couponDatas properly', error) };

}


exports.postEditCoupons = async (req, res) => {
    const id = req.params.id

    const { couponcode, minimumpurchaseamount, discountpercentage, beginningdate, expirydate } = req.body

    try {
        const coupon = await couponsModel.findOneAndUpdate({ _id: id }, {
            $set: {
                couponcode,
                minimumpurchaseamount,
                discountpercentage,
                beginningdate,
                expirydate
            }
        },)


    } catch (err) { console.log('cannot access images', err) }

}


exports.getAddBanner = (req, res) => {
    const error = req.flash('error')
    res.render('addbanner', { error })
}

exports.postAddBanner = async (req, res) => {
    const { bannername, heading, offerprice, startingdate, endingdate } = req.body
    const file = req.file ? req.file.filename : false
    const duplicatebanner = await bannersModel.findOne({ bannername: req.body.bannername })


    if (!bannername || !heading || !offerprice || !startingdate || !endingdate) {
        req.flash('error', 'All fields are mandatory')
        res.status(404).redirect('/admin/addbanner')

    } else if (duplicatebanner) {
        req.flash('error', 'Banner already exists')
        res.status(404).redirect('/admin/addbanner')


    }
    else if (!file) {

        console.log('image not found');

    }

    else {
        try {

            const newSchema = new bannersModel({
                bannername,
                heading,
                offerprice,
                startingdate,
                endingdate,
                image: file
            })
            await newSchema.save()

            res.status(200).redirect('/admin/addbanner')
        } catch (err) {
            console.log('Banner saving failed', err);

        }


    }
}

exports.getBannersList = async (req, res) => {

    try {
        const bannerDatas = await bannersModel.find()
        res.render('bannersList', { bannerDatas })
    } catch (err) {
        console.log('cannot find bannerdatas properly');
    }

}


exports.getEditBanner = async (req, res) => {

    try {
        const error = req.flash('error')
        const id = req.params.id
        const bannerDatas = await bannersModel.findOne({ _id: id })
        res.render('editbanner', { error, id, bannerDatas })
    } catch (err) {
        console.log('cannot find bannerdatas', err);
    }

}

exports.postEditBanner = async (req, res) => {
    const id = req.params.id;
    const { bannername, heading, offerprice, startingdate, endingdate } = req.body

    try {
        const banner = await bannersModel.findOne({ _id: id })
        const file = req.file ? req.file.filename : banner.image;

        if (!bannername || !heading || !offerprice || !startingdate || !endingdate) {
            req.flash('error', 'All fields are mandatory')
            res.status(404).redirect(`/admin/editbanner/${id}`)

        } else {
            const updatedbanner = await bannersModel.findOneAndUpdate({ _id: id }, {
                $set: {
                    bannername,
                    heading,
                    offerprice,
                    startingdate,
                    endingdate,
                    image: file
                }
            })

            const imagepath = './public/' + 'uploads/' + 'banners/' + banner.image

            if (req.file) {
                fs.unlinkSync(imagepath)
            }
            res.status(200).redirect(`/admin/banners`)
        }
    } catch (err) { console.log('error in editing the banner', err) }
}

exports.getDeleteBanner = async (req, res) => {
    const id = req.params.id;

    try {
        const deleteBanner = await bannersModel.findOneAndDelete({ _id: id })

        if (deleteBanner) {


            return res.status(200).json({ success: true })

        } else {
            return res.status(500).json({ success: false })

        }
    } catch (err) { console.log('error occured while deleting the banner ') }

}




