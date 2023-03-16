const db = require('../../models/connection')
const bcrypt = require('bcrypt');
const { response } = require("../../app");
const ObjectId = require('mongodb').ObjectId



module.exports = {

  //post address




  postAddress: (userId, data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let addressInfo = {
          fname: data.fname,
          lname: data.lname,
          street: data.street,
          apartment: data.apartment,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          mobile: data.mobile,
          email: data.email,

        }



        let AddressInfo = await db.address.findOne({ userid: userId })
        if (AddressInfo) {


          await db.address.updateOne({ userid: userId },
            {
              "$push":
              {
                "Address": addressInfo

              }
            }).then((response) => {
              resolve(response)
            })



        } else {


          let addressData = new db.address({
            userid: userId,

            Address: addressInfo

          })

          await addressData.save().then((response) => {
            resolve(response)
          });
        }
      } catch (error) {

        reject(error)
      }

    })


  },


  deleteAddress: (Id) => {
    return new Promise((resolve, reject) => {
      try{
      db.address.updateOne(
        { _id: Id.deleteId },
        {
          $pull: { Address: { _id: Id.addressId } },
        }
      )
        .then((response) => {
          resolve({ deleteAddress: true });
        });

      }catch(err){
        reject(err)
      }
    });
  },



  editAddress: (addressId) => {

    return new Promise(async (resolve, reject) => {
      try{
      let address = await db.address.findOne({ 'Address._id': addressId }, { 'Address.$': 1 })
      resolve(address)
      }catch(err){
        reject(err)
      }
    })
  },

  PostEditAddress: (addressId, data) => {
    try {
      return new Promise(async(resolve, reject) => {
  
      let response = await db.address.updateOne(
        { "Address._id": addressId },
        {
          $set: {
            "Address.$.fname": data.fname,
            "Address.$.lname": data.lname,
            "Address.$.street": data.street,
            "Address.$.apartment": data.apartment,
            "Address.$.city": data.city,
            "Address.$.state": data.state,
            "Address.$.pincode": data.pincode,
            "Address.$.mobile": data.mobile,
            "Address.$.email": data.email,
          },
        }
      );
      resolve(response)
    })
     
    } catch (err) {
    }
  },
  

}