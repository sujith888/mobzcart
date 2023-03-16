
const db = require('../../models/connection')
const bcrypt = require('bcrypt');
const { response } = require("../../app");
const ObjectId = require('mongodb').ObjectId



module.exports = {



  //get cart count 

  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let count = 0;
        let cart = await db.cart.findOne({ user: userId })
        if (cart) {
          count = cart.cartItems.length
        }
        resolve(count)
      } catch (err) {
        reject(err)
      }
    })
  },

  // add to cart

  addToCartItem: (proId, userId) => {
    proObj = {
      productId: proId,
      Quantity: 1

    }
    return new Promise(async (resolve, reject) => {
      try {
        let carts = await db.cart.findOne({ user: userId })
        if (carts) {

          let productExist = carts.cartItems.findIndex(cartItems => cartItems.productId == proId)

          if (productExist != -1) {
            db.cart.updateOne({ 'user': userId, 'cartItems.productId': proId }, {
              $inc: { 'cartItems.$.Quantity': 1 }
            }).then((response) => {
              resolve({ response, status: false })

            })
          } else {

            await db.cart.updateOne({ user: userId },
              {
                "$push":
                {
                  "cartItems": proObj
                }
              }).then((response) => {
                resolve({ response, status: true })

              })
          }
        } else {
          let cartItems = new db.cart({
            user: userId,


            cartItems: proObj

          })
          await cartItems.save().then(() => {
            resolve({ status: true })
          });



        }
      } catch (err) {
        reject(err)
      }
    })
  },


  // list cart 

  listAddToCart: (userId) => {
    return new Promise(async (resolve, reject) => {

      try {
        const id = await db.cart.aggregate([
          {
            $match: {
              user: ObjectId(userId)
            }
          },
          {
            $unwind: '$cartItems'
          },


          {
            $project: {
              item: '$cartItems.productId',
              quantity: '$cartItems.Quantity'
            }
          },


          {
            $lookup: {
              from: 'products',
              localField: "item",
              foreignField: "_id",
              as: 'carted'
            }
          },
          {
            $project: {
              item: 1, quantity: 1, carted: { $arrayElemAt: ['$carted', 0] }
            }

          },

        ]).then((cartItems) => {

          resolve(cartItems)


        })

      } catch (err) {
        reject(err)
      }
    })
  },

  // delete cart 
  deleteCart: (data) => {
    return new Promise((resolve, reject) => {
      try {
        db.cart.updateOne({ '_id': data.cartId },
          {
            "$pull": { cartItems: { productId: data.product } }
          }
        ).then(() => {
          resolve({ removeProduct: true })
        })
      } catch (err) {
        reject(err)
      }
    })
  },

  // change product quantity



  changeProductQuantity: (data) => {

    count = parseInt(data.count)
    quantity = parseInt(data.quantity)
    return new Promise(async (resolve, reject) => {

     
        if (count === -1 && quantity == 1) {
          await db.cart.updateOne({ '_id': data.cart }, {
            $pull: { cartItems: { productId: data.product } }
          }).then(() => {
            resolve({ removeProduct: true })
          })
        }
        else {
            await db.cart.updateOne({ '_id': data.cart, 'cartItems.productId': data.product }, {
              $inc: { 'cartItems.$.Quantity': count }
            }).then(() => {
              resolve({ status: true })
            
            })
          
        }
     

    })


  },
}