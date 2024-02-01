const express = require('express')
const router = express.Router()
const commonController = require('../Controller/commonController')

router.get('/',commonController.defaultRoute)


router.get('/signup',commonController.getSignup)
router.post('/signup',commonController.postSignup)


router.get('/login',commonController.getLogin)
router.post('/login',commonController.postLogin)

router.get('/forgotpassword',commonController.getForgotPassword)
router.post('/forgotpassword',commonController.postForgotPassword)






module.exports = router