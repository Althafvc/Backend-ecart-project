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
const orderDataModel = require('../Models/orderDetails')



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
                req.session.admin= adminDatas._id

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

    try {
        if (newpassword != confirmpassword) {
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
    const amdinId = req.session.admin

    if(!amdinId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {
        try {
            res.render('graphanalysis')

        }catch(err){console.log('cannot render adminhome properly', err)}
    }
}



exports.getUsersList = async (req, res) => {

    const amdinId = req.session.admin

    if(!amdinId) {
        req.flash('error','Your session has expired')
       return  res.redirect('/admin/login')
    }else {
        try {
            let datas = await userModel.find()
            res.render('userList', { datas })
        }catch(err){console.log('cannot render userList properly', err)}
    
    }
}


exports.DeleteUser = async (req, res) => {

    const amdinId = req.session.admin

    if(!amdinId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {
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

}



exports.getaddProduct = async (req, res) => {

    const adminId = req.session.admin 

    if(!adminId){
        req.flash('error', 'Your session has expired')
       return res.redirect('/admin/login')
    }else {
        try {
            let categoryDatas = await categoryModel.find()
            res.render('addproduct', { categoryDatas })
        } catch (err) { console.log('cannot find categoryDatas', err); }
    }
    

}

exports.postaddProduct = async (req, res) => {

    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')

    }else {
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

    

}

exports.getAdminProductsList = async (req, res) => {

    const adminId = req.session.admin

    if(!adminId){
req.flash('error','Your session has expired')
return res.redirect('/admin/login')
    }else {
        try {
            let pageNumber = req.query.pageNumber  || 1
            let pageLimit = 0 
            let productDatas = []
            if(pageNumber > 1){
                pageLimit = (pageNumber - 1) * 7
            }
            if(req.query.pageNumber){
                productDatas = await productsModel.aggregate([
                    {
                        $skip : pageLimit
                    },
                    {
                        $limit : 7
                    }
                ])
            }else{
                productDatas = await productsModel.aggregate([
                    {
                        $skip : pageLimit
                    },
                    {
                        $limit : 7
                    }
                ])
            }
            res.render('productsList', { productDatas, pageNumber})
            
                    
                

           
        } catch (err) { console.log('cannot find productDatas', err) }
    }  

}

exports.getAddCategory = (req, res) => {
    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error', 'Your session has expired')
        return res.redirect('/admin/login')
    }else {
        try {
           
            res.status(200).render('addcategory')
        }catch(err) {console.log('cannot render addcategory properly', err);}
    }
}

exports.postAddCategory = async (req, res) => {

    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error', 'Your session has expired')
       return  res.redirect('/admin/login')
    }else {
        try { 
        
            if (!req.file) {
                console.log('image file is compulsory');
                return res.status(298).json({ success: false})
            }
            
            
                const { subcategory, category } = req.body 
                console.log(subcategory);
                const subcat = JSON.parse(subcategory)
    
            const sameCategory = await categoryModel.findOne({category:JSON.parse(category)})
             if (sameCategory) {
    
                    const updation = await categoryModel.findOneAndUpdate({category:JSON.parse(category)},{$push:{subcategory:{$each:subcat
                      }}

                    }) 
                
                return res.status(200).json({ success: true})
    
    
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
            console.log('error occured in postAddCategory ', err);
        }
    }
    

}

exports.getCategoriesList = async (req, res) => {

    const adminId = req.session.admin 
        if(!adminId) {
            req.flash('error', 'Your session has expired')
            return res.redirect('/admin/login')
        }else {
            try {
                const categoryDatas = await categoryModel.find()
                res.render('categorylist', { categoryDatas })
        
            } catch (err) {
                console.log('cannot find categoryDatas properly', err);
            }
        }
    
}

exports.DeleteCategory = async (req, res) => {

    const adminId = req.session.admin 
        if(!adminId) {
            req.flash('error', 'Your session has expired')
            return(res.redirect('/admin/login'))
        }else {
    const id = req.params.id;

    try {
        const deleteCategory = await categoryModel.findOneAndDelete({ _id: id })

        if (deleteCategory) {

            const imagePath =  './public/' + 'uploads/' + 'categories/' + deleteCategory.category_img

            fs.unlinkSync(imagePath)

            return res.status(200).json({ success: true })

        } else {
            return res.status(500).json({ success: false })

        }
    } catch (err) { console.log('error occured while deleting the category ') }
        
}
}

exports.getEditcategory = async(req,res)=> {    
    
    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
       return res.redirect('/admin/login')
    }else {

    const categoryId = req.query.categoryId
    const categoryFind = await categoryModel.findById(categoryId)
    res.render('editcategory',{categoryFind})
}

}

exports.getEditProduct = async (req, res) => {

    const adminId = req.session.admin
    if(!adminId) {
         req.flash('error', 'Your session has expired')
         return res.redirect('/admin/login')

    }else {
    const id = req.params.id
    try {
        let categoryDatas = await categoryModel.find()
        const productDatas = await productsModel.findOne({ _id: id })
        res.render('editproduct', { categoryDatas, productDatas, id })
    } catch (error) { console.log('cannot find categoryDatas properly', error) };
}

}
   


exports.postEditProduct = async (req, res) => {
    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error', 'Your session has expired')
        return res.redirect('/admin/login')

    }else {

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

}

exports.DeleteProduct = async (req, res) => {

    const adminId = req.session.admin

if(!adminId) {
    req.flash('eerror','Your session has expired')
    return res.redirect('/admin/login')
}else {

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

}


exports.getBlockedUsers = async (req, res) => {

    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error', 'Your session has expired')
        return res.redirect('/admin/login')
    }else {

        try {
            const userDatas = await userModel.find({ isBlocked: 'Blocked' })
            res.render('blockedusers', { userDatas })

        }catch(err) {console.log('cannot render blocked users list properly', err)}
}
}


exports.getAddCoupons = (req, res) => {
    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {
    try {
        const error = req.flash('error')
        res.render('addcoupons', { error })
    }catch(err){console.log('cannot render addcoupons properly', err)}
    
}

}

exports.postAddCoupons = async (req, res) => {
    const adminId = req.session.admin
    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {

    const { couponcode, minimumpurchaseamount, discountprice, beginningdate, expirydate, availability} = req.body

    const duplicateCoupon = await couponsModel.findOne({ couponcode: req.body.couponcode })

    if (!couponcode || !minimumpurchaseamount || !discountprice || !beginningdate || !expirydate || !availability) {
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
                discountprice,
                beginningdate,
                expirydate,
                availability,
            })
            await newSchema.save()

            res.status(200).redirect('/admin/coupons')
        } catch (err) {
            console.log('Coupons saving failed', err);

        }
    }
}

}



exports.getCouponsList = async (req, res) => {

    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {

        try {
            const couponDatas = await couponsModel.find()
            res.render('couponsList', { couponDatas })
        }catch(err){console.log('Cannot render couponlist properly',err)}
}

}


exports.deleteCoupons = async (req, res) => {
    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {

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

}




exports.getEditCoupons = async (req, res) => {

    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {
    const id = req.params.id;

    try {
        const couponDatas = await couponsModel.findOne({ _id: id })
        res.render('editcoupon', { couponDatas, id })
    } catch (error) { console.log('cannot find couponDatas properly', error) };

}

}


exports.postEditCoupons = async (req, res) => {

    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {
    const id = req.params.id

    const { couponcode, minimumpurchaseamount, discountpercentage, beginningdate, expirydate, availability} = req.body

    try {
        const coupon = await couponsModel.findOneAndUpdate({ _id: id }, {
            $set: {
                couponcode,
                minimumpurchaseamount,
                discountpercentage,
                beginningdate,
                expirydate,
                availability
            }
        },)


    } catch (err) { console.log('cannot access images', err) }

}

}


exports.getAddBanner = (req, res) => {

    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        res.redirect('/admin/login')
    }else {
        try {
            const error = req.flash('error')
            res.render('addbanner', { error })
        } catch (err) {
            console.log('cannot render addbanner properly',err);
        }
}
}


exports.postAddBanner = async (req, res) => {
    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {
    
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

}

exports.getBannersList = async (req, res) => {

    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {

    try {
        const bannerDatas = await bannersModel.find()
        res.render('bannersList', { bannerDatas })
    } catch (err) {
        console.log('cannot find bannerdatas properly');
    }

}

}

exports.getEditBanner = async (req, res) => {

    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {

    try {
        const error = req.flash('error')
        const id = req.params.id
        const bannerDatas = await bannersModel.findOne({ _id: id })
        res.render('editbanner', { error, id, bannerDatas })
    } catch (err) {
        console.log('cannot find bannerdatas', err);
    }

}

}

exports.postEditBanner = async (req, res) => {const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {
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

}

exports.getDeleteBanner = async (req, res) => {

    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {
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

}

exports.getChartAnalysis = (req,res)=> {
    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {

        try {
            res.render('graphanalysis')

        }catch(err) {console.log('cannot render graphanalysis properly',err)}
}

}

exports.getOrderslist = async (req,res)=> {

    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {
    

try {
    const orderDatas = await orderDataModel.find().populate("orders.productId")
    res.render('adminOrdersList',{orderDatas})
}catch(err) {console.log('cannot render orderpage properly', err)}}

}


exports.setOrderStatus =async (req,res)=> {

    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {
    const value = req.query.value
    const id = req.query.id

    try {
        const aptOrder = await orderDataModel.findOneAndUpdate(
            { "orders._id": id },
            { $set: { "orders.$.status": value } }); 
            res.redirect('/admin/orders')

         }catch(err){console.log('error in cancelling the product',err)}    
}

}
exports.firstChartdats = async (req, res) => {

    const adminId = req.session.admin

    if(!adminId) {
        req.flash('error','Your session has expired')
        return res.redirect('/admin/login')
    }else {

    const userCount = await userModel.find();

    // Create an object to store user counts per month
    const userCountsPerMonth = {};

    // Iterate over each user object
    userCount.forEach(user => {
        // Extract createdAt date from the user object
        const createdAtDate = new Date(user.createdAt);

        // Get the month name
        const month = createdAtDate.toLocaleString('default', { month: 'long' });

        // If the month doesn't exist in the userCountsPerMonth object, initialize it to 1, otherwise increment the count
        userCountsPerMonth[month] = (userCountsPerMonth[month] || 0) + 1;
        
    });

    const categoryCounts = await productsModel.aggregate([
        {
            $group: {
                _id: '$category', // Group by category
                count: { $sum: 1 } // Count the number of documents in each group
            }
        },
        {
            $project: {
                category: '$_id', // Rename _id field to category
                count: 1, // Keep count field
                _id: 0 // Exclude _id field
            }
        }
    ]);
    
    // Transforming the array of objects into an object with category names as keys and counts as values
    const formattedCategoryCounts = {};
    categoryCounts.forEach(category => {
        formattedCategoryCounts[category.category] = category.count;
    });


    const orders = await orderDataModel.aggregate([
        {
          $unwind: "$orders" // Deconstruct the orders array
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$orders.orderDate" } }, // Extract month from orderDate
            totalOrders: { $sum: 1 } // Count the orders for each month
          }
        },
        {
          $sort: {
            "_id": 1 // Sort by month in ascending order
          }
        }
      ]);
      
      // Transform the data into an array of objects where each object represents a month and its count of orders
      const ordersDataForGraph = orders.reduce((acc, order) => {
        const monthYear = order._id.split('-');
        const monthIndex = parseInt(monthYear[1]) - 1; // Month index starts from 0
        const monthName = new Date(Date.UTC(monthYear[0], monthIndex, 1)).toLocaleString('default', { month: 'long' });
        acc[monthName] = order.totalOrders;
        return acc;
    }, {});
        

    res.status(200).json({success:true, datas:userCountsPerMonth, products:formattedCategoryCounts, lastData:ordersDataForGraph})
}};




