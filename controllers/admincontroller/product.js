const { response } = require('../../app');
const adminProductHelpers = require('../../helpers/adminHelpers/adminProductHelpers');
const { category } = require('../../models/connection');
const user = require("../../models/connection");
const userProductControllers = require('../usercontroller/userProductControllers');
const couponHelper = require('../../helpers/adminHelpers/adminCouponHelpers')
const db = require('../../models/connection')
const adminOrderHelper = require('../../helpers/adminHelpers/adminOrderHelper');
const adminCategoryHelper = require('../../helpers/adminHelpers/adminCategoryHelper');
const bannerHelper = require('../../helpers/adminHelpers/bannerhelper');
let admins;
module.exports = {
  //get add product

  // <========================= All product related =======================================>


  getAddProduct: (req, res) => {
    admins = req.session.admin
    adminProductHelpers.getAddProduct().then((category) => {
      let response = category;
      let products = response[0]?.subcategories;
      res.render("admin/add-product", { layout: "adminLayout", response, admins, products });
    })

  },

  //post add product


  postAddProduct: (req, res) => {

    let image = req.files.map(files => (files.filename))

    adminProductHelpers.postAddProduct(req.body, image).then(() => {
      res.redirect('/admin/view_product')
    })

  },

  //getview product


  getViewproduct: (req, res) => {
    admins = req.session.admin
    adminProductHelpers.getViewProduct().then((response) => {
      res.render("admin/view-product", { layout: "adminLayout", response, admins });
    })

  },


  //edit view product

  editViewProduct: (req, res) => {
    admins = req.session.admin
    adminCategoryHelper.viewAddCategory().then((response) => {
      let procategory = response
      let category = procategory[0]

      adminProductHelpers.editProduct(req.query.edit).then((response) => {
        let editproduct = response
        res.render('admin/edit-viewproduct', { layout: "adminLayout", editproduct, procategory, admins });

      })
    })



  },

  //post edit addproduct


  postEditAddProduct: (req, res) => {
    const images = [];
    if (!req.files.image1) {
      let image1 = req.body.image1
      req.files.image1 = [{
        fieldname: 'image1',
        originalname: req.body.image1,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/uploads',
        filename: req.body.image1,
        path: `public\\uploads\\${image1}`,
      }]
    }
    if (!req.files.image2) {
      let image2 = req.body.image2
      req.files.image2 = [{
        fieldname: 'image2',
        originalname: req.body.image2,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/uploads',
        filename: req.body.image2,
        path: `public\\uploads\\${image2}`,
      }]
    }
    if (!req.files.image3) {
      let image3 = req.body.image3
      req.files.image3 = [{
        fieldname: 'image3',
        originalname: req.body.image3,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/uploads',
        filename: req.body.image3,
        path: `public\\uploads\\${image3}`,
      }]
    }
    if (!req.files.image4) {

      let image4 = req.body.image4
      req.files.image4 = [{
        fieldname: 'image4',
        originalname: req.body.image4,
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'public/uploads',
        filename: req.body.image4,
        path: `public\\uploads\\${image4}`,
      }]

    }

    if (req.files) {
      Object.keys(req?.files).forEach((key) => {
        if (Array.isArray(req?.files[key])) {
          req?.files[key]?.forEach((file) => {
            images.push(file.filename);
          });
        } else {
          images.push(req?.files[key]?.filename);
        }
      });
    }
    adminProductHelpers.postEditProduct(req.query.edit, req.body, images)
      .then(() => {
        res.redirect('/admin/view_product');
      })
      .catch((err) => {
        res.status(500).send('Internal server error');
      });
  },




  //delete view product 


  deleteViewProduct: (req, res) => {

    adminProductHelpers.deleteViewProduct(req.query.delete).then((response) => {
      res.redirect('/admin/view_product')
    })

  },


  // <================================================ Order Manegement ===============================>

  // get order list


  getOrderList: (req, res) => {


    adminOrderHelper.orderPage().then((response) => {
      const getDate = (date) => {
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();

        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
          } `;
      };
      admins = req.session.admin

      res.render('admin/order-List', { layout: 'adminLayout', response, getDate, admins })
    })
  },


  // get order details 


  getOrderDetails: async(req, res) => {

    let requestForReturn=await  adminOrderHelper.requestForReturn(req.query.orderid)
    adminOrderHelper.orderDetails(req.query.orderid).then((order) => {
      const getDate = (date) => {
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
          } `;
      };
      admins = req.session.admin
      let products = order.orders[0].productDetails
      let total = order.orders[0].totalPrice
      res.render('admin/order-details', { layout: 'adminLayout', order, products, total, getDate, admins,requestForReturn })
    })

  },

  // change user payments status

  postOrderDetails: (req, res) => {
    adminOrderHelper.changeOrderStatus(req.query.orderId, req.body).then((response) => {
      res.redirect('/admin/orders_list')
    })

  },



  //  order details for all  users  sepreate view button 


  orderPage: (req, res) => {
    admins = req.session.admin

    adminOrderHelper.OrderPage(req.query.userid).then((Response) => {
      let response = Response[0]?.orders
      res.render('admin/adminorder-list', { layout: 'adminLayout', response, admins })


    })

  },

  adminOrderDetails:async (req, res) => {
   
    let requestForReturn=await  adminOrderHelper.requestForReturn(req.query.orderid)
    adminOrderHelper.orderDetails(req.query.order).then((order) => {
      const getDate = (date) => {
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
          }`;
      };
      
      admins = req.session.admin
      let products = order?.orders[0]?.productDetails
      let total = order?.orders
        console.log(total);
      res.render('admin/admin-userViewOrderDetails', { layout: 'adminLayout', order, products, total, getDate, admins ,requestForReturn})
    })

  },



  // <===================================== Banner Related ===========================>

  getAddBanner: (req, res) => {

    let admins = req.session.admin
    res.render('admin/add-banner', { layout: 'adminLayout', admins })
  },
  postAddBanner: (req, res) => {

    bannerHelper.addBanner(req.body, req.file.filename).then((response) => {

      res.redirect('/admin/add_banner')

    })
  },

  //edit banner

  listBanner: (req, res) => {

    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
        }`;
    };
    bannerHelper.listBanner().then((response) => {

      admins = req.session.admin

      res.render('admin/list-banner', { layout: 'adminLayout', response, admins, getDate })

    })

  },



  //edit banner


  getEditBanner: (req, res) => {

    bannerHelper.editBanner(req.query.banner).then((response) => {

      res.render('admin/edit-banner', { layout: 'adminLayout', response, admins })

    })

  },

  // post edit banner 


  postEditBanner: (req, res) => {

    bannerHelper.postEditBanner(req.query.editbanner, req.body, req?.file?.filename).then((response) => {
      res.redirect('/admin/list_banner')

    })
  },




  //<====================================starting of coupon controller===========================================>

  //get coupon 


  getAddCoupon: (req, res) => {
    let admins = req.session.admin
    res.render('admin/add-coupon', { layout: "adminlayout", admins })
  },


  //post coupon 

  postAddCoupon: async (req, res) => {
    let coupon = await couponHelper.generateCoupon()

    couponHelper.postAddCoupon(req.body, coupon).then((response) => {

      res.redirect('/admin/add_coupon')


    })
  },


  //list coupon


  coupons: async (req, res) => {
    let coupon = await couponHelper.getCoupons();
    let admins = req.session.admin
    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
        }`;
    };
    res.render("admin/coupon", {
      layout: "adminLayout",
      coupon,
      admins,
      getDate,
    });

  },

  // delete coupons


  deleteCoupon: (req, res) => {
    couponHelper.deleteCoupon(req.query.couponId).then((response) => {
      res.json(response);
    });
  },




  // <========================================= Sales Report ===============================>


  //sales report

  getSalesReport: async (req, res) => {
    let admins = req.session.admin
    let report = await adminProductHelpers.getSalesReport()
    let Details = []

    report.forEach(orders => { Details.push(orders.orders) })
    // report.forEach(orders => {userdata.push( orders.orders.shippingAddress)})
    res.render('admin/sales-report', { layout: "adminLayout", Details, admins })


  },

  postSalesReport: (req, res) => {
    let Details = [];
    let admins = req.session.admin
    adminProductHelpers.postReport(req.body).then((orderdata) => {

      orderdata.forEach(orders => { Details.push(orders.orders) })

      res.render('admin/sales-report', { layout: "adminLayout", admins, Details })
    })


  },

}
