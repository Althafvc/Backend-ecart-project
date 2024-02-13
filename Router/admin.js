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

router.get('/delete/:mail',adminController.DeleteUser)     

router.get('/addproduct',adminController.getaddProduct)

router.post('/addproduct', multer.array('product_img',999), adminController.postaddProduct);


router.get('/products',adminController.getAdminProductsList)

router.get('/addcategory',adminController.getAddCategory)

router.post('/addcategory', multer.single('category_img'),adminController.postAddCategory)





       



module.exports = router