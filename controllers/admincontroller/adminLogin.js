const { response } = require('../../app');
const adminProductHelpers = require('../../helpers/adminHelpers/adminProductHelpers');
const adminUserhelper = require('../../helpers/adminHelpers/adminUserhelpers');
const { category, product } = require('../../models/connection');
const user = require("../../models/connection");
const adminLoginHelper = require('../../helpers/adminHelpers/adminLoginhelpers');




let admins;

module.exports = {

  // get login

  getAdminLogin: (req, res) => {
    admins = req.session.admin
    if (req.session.adminloggedIn) {
      res.redirect('/admin')
    } else {

      res.redirect('/admin/login')
    }

  },


  postAdminLogin: (req, res) => {

    //   if(req.body.email==adminCredential.email && req.body.password==adminCredential.password){

    //   req.session.adminloggedIn=true

    //   req.session.admin=adminCredential

    //   
    // }

    //   else{
    //     adminloginErr=true
    adminLoginHelper.postlogin(req.body).then((response) => {
      req.session.adminloggedIn = true
      req.session.admin = response
      let status = response.loggedinstatus

      if (status == true) {
        res.redirect('/admin')
      } else {
        res.render('admin/login', { layout: 'adminLayout' })
      }


    })

    // }
  },

  //get dashboard

  getDashboard: async (req, res) => {

      let admins = req.session.admin

      let totalProducts, days = []
      let ordersPerDay = {};
      let paymentCount = [];

      let Products = await adminProductHelpers.getViewProduct()

      totalProducts = Products.length

      let orderByCod = await adminLoginHelper.getCodCount()

      let codCount = orderByCod.length
      let orderByOnline = await adminLoginHelper.getOnlineCount()
      let totalUser = await adminLoginHelper.totalUserCount()

      let totalUserCount = totalUser.length

      let onlineCount = orderByOnline.length;


      paymentCount.push(onlineCount)
      paymentCount.push(codCount)

      await adminLoginHelper.getOrderByDate().then((response) => {
        const result = response.map(item => item.orders).flat();
        result.forEach((order) => {
          const ans = {
            createdAt: order.createdAt,
          };
          days.push(ans);
        });



        days.forEach((order) => {
          const day = order.createdAt.toLocaleDateString('en-US', { weekday: 'long' });
          ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;
        });

      })


      await adminLoginHelper.getAllOrders().then((response) => {
        var length = response.length
      
        let total = 0;

        for (let i = 0; i < length; i++) {
          total += response[i]?.orders?.totalPrice;
        }

        res.render("admin/admin-dashboard", { layout: "adminLayout", admins, length, total, totalProducts, ordersPerDay, paymentCount, totalUserCount });

      })

    

  },

  //admin logout

  getAdminLogOut: (req, res) => {
    if (req.session.adminloggedIn) {
      req.session.adminloggedIn = false
      res.redirect('/admin/login')
    }
  },

  // get sign in 


  getsignin: (req, res) => {

    res.render('admin/admin-signup', { layout: "adminLayout" })
  },


  // post sign in 


  postsignin: (req, res) => {
    adminLoginHelper.postsignin(req.body).then((response) => {

    })
    // res.render('admin/admin-signup',{layout: "adminLayout"})
  },

  // list admins get admins

  getViewAdmins: (req, res) => {

    adminLoginHelper.viewAdmins().then((response) => {
   admins=req.session.admin
      let admin = response
      res.render('admin/view-admins', { layout: "adminLayout", admin, admins })

    })

  }
  ,

  // <----------------------------------- admins related ==============================>

  blockAdmin: (req, res) => {
    adminLoginHelper.blockAdmin(req.query.adminId).then((response) => {
      res.json(response)

    })

  },


  unBlockAdmin: (req, res) => {

    adminLoginHelper.unBlockAdmin(req.query.adminId).then((response) => {

      res.json(response)

    })
  },

}






