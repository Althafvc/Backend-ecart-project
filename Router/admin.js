const express = require('express')
const router = express.Router()
const adminController = require('../Controller/adminController')
const multer = require('../middlewares/multer')

router.get('/signup',adminController.getSignup)
router.post('/signup',adminController.postSignup)

router.get('/adminkey/:mail',adminController.getAdminKey)
router.post('/adminkey/:mail',adminController.postAdminKey)

router.get('/login',adminController.getAdminLogin)
router.post('/login',adminController.postAdminLogin) 

router.get('/verify',adminController.getAdminVerify)
router.post('/verify',adminController.postAdminVerify)

router.get('/passwordchange/:mail',adminController.getPAsswordChange)
router.post('/passwordchange/:mail',adminController.postPaswordChange)


router.get('/forgotareaadminkey/:mail',adminController.getAdminForgotareaKey)
router.post('/forgotareaadminkey/:mail',adminController.postAdminForgotareaKey)


router.get('/home',adminController.getAdminhome)


router.get('/users',adminController.getUsersList)

router.delete('/delete/users/:mail',adminController.DeleteUser)     

router.get('/addproduct',adminController.getaddProduct)

router.post('/addproduct', multer.array('product_img',999), adminController.postaddProduct);


router.get('/products',adminController.getAdminProductsList)

router.get('/addcategory',adminController.getAddCategory)

router.post('/addcategory', multer.single('category_img'),adminController.postAddCategory)
router.get('/editproduct/:id',adminController.getEditProduct)
router.post('/editproduct/:id',multer.array('product_img',999),adminController.postEditProduct)
router.delete('/products/delete/:id',adminController.DeleteProduct)
router.get('/blockedusers',adminController.getBlockedUsers)

router.get('/coupons',adminController.getCouponsList)
router.get('/addcoupons',adminController.getAddCoupons)
router.post('/addcoupons',adminController.postAddCoupons)
router.delete('/deletecoupons/:id',adminController.deleteCoupons)
router.get('/editcoupons/:id',adminController.getEditCoupons)
router.post('/editcoupons/:id',adminController.postEditCoupons)



router.get('/banners',adminController.getBannersList)
router.get('/addbanner',adminController.getAddBanner)
router.post('/addbanner',multer.single('bannerImg'),adminController.postAddBanner)

router.get('/editbanner/:id',adminController.getEditBanner)
router.post('/editbanner/:id',multer.single('bannerImg'),adminController.postEditBanner)
module.exports = router