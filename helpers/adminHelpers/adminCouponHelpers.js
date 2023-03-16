

const voucher_codes = require('voucher-code-generator');
const { response } = require('../../app');
const { user } = require('../../models/connection');
const db = require('../../models/connection')

module.exports = {


    generateCoupon: () => {
        return new Promise(async (resolve, reject) => {

            try {
                let couponCode = await voucher_codes.generate({
                    length: 6,
                    count: 1,
                    charset: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                    prefix: "A2Z",
                })

                resolve({ couponCode: couponCode[0] })
            } catch (err) {
            }
        })
    },

    postAddCoupon: (data, generatedCoupon) => {
        return new Promise(async (resolve, reject) => {
            let coupons = generatedCoupon.couponCode
            let coupon = db.coupon({
                couponName: coupons,
                expiry: data.validity,
                minPurchase: data.minAmount,
                discountPercentage: data.discount,
                maxDiscountValue: data.maxdiscount,
                description: data.description,

            })
            await coupon.save().then((response) => {
                resolve(response)
            })
        })

    },

   

    getCoupons: () => {
        return new Promise(async(resolve, reject) => {
          try {
            await db.coupon.find({}).then((data) => {
              resolve(data);
            });
          } catch (error) { }
        });
      },
    deleteCoupon: (couponId) => {
        return new Promise(async (resolve, reject) => {
          await db.coupon.deleteOne({ _id: couponId }).then((response) => {
            resolve(response);
          });
        });
      },
}