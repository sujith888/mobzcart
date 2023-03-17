
const userproductHelpers = require('../../helpers/UserHelpers/productHelpers')
const adminproductHelpers = require('../admincontroller/adminCategory')
const session = require('../usercontroller/usercontroller')
const user = require('../../models/connection')
const { response } = require('../../app')
const userhelpers = require('../../helpers/UserHelpers/UserHelpers')
const profileHelper = require('../../helpers/UserHelpers/profileHelper')
const cartHelper = require('../../helpers/UserHelpers/cartHelper')
const addressHelper = require('../../helpers/UserHelpers/addressHelper')
const userCategoryHelper = require('../../helpers/UserHelpers/categoryHelper')
const userCouponHelper = require('../../helpers/UserHelpers/couponHelper')
const orderHelper = require('../../helpers//UserHelpers/orderHelper')
const categoryHelper = require('../../helpers/UserHelpers/categoryHelper')
const db = require("../../models/connection");
const couponHelper = require('../../helpers/UserHelpers/couponHelper')

let couponTotal, couponName, discountAmount;
let wishCount, count, userSession;
module.exports = {



  // <---------------------------  starting of all product related controller mangement    -------------------------------------->            

  // cart,wishlist,shop,search, sort 
  // shop page 


  shopProduct: async (req, res) => {

    userSession = req.session.user

    let pageNum = req.query.page
    let perPage = 6

   let  documentCount = await userproductHelpers.productCount()

    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await userproductHelpers.getWishCount(req.session.user.id)

    let pages = Math.ceil((documentCount) / perPage)
    userproductHelpers.shopListProduct(pageNum, perPage).then((response) => {
      categoryHelper.getCategory().then((Category) => {
        let category = Category
        res.render('user/shop', { response, count, userSession, pages, category, wishCount })
      })
    }).catch((err) => {
      res.status(500).send(err)
    })

  },




  //image zoom


  imageZoom: async (req, res) => {

    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await userproductHelpers.getWishCount(req.session.user.id)
    userproductHelpers.imageZoom(req.params.id).then((response) => {
      let data = response
      res.render('user/image-zoom', { data, wishCount, count, userSession })
    }).catch((err) => {
      res.status(500).send(err)
    })
  },



  // get add-to-cart 

  addToCart: async (req, res) => {

    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await userproductHelpers.getWishCount(req.session.user.id)
    cartHelper.addToCartItem(req.params.id, req.session.user.id).then((response) => {
      res.json(response.status)

    }).catch((err) => {
      res.status(500).send(err)
    })

  },


  //list cart  page

  listCart: async (req, res) => {
    userSession = req.session.user
    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await userproductHelpers?.getWishCount(req.session.user.id)

    let userId = req.session.user
    let total = await orderHelper.totalCheckOutAmount(req.session.user.id)
    cartHelper.listAddToCart(req.session.user.id).then((cartItems) => {
      res.render('user/cart', { cartItems, total, userId, userSession, count, wishCount })
    }).catch((err) => {
      res.status(500).send(err)
    })
  },




  // change product quantityy //postchange productquantiity

  postchangeProductQuantity: async (req, res) => {

    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await userproductHelpers.getWishCount(req.session.user.id)
    await cartHelper.changeProductQuantity(req.body).then(async (response) => {
      response.total = await orderHelper.totalCheckOutAmount(req.body.user)
      res.json(response)
    })

  },


  //get deletecart



  getDeleteCart: (req, res) => {
    try {
      cartHelper.deleteCart(req.body).then((response) => {
        res.json(response)
      })
    } catch (err) {
      res.status(500).send(err)
    }
  },



  // wishlist

  wishList: (req, res) => {
    try {
      userproductHelpers.AddTowishList(req.query.wishid, req.session.user.id).then((response) => {
        res.json(response.status)

      })
    } catch (err) {
      res.status(500).send(err)
    }
  },

  ListWishList: async (req, res) => {

    userSession = req.session.user

    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await userproductHelpers.getWishCount(req.session.user.id)

    wishCount = await userproductHelpers.getWishCount(req.session.user.id)
    userproductHelpers.ListWishList(req.session.user.id).then((wishlistItems) => {
      res.render('user/wishlist', { wishlistItems, wishCount, userSession, count })

    }).catch((err) => {
      res.status(500).send(err)
    })
  },

  deleteWishList: (req, res) => {
    try {
      userproductHelpers.deleteWishList(req.body).then((response) => {

        res.json(response)

      })
    } catch (err) {
      res.status(500).send(err)
    }
  },


  /// product search 

  getSearch: async (req, res) => {

    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await userproductHelpers.getWishCount(req.session.user.id)

    let category = await categoryHelper.getCategory()
    // let pageNum = req.query.page
    // let perPage = 6

    // documentCount = await userproductHelpers.productCount()


    // let pages = Math.ceil((documentCount) / perPage)
    wishCount = await userproductHelpers.getWishCount(req.session.user.id)
    count = await cartHelper.getCartCount()
    userproductHelpers.productSearch(req.body).then((response) => {
      userSession = req.session.user
      res.render('user/shop-new', { response, category, userSession, wishCount, count })
    }).catch((err) => {
      res.render('user/shop-new', { err, category, userSession, wishCount, count })

    })
  },


  //  post  product sort

  postSort: async (req, res) => {
    wishCount = await userproductHelpers.getWishCount(req.session.user.id)
    let sortOption = req.body['selectedValue'];
    let category = await categoryHelper.getCategory()
    userproductHelpers.postSort(sortOption).then((response) => {
      res.render('user/shop-new', { response, category, userSession, wishCount, count })
    }).catch((err) => {
      res.status(500).send(err)
    })
  },




  //  <=============================ALL  Are  Order Releated  routes  =============================================>


  //get checkoutpage


  checkOutPage: async (req, res) => {


    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await userproductHelpers.getWishCount(req.session.user.id)
    let total;
    let users = req.session.user.id
    let cartItems = await cartHelper.listAddToCart(req.session.user.id)
    let DiscountAmount

    let couponpStatus = await couponHelper.findingCouponStatus(couponName)
    
    let status = couponpStatus?.coupons[0]?.couponstatus
    if (couponName && status===false) {
      total = couponTotal
      DiscountAmount = "-" + discountAmount
    } else {
      total = await orderHelper.totalCheckOutAmount(req.session.user.id)
      DiscountAmount = 0;
    }
    orderHelper.checkOutpage(req.session.user.id).then((response) => {

      res.render('user/checkout', { userSession, users, cartItems, total, response, wishCount, count, DiscountAmount })
    }).catch((err) => {
      res.status(500).send(err)
    })

  },



  //post checkout

  postcheckOutPage: async (req, res) => {
    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await userproductHelpers.getWishCount(req.session.user.id)
    let DiscountAmount;
    let grandtotal = await orderHelper.totalCheckOutAmount(req.session.user.id)
    if (couponName) {
      total = couponTotal

      DiscountAmount = discountAmount
    } else {
      total = await orderHelper.totalCheckOutAmount(req.session.user.id)

      DiscountAmount = 0;
    }
    let order = await orderHelper.placeOrder(req.body, total, DiscountAmount, grandtotal,couponName).then((response) => {
      if (req.body['payment-method'] ==='Cod') {

        res.json({ codstatus: true })

      } else {
          orderHelper.generateRazorpay(req.session.user.id, total).then((order) => {
            res.json(order);
          });
      
      }
    })
  },





  //get orderpage



  getOrderPage: async (req, res) => {

    userSession= req.session.user
    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await userproductHelpers?.getWishCount(req.session.user.id)
    orderHelper.orderPage(req.session.user.id).then((response) => {
      const getDate = (date) => {
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
          }`;
      };

      res.render('user/view-orderlist', { response, getDate, userSession, wishCount, count })
    }).catch((err) => {
      res.status(500).send(err)
    })

  },



  //post verifypayment



  postVerifyPayment: (req, res) => {
    orderHelper.verifyPayment(req.body).then(() => {

      orderHelper.changePaymentStatus(req.session.user.id, req.body['order[receipt]']).then(() => {
        res.json({ status: true })

      }).catch((err) => {
        res.json({ status: false, err })
      })

    })


  },





  // cancelorder

  putCancelOrder: (req, res) => {
    try {

      orderHelper.cancelOrder(req.query.orderid, req.session.user.id).then((response) => {

        res.json({ response })

      })
    } catch (err) {
      res.status(500).send(err)
    }
  },


  // RETURN ORDER



  postReturnOrder: (req, res) => {
  

      orderHelper.returnOrder(req.body,req.session.user.id).then((response) => {
        res.json(response);
      });
    
  },


  // order Details

  orderDetails: async (req, res) => {


    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await userproductHelpers.getWishCount(req.session.user.id)
    let details = req.query.order

    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
        }`;
    };

    orderHelper.viewOrderDetails(details).then(async (response) => {
      let grandTotal = await orderHelper.totalCheckOutAmount(req.session.user.id)

      let products = response.products[0]
      let address = response.address
      let orderDetails = response.details
      let data = await orderHelper.createData(response, getDate)
      res.render('user/order-list', { products, address, orderDetails, data, getDate, userSession, wishCount, count, grandTotal })

    }).catch((err) => {
      res.status(500).send(err)
    })

  },


  //order sucess


  orderSucess: async (req, res) => {
    try {
      count = await cartHelper.getCartCount(req.session.user.id)
      wishCount = await userproductHelpers.getWishCount(req.session.user.id)
      res.render('user/order-sucess', { userSession, wishCount, count })
    } catch (err) {
      res.status(500).send(err)
    }
  },




  //  <--------------------------------------------- Address Related routes ----------------------------------->

  //getaddresspage



  getAddresspage: async (req, res) => {
    try {
      count = cartHelper.getCartCount(req.session.user.id)
      wishCount = await userproductHelpers.getWishCount(req.session.user.id)
      userSession = req.session.user
      res.render('user/add-address', { userSession, wishCount, count })
    } catch (err) {
      res.status(500).send(err)
    }
  },



  //post addresspage



  postAddresspage: (req, res) => {

    addressHelper.postAddress(req.session.user.id, req.body).then((response) => {
      res.redirect('/check_out')
    }).catch((error) => {
      res.status(500).send(err)
    })



  },


  // For Profile  Mangement Also

  getAddress: async (req, res) => {
    try {
      count = cartHelper.getCartCount(req.session.user.id)
      wishCount = await userproductHelpers.getWishCount(req.session.user.id)
      let response = await orderHelper.checkOutpage(req.session.user.id);

      res.render("user/address", { response, userSession, wishCount, count });
    } catch (err) {
      res.status(500).send(err)
    }
  },


  // delete address

  deleteAddress: (req, res) => {
    addressHelper.deleteAddress(req.body).then((response) => {
      res.json(response);
    }).catch((err) => {
      res.status(500).send(err)
    })
  },


  getProfileAddAddress: async (req, res) => {
    try {
      count = cartHelper.getCartCount(req.session.user.id)
      wishCount = await userproductHelpers.getWishCount(req.session.user.id)
      res.render('user/add-address-profile', { userSession, wishCount, count })
    } catch (err) {
      res.status(500).send(err)
    }
  },


  postProfileAddAddress: async (req, res) => {

    try {
      let response = await addressHelper.postAddress(req.session.user.id, req.body)
      res.redirect('/view_address')
    } catch (err) {
      res.send(500).send(err)
    }
  },



  getEditAddAddress: async (req, res) => {

    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await userproductHelpers.getWishCount(req.session.user.id)
    addressHelper.editAddress(req.query.addressId).then((Response) => {
      let response = Response.Address[0]
      res.render('user/edit-address', { userSession, response })

    }).catch((err) => {
      res.status(500).send(err)
    })
  },



  postEditAddress: async (req, res) => {


    addressHelper.PostEditAddress(req.query.addressId, req.body).then((response) => {
     res.redirect('/view_address')
    }).catch((err) => {
      console.error(err)
      res.status(500).send('An error occurred')
    })
  },




  //  <=========================== category mangement ==================================>


  subCategory: async (req, res) => {
    userSession = req.session.user
    wishCount = await userproductHelpers.getWishCount(req.session.user.id)
    count = await cartHelper.getCartCount()
    let category = await categoryHelper.getCategory()
    categoryHelper.subCategory(req.query.sub).then((response) => {
      res.render('user/shop-new', { response, category, userSession, count, wishCount })
    }).catch((err) => {
      res.status(500).send(err)
    })

  },

    // display sub products 

    subProduct: async (req, res) => {
      try {
        let category = await categoryHelper.getCategory()
        categoryHelper.subProducts(req.query.subproductname).then((response) => {

          let sub = [response]

          res.render('user/sub-products', { sub, category, userSession, wishCount, count })
        })
      } catch (err) {
        res.status(500).send(err)
      }
    },


      // coupon mangement 

      validateCoupon: async (req, res) => {
        try {
          let code = req.query.couponName;
          let total = await orderHelper.totalCheckOutAmount(req.session.user.id)
          userCouponHelper.couponValidator(code, req.session.user.id, total).then((response) => {
            res.json(response)
          })
        } catch (err) {
          res.status(500).send(err)
        }

      },



        // post cart but this route is used for coupon management 


        postCart: async (req, res) => {

          let couponData = req.body
          couponName = req.body.couponName
          couponTotal = req.body.total
          discountAmount = req.body.discountAmount
          if (couponData.couponName) {
            await userCouponHelper.addCouponIntoUserDb(couponData, req.session.user.id).then((response) => {
              res.redirect("/check_out")
            }).catch((err) => {
              res.status(500).send(err)
            })
          } else {
            res.redirect('/check_out')
          }

        },


}