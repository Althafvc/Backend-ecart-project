const mongoose = require('mongoose')
const { json } = require('express');
const session = require('express-session')
const flash = require("connect-flash")
const wishlistModel = require('../Models/wishlistDatas');


exports.getAddToWishlist = async (req,res)=> {
    const product = new mongoose.Types.ObjectId(req.query.productid);
    const userId = req.session.user
   
    

    if(!userId) {

        req.flash('error','please try to login first')
        return res.redirect('/login')

    } else {
        const ExistingUser = await wishlistModel.findOne({ userId });
       
        if(!ExistingUser) {

            const newSchema = new wishlistModel({
                userId: userId,
                productId: [product],
            })
            await newSchema.save()
            return res.status(200).json({success:true})

        } else if(ExistingUser){

            existingProduct = await wishlistModel.findOne({productId:product})

            if (!existingProduct) {
                   const updated = await wishlistModel.findOneAndUpdate(
                { userId: ExistingUser.userId },
                { $push: { productId: product } },
                {new:true}
              );
            return res.status(200).json({success:true})

            }else {
                const deleted = await wishlistModel.findOneAndUpdate({userId:ExistingUser.userId},
                    {$pull: { productId: product}},
                    {new:true})
                    return res.status(200).json({success:true})
            }
        }

    }
}

exports.getWishlistPage = async (req,res)=> {

    try {

        if(!req.session.user) {
            req.flash('error',"your session has expired")
            res.redirect('/login')
        }else {
            const wishlistDatas = await wishlistModel.findOne({userId:req.session.user}).populate('productId')
            const count = wishlistDatas.productId.length
            res.render('wishlist',{wishlistDatas,count})
        }

    }catch(err){console.log('cannot render wishlist properly',err)}
   
}
