
const { response, set } = require("../../app.js");
const { shopProduct } = require("../../controllers/usercontroller/userProductControllers.js");
const user = require("../../models/connection");
const ObjectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const razorpay = require('../../allKeys/razorpay')
const crypto = require('crypto');
const { resolve } = require("path");
const { log } = require("console");




//razorpay instance
var instance = new Razorpay({
  key_id: razorpay.id,
  key_secret: razorpay.secret_id

});







module.exports = {




  // shop page  document count 

  productCount: () => {
    return new Promise(async (resolve, reject) => {
      await user.product.find().countDocuments().then((documents) => {
      })
    })
  },




  //display shop and pagination

  shopListProduct: (pageNum, perPage) => {
    return new Promise(async (resolve, reject) => {
      await user.product.find().skip((pageNum - 1) * perPage).limit(perPage).then((response) => {


        resolve(response)
      })
    })
  },










  //image zoom


  imageZoom: (requestedId) => {
    return new Promise(async (resolve, reject) => {
      await user.product.findOne({ _id: requestedId }).then((response) => {
        resolve(response)
      })
    })
  },


  //post address




  postAddress: (userId, data) => {
    return new Promise(async (resolve, reject) => {

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



      let AddressInfo = await user.address.findOne({ userid: userId })
      if (AddressInfo) {


        await user.address.updateOne({ userid: userId },
          {
            "$push":
            {
              "Address": addressInfo

            }
          }).then((response) => {
            resolve(response)
          })



      } else {


        let addressData = new user.address({
          userid: userId,

          Address: addressInfo

        })

        await addressData.save().then((response) => {
          resolve(response)
        });
      }
    })

  },





  //  get checkoutpage 



  checkOutpage: (userId) => {
    return new Promise(async (resolve, reject) => {

      await user.address.aggregate([
        {
          $match: {
            userid: ObjectId(userId)
          }
        },
        {
          $unwind: '$Address'
        },

        {
          $project: {
            item: '$Address'

          }
        },

        {
          $project: {
            item: 1,
            Address: { $arrayElemAt: ['$Address', 0] }
          }
        }

      ]).then((address) => {


        resolve(address)
      })


    })
  },




  //  post checkout place order





  placeOrder: (orderData, total) => {
    return new Promise(async (resolve, reject) => {

      let productdetails = await user.cart.aggregate([
        {
          $match: {
            user: ObjectId(orderData.user)
          }
        },
        {
          $unwind: '$cartItems'
        },


        {
          $project: {
            item: '$cartItems.productId',
            quantity: '$cartItems.Quantity',

          }
        },


        {
          $lookup: {
            from: 'products',
            localField: "item",
            foreignField: "_id",
            as: 'productdetails'
          }
        },
        {
          $unwind: '$productdetails'
        },

        {
          $project: {
            image: '$productdetails.Image',
            category: '$productdetails.category',
            _id: "$productdetails._id",
            quantity: 1,
            productsName: "$productdetails.Productname",
            productsPrice: "$productdetails.Price",

          }
        }
      ])


      let Address = await user.address.aggregate([
        { $match: { userid: ObjectId(orderData.user) } },
        { $unwind: "$Address" },
        { $match: { 'Address._id': ObjectId(orderData.address) } },
        { $unwind: "$Address" },
        {
          $project: {
            item: "$Address"
          }
        },
      ])
      const items = Address.map(obj => obj.item);
      let orderaddress = items[0]
      let status = orderData['payment-method'] === 'COD' ? 'placed' : 'pending'
      let orderstatus = orderData['payment-method'] === 'COD' ? 'success' : 'pending'
      let orderdata = {

        name: orderaddress.fname,
        paymentStatus: status,
        paymentmode: orderData['payment-method'],
        paymenmethod: orderData['payment-method'],
        productDetails: productdetails,
        shippingAddress: orderaddress,
        OrderStatus: orderstatus,
        totalPrice: total

      }


      let order = await user.order.findOne({ userid: orderData.user })

      if (order) {
        await user.order.updateOne({ userid: orderData.user },
          {
            '$push':
            {
              'orders': orderdata
            }
          }).then((productdetails) => {

            resolve(productdetails)
          })
      } else {
        let newOrder = user.order({
          userid: orderData.user,
          orders: orderdata
        })

        await newOrder.save().then((orders) => {
          resolve(orders)
        })
      }
      await user.cart.deleteMany({ user: orderData.user }).then(() => {
        resolve()
      })

    })
  },

  // view orderpage



  orderPage: (userId) => {
    return new Promise(async (resolve, reject) => {

      await user.order.aggregate([{
        $match:
          { userid: ObjectId(userId) }
      },
      {
        $unwind: '$orders'
      },
      {
        $sort: { 'orders.createdAt': -1 }
      }
      ]).then((response) => {
        resolve(response)
      })
    })

  },


  // generate Razorpay



  generateRazorpay: (userId, total) => {

    return new Promise(async (resolve, reject) => {

      let orders = await user.order.findOne({ userid: userId })
      let order = orders.orders.slice().reverse()
      let orderId = order[0]._id

      total = total * 100
      var options = {
        amount: parseInt(total),
        currency: "INR",
        receipt: "" + orderId,
      }
      instance.orders.create(options, function (err, order) {
        if (err) {
        } else {

          resolve(order)
        }
      })

    })
  },



  // verify payment 



  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      try {
        const crypto = require('crypto')
        let hmac = crypto.createHmac('sha256', razorpay.secret_id)
        hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]'])
        hmac = hmac.digest('hex')
        if (hmac == details['payment[razorpay_signature]']) {
          resolve()
        } else {
          reject("not match")
        }
      } catch (err) {
      }
    })



  },

  //change payment status


  changePaymentStatus: (userId, orderId) => {

    return new Promise(async (resolve, reject) => {
      try {
        let orders = await user.order.find({ userid: ObjectId(userId) });

        let ourorders = await user.order.findOne({ 'orders._id': orderId }, { 'orders.$': 1 })


        let users = await user.order.updateOne(
          { 'orders._id': orderId },
          {
            $set: {
              'orders.$.OrderStatus': 'success',
              'orders.$.paymentStatus': 'paid'
            }
          }
        )
        await user.cart.deleteMany({ user: userId });
        resolve();

      } catch (err) {
        console.log(err)

      }
    });
  },



  // change product quantity



  changeProductQuantity: (data) => {

    count = parseInt(data.count)
    quantity = parseInt(data.quantity)
    return new Promise((resolve, reject) => {
      if (count == -1 && quantity == 1) {

        user.cart.updateOne({ '_id': data.cart }, {
          $pull: { cartItems: { productId: data.product } }
        }).then(() => {
          resolve({ removeProduct: true })

        })

      }
      else {

        user.cart.updateOne({ '_id': data.cart, 'cartItems.productId': data.product }, {
          $inc: { 'cartItems.$.Quantity': count }
        }).then(() => {
          resolve({ status: true })
        })
      }

    })


  },



  //delete cart



  deleteCart: (data) => {
    return new Promise((resolve, reject) => {

      user.cart.updateOne({ '_id': data.cartId },
        {
          "$pull": { cartItems: { productId: data.product } }
        }
      ).then(() => {
        resolve({ removeProduct: true })
      })

    })
  },


  // CANCEL ORDER


  cancelOrder: (orderId, userId) => {

    return new Promise(async (resolve, reject) => {

      let orders = await user.order.find({ 'orders._id': orderId })



      let orderIndex = orders[0].orders.findIndex(orders => orders._id == orderId)

      await user.order.updateOne({ 'orders._id': orderId },
        {
          $set:
          {
            ['orders.' + orderIndex + '.OrderStatus']: 'cancelled'

          }


        }).then((orders) => {
          resolve(orders)
        })

    })


  },

  // RETURN ORDER

  returnOrder: (orderId, userId) => {

    return new Promise(async (resolve, reject) => {

      let returnOrder = await user.order.updateOne(
        { 'orders._id': orderId },
        {
          "$set": {
            'orders.$.OrderStatus': 'Returned'

          }
        }
      )
        .then((orders) => {
          resolve(orders);
        });
    });
  },

  productSearch: (keyword) => {
    return new Promise(async (resolve, reject) => {
      try {
        const products = await user.product.findOne({ $text: { $search: keyword } });

        if (products) {
          resolve(products);
        } else {
          reject();
        }
      } catch (err) {
        reject(err);
      }
    });
  },


  // product sort

  postSort: (sortOption) => {
    return new Promise(async (resolve, reject) => {
      let products;
      if (sortOption === 'price-low-to-high') {

        products = await user.product.find().sort({ Price: 1 }).exec();
      } else if (sortOption === 'price-high-to-low') {

        products = await user.product.find().sort({ Price: -1 }).exec();
      } else {
        products = await user.product.find().exec();
      }
      resolve(products)
    })

  },


  viewOrderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {

      let productid = await user.order.findOne({ "orders._id": orderId }, { 'orders.$': 1 })

      let details = productid.orders[0]
      let order = productid.orders[0].productDetails

      const productDetails = productid.orders.map(object => object.productDetails);
      const address = productid.orders.map(object => object.shippingAddress);
      const products = productDetails.map(object => object)

      resolve({ products, address, details, })



    })



  },

  // view category

  getCategory: () => {

    return new Promise(async (resolve, reject) => {
      await user.category.find().exec().then((Category) => {
        resolve(Category)
      })

    })
  },

  subCategory: (categoryname) => {
    return new Promise(async (resolve, reject) => {
      let product = await user.product.find({ category: categoryname }).then((response) => {
        resolve(response)
      })


    })


  },

  subProducts: (subCategoryname) => {
    return new Promise(async (resolve, reject) => {

      await user.product.findOne({ SubCategory: subCategoryname }).then((response) => {
        resolve(response)
      })

    })
  },

  // wish list


  AddTowishList: (proId, userId) => {
    let proObj = {
      productId: proId
    };

    return new Promise(async (resolve, reject) => {
      let wishlist = await user.WishList.findOne({ user: userId });
      if (wishlist) {
        let productExist = wishlist.wishitems.findIndex(
          (item) => item.productId == proId
        );
        if (productExist == -1) {
          user.WishList.updateOne({ user: userId },
            {
              $addToSet: {
                wishitems: proObj
              },
            }
          )
            .then(() => {
              resolve({ status: true });
            });
        }

      } else {
        const newWishlist = new user.WishList({
          user: userId,
          wishitems: proObj
        });

        await newWishlist.save().then(() => {
          resolve({ status: true });
        });
      }
    });
  },

  // add to wish list
  ListWishList: (userId) => {
    return new Promise(async (resolve, reject) => {


      await user.WishList.aggregate([
        {
          $match: {
            user: ObjectId(userId)
          }
        },
        {
          $unwind: '$wishitems'
        },


        {
          $project: {
            item: '$wishitems.productId',
          }
        },


        {
          $lookup: {
            from: 'products',
            localField: "item",
            foreignField: "_id",
            as: 'wishlist'
          }
        },
        {
          $project: {
            item: 1, wishlist: { $arrayElemAt: ['$wishlist', 0] }
          }
        },
      ]).then((wishlist) => {
        resolve(wishlist)
      })
    })
  },

  getWishCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wishlist = await user.WishList.findOne({ user: userId })
      if (wishlist) {
        count = wishlist.wishitems.length
      }
      resolve(count)

    })
  },

  // delete wish list pos

  deleteWishList: (body) => {

    return new Promise(async (resolve, reject) => {

      let product = await user.WishList.updateOne({ _id: body.wishlistId },
        {
          "$pull":

            { wishitems: { productId: body.productId } }
        }).then(() => {
          resolve({ removeProduct: true })
        })


    })
  },

  // user invoice


  createData: (details, Dates) => {

    let address = details.address[0]
    let product = details.products[0][0]
    let orderDetails = details.details


    let myDate = Dates(orderDetails.createdAt)
    var data = {
      // Customize enables you to provide your own templates
      // Please review the documentation for instructions and examples
      customize: {
        //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
      },
      images: {
        // The logo on top of your invoice
        // logo: "https://freelogocreator.com/user_design/logos/2023/02/28/120325-medium.png",
        // The invoice background
        // background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
      },
      // Your own data
      sender: {
        company: "A 2 Z Ecommerce",
        address: "kerala",
        zip: "4567 CD",
        city: "Palakkad",
        country: "india",

      },
      // Your recipient
      client: {

        company: address.fname,
        address: address.street,
        zip: address.pincode,
        city: address.city,
        country: "India",
      },

      information: {
        number: address.mobile,
        date: myDate,
        "due-date": myDate
      },

      products: [
        {
          quantity: product.quantity,
          description: product.productsName,
          "tax-rate": 0,
          price: product.productsPrice,
        },
      ],
      // The message you would like to display on the bottom of your invoice
      "bottom-notice": "Thank you for your order from A 2  Z Ecommerce",
      // Settings to customize your invoice
      settings: {
        currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
        // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
        // "tax-notation": "gst", // Defaults to 'vat'
        // "margin-top": 25, // Defaults to '25'
        // "margin-right": 25, // Defaults to '25'
        // "margin-left": 25, // Defaults to '25'
        // "margin-bottom": 25, // Defaults to '25'
        // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
        // "height": "1000px", // allowed units: mm, cm, in, px
        // "width": "500px", // allowed units: mm, cm, in, px
        // "orientation": "landscape", // portrait or landscape, defaults to portrait
      },
      // Translate your invoice to your preferred language
      translate: {
        // "invoice": "FACTUUR",  // Default to 'INVOICE'
        // "number": "Nummer", // Defaults to 'Number'
        // "date": "Datum", // Default to 'Date'
        // "due-date": "Verloopdatum", // Defaults to 'Due Date'
        // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
        // "products": "Producten", // Defaults to 'Products'
        // "quantity": "Aantal", // Default to 'Quantity'
        // "price": "Prijs", // Defaults to 'Price'
        // "product-total": "Totaal", // Defaults to 'Total'
        // "total": "Totaal" // Defaults to 'Total'
      },
    };

    return data;
  },
  // total checkout amount 

  totalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {


      const id = await user.cart.aggregate([
        {
          $match: {
            user: ObjectId(userId)
          }
        },
        {
          $unwind: '$cartItems'
        },


        {
          $project: {
            item: '$cartItems.productId',
            quantity: '$cartItems.Quantity'
          }
        },


        {
          $lookup: {
            from: 'products',
            localField: "item",
            foreignField: "_id",
            as: 'carted'
          }
        },
        {
          $project: {
            item: 1, quantity: 1, product: { $arrayElemAt: ['$carted', 0] }
          }

        },
        {
          $group: {
            _id: null,
            total: { $sum: { $multiply: ["$quantity", "$product.Price"] } }
          }
        }

      ]).then((total) => {


        resolve(total[0]?.total)


      })

    })

  },
}





