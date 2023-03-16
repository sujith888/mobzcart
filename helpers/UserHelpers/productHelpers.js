
const { response, set } = require("../../app.js");
const { shopProduct } = require("../../controllers/usercontroller/userProductControllers.js");
const db = require("../../models/connection");
const ObjectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const razorpay = require('../../allKeys/razorpay')
const crypto = require('crypto');
const { resolve } = require("path");
const { log } = require("console");











module.exports = {

  // for best seller 

  bestSeller: () => {

    return new Promise(async (resolve, reject) => {
      await db.product.find().limit(4).then((response) => {

        resolve(response)

      })
    })
  },

  // shop page  document count 

  productCount: () => {
    return new Promise(async (resolve, reject) => {
      await db.product.find().countDocuments().then((documents) => {
        resolve(documents)
      })
    })
  },




  //display shop and pagination

  shopListProduct: (pageNum, perPage) => {
    return new Promise(async (resolve, reject) => {
      await db.product.find().skip((pageNum - 1) * perPage).limit(perPage).then((response) => {


        resolve(response)
      })
    })
  },










  //image zoom


  imageZoom: (requestedId) => {
    return new Promise(async (resolve, reject) => {
      await db.product.findOne({ _id: requestedId }).then((response) => {
        resolve(response)
      })
    })
  },


  productSearch: (searchData) => {
    let keyword = searchData.search
    return new Promise(async (resolve, reject) => {
      try {
        const products = await db.product.find({ Productname: { $regex: new RegExp(keyword, 'i') } });

        if (products.length > 0) {
          resolve(products);
        } else {
          reject('No products found.');
        }
      } catch (err) {
        reject(err);
      }
    });
  },


  // product sort

  postSort: (sortOption) => {
    return new Promise(async (resolve, reject) => {
      let products;
      if (sortOption === 'price-low-to-high') {

        products = await db.product.find().sort({ Price: 1 }).exec();
      } else if (sortOption === 'price-high-to-low') {

        products = await db.product.find().sort({ Price: -1 }).exec();
      } else {
        products = await db.product.find().exec();
      }
      resolve(products)
    })

  },




  // wish list


  AddTowishList: (proId, userId) => {
    let proObj = {
      productId: proId
    };

    return new Promise(async (resolve, reject) => {
      let wishlist = await db.WishList.findOne({ user: userId });
      if (wishlist) {
        let productExist = wishlist.wishitems.findIndex(
          (item) => item.productId == proId
        );
        if (productExist == -1) {
          db.WishList.updateOne({ user: userId },
            {
              $addToSet: {
                wishitems: proObj
              },
            }
          )
            .then(() => {
              resolve({ status: true });
            });
        }

      } else {
        const newWishlist = new db.WishList({
          user: userId,
          wishitems: proObj
        });

        await newWishlist.save().then(() => {
          resolve({ status: true });
        });
      }
    });
  },

  // add to wish list
  ListWishList: (userId) => {
    return new Promise(async (resolve, reject) => {


      await db.WishList.aggregate([
        {
          $match: {
            user: ObjectId(userId)
          }
        },
        {
          $unwind: '$wishitems'
        },


        {
          $project: {
            item: '$wishitems.productId',
          }
        },


        {
          $lookup: {
            from: 'products',
            localField: "item",
            foreignField: "_id",
            as: 'wishlist'
          }
        },
        {
          $project: {
            item: 1, wishlist: { $arrayElemAt: ['$wishlist', 0] }
          }
        },
      ]).then((wishlist) => {
        resolve(wishlist)
      })
    })
  },



  getWishCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wishlist = await db.WishList.findOne({ user: userId })

      if (wishlist) {
        count = wishlist?.wishitems?.length
      }
      resolve(count)

    })
  },

  // delete wish list 

  deleteWishList: (body) => {

    return new Promise(async (resolve, reject) => {

      let product = await db.WishList.updateOne({ _id: body.wishlistId },
        {
          "$pull":

            { wishitems: { productId: body.productId } }
        }).then(() => {
          resolve({ removeProduct: true })
        })


    })
  },



}





