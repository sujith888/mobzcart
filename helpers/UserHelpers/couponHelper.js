const db = require('../../models/connection')
const bcrypt = require('bcrypt');
const { response } = require("../../app");
const ObjectId = require('mongodb').ObjectId



module.exports = {

    couponValidator: async (code, userId, total) => {

        return new Promise(async (resolve, reject) => {
            try {
                let discountAmount;
                let couponTotal
                let coupon = await db.coupon.findOne({ couponName: code })
                if (coupon) {
                    if (total >= coupon?.minPurchase) {                          //checking max offer value
                        discountAmount = (total * coupon.discountPercentage) / 100
                        if (discountAmount > coupon?.maxDiscountValue) {
                            discountAmount = coupon?.maxDiscountValue
                        }


                    }
                    couponTotal = total - discountAmount
                } else {
                    resolve({ status: false, err: "coupon does'nt exist" })
                }
                let couponExists = await db.coupon.findOne({ 'coupons.couponName': code })

                if (couponExists) {

                    if (new Date(couponExists.expiry) - new Date() > 0) {

                        let userCouponExists = await db.user.findOne({ _id: userId, 'coupons.couponName': code })
                        if (!userCouponExists) {
                            resolve({ discountAmount, couponTotal, total, success: ` ${code} ` + 'Coupon  Applied  SuccessFully' })
                        } else {
                            resolve({ status: true, err: "This Coupon Already Used" })
                        }
                    } else {
                        resolve({ status: false, err: 'coupon expired' })
                    }
                } else {
                    resolve({ status: false, err: "coupon does'nt exist" })
                }
            } catch (error) {
            }
        })
    },


    addCouponIntoUserDb: (couponData, userId) => {
        let couponObj = {
            couponstatus: true,
            couponName: couponData.couponName,

        }
        return new Promise(async (resolve, reject) => {

            try {
                let response = await db.user.updateOne({ _id: userId },
                    {
                        $push: {
                            coupons: couponObj
                        }
                    })
                resolve(response)
            } catch (err) {
                reject(err)
            }
        })

    },

findingCouponStatus: async (couponName)=>{
    try{

    let couponStatus=await db.user.findOne({'coupons.couponName':couponName},{'coupons.$':1})
      return couponStatus
    }catch(err){
        return(err)
    }
     

}

}