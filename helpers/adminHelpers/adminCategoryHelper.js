const db = require("../../models/connection");
const multer = require('multer');
const { response } = require("../../app");



module.exports = {

    //add category

    addCategory: (data) => {
        return new Promise(async (resolve, reject) => {

            let categories = await db.category.findOne({ categoryName: data.categoryname })


            if (categories) {

                await db.category.updateOne({ categoryName: data.categoryname },
                    {
                        '$push': {

                            subcategories: { subcategoryName: data.subcategoryname }
                        }
                    }).then((data) => {
                        resolve({data,categorystatus:true})
                    })

            } else {
                let categorysub = {
                    subcategoryName: data.subcategoryname
                }
                const categoryData = new db.category({
                    categoryName: data.categoryname,
                    subcategories: categorysub
                })
                await categoryData.save().then((data) => {
                    resolve({data,categorystatus:false})
                })
            }

        })

    },

    //view category

    viewAddCategory: () => {
        return new Promise(async (resolve, reject) => {
            await db.category.find().exec().then((response) => {
                resolve(response)

            })
        })
    },
    // delete category


    deleteCatogory: (CategoryId) => {
        return new Promise(async (resolve, reject) => {
            await db.category.deleteOne({ _id: CategoryId }).then((data) => {
                resolve(data)
            })
        })
    },

    // edit categoty

    editCategory: (editCategoryId) => {
        return new Promise(async (resolve, reject) => {
            await db.category.find({ _id: editCategoryId }).exec().then((response) => {
                resolve(response[0])
            })
        })
    },
    //post edit ctaegory

    postEditCategory: (editedId, editedData) => {
        return new Promise(async (resolve, reject) => {
            await db.category.updateOne({ _id: editedId }, { $set: { categoryName: editedData.editCategoryname, subcategories: { subcategoryName: editedData.editsubCategoryname } } }).then((response) => {
                resolve(response)
            })
        })
    },


     //  imported from view category

  viewAddCategory: () => {
    return new Promise(async (resolve, reject) => {
      await db.category.find().exec().then((response) => {

        resolve(response)

      })
    })
  },


  //  find subcategory
  findSubcategory: (categoryname) => {

    return new Promise(async (resolve, reject) => {
      let result = await db.category.findOne({ categoryName: categoryname }).then((response) => {
        resolve(response)
      })

      resolve(result)

    })
  },
}

