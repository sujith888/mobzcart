

const db = require("../../models/connection");
const multer = require('multer');
const { response } = require("../../app");
const bcrypt = require('bcrypt');











module.exports = {

    // admin post sign in 


    postsignin: (data) => {
        return new Promise(async (resolve, reject) => {

 console.log(data);
            let hashedPassword = await bcrypt.hash(data.password, 10)

            const admindata = db.admin({
                name: data.name,
                password: hashedPassword,
                email: data.email,
                role: data.role

            })
            await admindata.save().then((response) => {
              console.log(response);
            resolve(response)
            })
        })
    },

    // post login h
    postlogin: (data) => {

        return new Promise(async (resolve, reject) => {
            try {

                let admin = await db.admin.findOne({ email: data.email })
                console.log(admin);
                if (admin) {
                    if (admin.blocked == false) {

                    await bcrypt.compare(data.password, admin.password).then((status) => {
                        if (status) {
                            let Name = admin.name
                            let id = admin._id
                            let role = admin.role
                            // response.status
                            resolve({ loggedinstatus: true, Name, id, role })

                        } else {
                          console.log('else');
                            resolve({ loggedinstatus: false })
                        }
                    })


                } else {
                    resolve({ loggedinstatus: false,blockedstatus:true })
                }
            }else{
              console.log('no admin');
             resolve({loggedinstatus: false})
            }
         } catch (err) {
            }
        })

    },

    // view admins 

    viewAdmins: () => {
        return new Promise(async (resolve, reject) => {
            await db.admin.find({ role: { $ne: "superadmin" } }).then((response) => {

                resolve(response)
            })

        })

    },

    blockAdmin:(adminid)=>{
        return new Promise(async(resolve, reject) => {
            await db.admin.updateOne({_id:adminid},{
                $set:{
                    blocked:true
                }
            }).then((response)=>{
                resolve(response)
            })
 
 
        })
    },



    unBlockAdmin:(adminid)=>{
        return new Promise(async(resolve, reject) => {
           
                await db.admin.updateOne({_id:adminid},{
                    $set:{
                        blocked:false
                    }
                }).then((response)=>{
                    resolve(response)
                })
     
            })

    
    },

    
  // dash board mangement helper functions 


  getOrderByDate: () => {
    return new Promise(async (resolve, reject) => {
      const startDate = new Date('2022-01-01');
      await db.order.find({ createdAt: { $gte: startDate } }).then((response) => {
        resolve(response)

      })
    });
  },

  // get all orders 

  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let order = await db.order.aggregate([
        { $unwind: '$orders' },

      ]).then((response) => {
        resolve(response)
      })

    })
  },


  getCodCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await db.order.aggregate([
        {
          $unwind: "$orders"
        },
        {
          $match: {
            "orders.paymentmode": "Cod"
          }
        },
      ])
      resolve(response)
    })
  },


  getOnlineCount: () => {
    return new Promise(async (resolve, reject) => {
      let response = await db.order.aggregate([
        {
          $unwind: "$orders"
        },
        {
          $match: {
            "orders.paymentmode": "online"
          }
        },
      ])
      resolve(response)
    })
  },

  totalUserCount: () => {

    return new Promise(async (resolve, reject) => {
      let response = await db.user.find().exec()

      resolve(response)

    })
  },

}