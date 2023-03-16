
const db = require("../../models/connection");
const multer = require('multer');
const { response } = require("../../app");
const bcrypt = require('bcrypt');


module.exports={




  

  // add banner

  addBanner: (texts, Image) => {

    return new Promise(async (resolve, reject) => {

      let banner = db.banner({
        title: texts.title,
        description: texts.description,
        link: texts.link,
        image: Image,
        page:texts.page
      })
      await banner.save().then((response) => {
        resolve(response)
      })
    })
  },

  /// list banner
  listBanner: () => {

    return new Promise(async (resolve, reject) => {
      await db.banner.find().exec().then((response) => {
        resolve(response)
      })
    })
  },

  // edit banner

  editBanner: (bannerId) => {

    return new Promise(async (resolve, reject) => {

      let bannerid = await db.banner.findOne({ _id: bannerId }).then((response) => {
        resolve(response)
      })

    })

  },

  //post edit banner

  postEditBanner: (bannerid, texts, Image) => {

    return new Promise(async (resolve, reject) => {

      let response = await db.banner.updateOne({ _id: bannerid },
        {
          $set: {

            title: texts.title,
            description: texts.description,
            // created_at: updated_at,
            link: texts.link,
            image: Image,
            page:texts.page
          }

        })
      resolve(response)
    })

  },



}







