const db = require("../../models/connection");
const multer = require('multer');
const { response } = require("../../app");
const { product } = require("../../models/connection");
const ObjectId = require('mongodb').ObjectId




module.exports = {



  //get add product

  getAddProduct: () => {
    return new Promise(async (resolve, reject) => {
      await db.category.find().exec().then((response) => {

        resolve(response)
      })
    })
  },

  //post add product

  postAddProduct: (userdata, filename) => {
    return new Promise((resolve, reject) => {




      ImageUpload = new db.product({
        Productname: userdata.name,
        ProductDescription: userdata.description,
        Quantity: userdata.quantity,
        Image: filename,
        SubCategory: userdata.subcategory,
        category: userdata.category,
        Price: userdata.price



      })
      ImageUpload.save().then((data) => {

        resolve(data)

      })
    })


  },
  //get view product

  getViewProduct: () => {

    return new Promise(async (resolve, reject) => {
      await db.product.find().exec().then((response) => {

        resolve(response)

      })
    })
  },



  //delete view product


  deleteViewProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.product.deleteOne({ _id: productId }).then((response) => {
        resolve(response)
      })
    })
  },


  //edit product

  editProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.product.findOne({ _id: productId }).exec().then((response) => {
        resolve(response)


      })
    })
  },


  //post editproduct


  postEditProduct: (productId, editedData, images) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await db.product.updateOne(
          { _id: productId },
          {
            $set: {
              Productname: editedData.name,
              ProductDescription: editedData.description,
              Quantity: editedData.quantity,
              Price: editedData.price,
              category: editedData.category,
              SubCategory: editedData.subcategory,
              Image: images
            }
          }
        );
        resolve(response);
      } catch (err) {
        reject(err);
      }
    });
  },

  // <============================== Sales Report =============================>

  // sales report

  getSalesReport: async () => {
    return new Promise(async (resolve, reject) => {
      let response = await db.order.aggregate([
        {
          $unwind: "$orders"
        },
        {
          $match: {
            "orders.OrderStatus": "Delivered"
          }
        },
      ])
      resolve(response)
    })
  },

  // post sale report


  postReport: (date) => {
    let start = new Date(date.startdate);
  let end = new Date(date.enddate);

  return new Promise(async(resolve, reject) => {
  await db.order.aggregate([
  {
    $unwind: "$orders",
  },
  {
    $match: {
      $and: [
        { "orders.OrderStatus": "Delivered" },
        {"orders.createdAt": { $gte: start, $lte: end }}
        
      ]
    }
  }
])
  .exec()
  .then((response) => {
    resolve(response)
  })
})

  },
 


}



