const db = require('../../models/connection')
const bcrypt = require('bcrypt');
const { response } = require("../../app");
const ObjectId = require('mongodb').ObjectId



module.exports = {

  // view category

  getCategory: () => {

    return new Promise(async (resolve, reject) => {
      try {
        await db.category.find().exec().then((Category) => {
          resolve(Category)
        })
      } catch (err) {
        reject(err)
      }
    })
  },


  subCategory: (categoryname) => {
    return new Promise(async (resolve, reject) => {
      try {
        let product = await db.product.find({ category: categoryname }).then((response) => {
          resolve(response)
        })

      } catch (err) {
        reject(err)
      }
    })
  },


  subProducts: (subCategoryname) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.product.findOne({ SubCategory: subCategoryname }).then((response) => {
          resolve(response)
        })
      } catch (err) {
        reject(err)
      }
    })
  },


}