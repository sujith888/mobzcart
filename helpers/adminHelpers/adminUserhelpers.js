const multer= require('multer');
const { response } = require("../../app");
const bcrypt = require('bcrypt');
const db = require("../../models/connection");


module.exports={

 //get user 


 getUsers: () => { 
    return new Promise(async (resolve, reject) => {
        let userDatas = []
        await db.user.find().exec().then((result) => {
            userDatas = result
        })
        resolve(userDatas)
    })
},
//un block user


UnblockUser: (userID) => {
    return new Promise(async (resolve, reject) => {
        await db.user.updateOne({ _id: userID }, { $set: { blocked: false } })
        .then((data) => {
            resolve()
        })
       
    })

},
//    blockuser 

blockUser: (userID) => {
    return new Promise(async (resolve, reject) => {

        await db.user.updateOne({ _id: userID }, { $set: { blocked: true } })
            .then((data) => {
                resolve()
            })
           

    })

},


}
