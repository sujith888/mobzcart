const db = require("../../models/connection");
const bcrypt = require('bcrypt');
const { response } = require("../../app");
const ObjectId = require('mongodb').ObjectId

module.exports = {
  //sign up


  doSignUp: (userData) => {
    return new Promise(async (resolve, reject) => {

      try {
        email = userData.email;
        existingUser = await db.user.findOne({ email })
        if (existingUser) {
          return resolve({status:false})

        }
        else {
          let hashedPassword = await bcrypt.hash(userData.password, 10);
          const data = new db.user({

            username: userData.username,
            Password: hashedPassword,
            email: userData.email,
            phonenumber: userData.phonenumber,
          })

          await data.save(data).then((data) => {
            resolve({ data, status: true })
          })
        }
      }

      catch (err) {
      }


    })



  },

  //login


  doLogin: (userData) => {

    return new Promise(async (resolve, reject) => {
      try {
        let response = {}
        let users = await db.user.findOne({ email: userData.email })
        if (users) {
          if (users.blocked == false) {
            await bcrypt.compare(userData.password, users.Password).then((status) => {
              if (status) {
                userName = users.username
                id = users._id
                // response.status
                resolve({ response, loggedinstatus: true, userName, id })
              } else {
                resolve({ loggedinstatus: false })
              }
            })
          }
          else {
            resolve({ blockedStatus: true })
          }


        } else {
          resolve({ loggedinstatus: false })
        }
      } catch (err) {
      }
    })


  },



  findBanner:async()=>{
  
    let response=await  db.banner.find().exec()
      return response 
  },















  // subtotal: (userId) => {
  //   return new Promise(async (resolve, reject) => {


  //     const id = await user.cart.aggregate([
  //       {
  //         $match: {
  //           user: ObjectId(userId)
  //         }
  //       },

  //       {
  //         $unwind: '$cartItems'
  //       },


  //       {
  //         $project: {
  //           item: '$cartItems.productId',
  //           quantity: '$cartItems.Quantity'

  //         }
  //       },


  //       {
  //         $lookup: {
  //           from: 'products',
  //           localField: "item",
  //           foreignField: "_id",
  //           as: 'carted'
  //         }
  //       },
  //       {
  //         $project: {
  //           item: 1, quantity: 1,

  //           price: {
  //             $arrayElemAt: ['$carted.Price', 0]


  //           }
  //         },
  //       },
  //       {

  //         $project: {
  //           total: { $multiply: ["$quantity", "$price"] }
  //         }
  //       },



  //     ]).then((total) => {


  //       resolve(total)


  //     })
  //   })
  // },


}
