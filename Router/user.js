const express = require('express')
const router = express.Router()

const userController = require('../Controller/userController')

router.get('/otp/:num',userController.getOTP)
router.post('/otp/:num',userController.postOTP)


router.get('/resendotp/:phone',userController.resendOTP)

router.get('/home',userController.getUserHome)


router.get('/forgot/otp/:mail',userController.getforgotareaotp)
router.post('/forgot/otp/:mail',userController.postforgotareaotp)


router.get('/changepassword/:mail',userController.getChangePassword)
router.post('/changepassword/:mail',userController.postChangePassword)


router.get('/allproducts',userController.getAllProducts)
router.get('/productview/:id',userController.getProductView)
router.get('/categories',userController.getCategoryPage)
router.get('/subcategories',userController.getSubcategoryPage)






module.exports = router