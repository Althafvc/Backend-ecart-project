const express = require('express')
const router = express.Router()

const userController = require('../Controller/userController')
const cartController = require('../Controller/cartController')

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



router.get('/add_to_cart',cartController.getAddToCart)
router.get('/cart',cartController.getCartPage)

router.delete('/deletecartproduct',cartController.deleteFromCart)

router.get('/addquantity',cartController.addQuantity)








module.exports = router