
const db = require("../../models/connection");
const multer = require('multer');
const { response } = require("../../app");
const bcrypt = require('bcrypt');
const ObjectId = require('mongodb').ObjectId

module.exports = {

  //view users order list

  orderPage: () => {
    return new Promise(async (resolve, reject) => {

      await db.order.aggregate([
        {
          $unwind: '$orders'
        },
        {
          $sort: { 'orders: createdAt': -1 }
        }
      ]).then((response) => {

        resolve(response)

      })
    })

  },


  // view order users order details



  orderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {

      let order = await db.order.findOne({ 'orders._id': orderId }, { 'orders.$': 1 })
      resolve(order)
    })

  },



  // change order status

  changeOrderStatus: (orderId, data) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.order.findOne({ 'orders._id': orderId }, { 'orders.$': 1 })

      let users = await db.order.updateOne(
        { 'orders._id': orderId },
        {
          $set: {
            'orders.$.OrderStatus': data.status,

          }
        }
      )
      resolve(response)
    })

  },


  OrderPage: (userId) => {
    return new Promise(async (resolve, reject) => {
      let response = await db.order.find({ userid: userId })

      resolve(response)

    })
  },


  requestForReturn: async (orderId) => {
    try {
      let returnRequest = await db.order.aggregate([
        { $unwind: "$orders" },
        { $match: { "orders._id": ObjectId(orderId) } },
        { $unwind: "$orders.returnOrder" },
        {
          $project: {
            _id: 0,
            returnDetails: "$orders.returnOrder"
          }
        },
        { $match: { "returnDetails.orderNumber": orderId} },


      ])

      // let returnRequest=await db.order.findOne({"orders[0].returnOrder.orderNumber":orderId},{'orders.$.returnOrder':1})
       return returnRequest
    } catch (err) {


    }
  }

}