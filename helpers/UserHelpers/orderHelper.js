const db = require('../../models/connection')
const bcrypt = require('bcrypt');
const { response } = require("../../app");
const ObjectId = require('mongodb').ObjectId
const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

//razorpay instance
var instance = new Razorpay({
    key_id: process.env.id,
    key_secret: process.env.secret_id

});


module.exports = {

    // total checkout amount 

    totalCheckOutAmount: (userId) => {
        return new Promise(async (resolve, reject) => {

            try {

                const id = await db.cart.aggregate([
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
            } catch (err) {
                reject(err)
            }
        })

    },




    //  get checkoutpage 



    checkOutpage: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.address.aggregate([
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

            } catch (err) {
                reject(err)
            }
        })
    },




    //  post checkout place order





    placeOrder: (orderData, total, DiscountAmount, grandTotal,couponName) => {
        return new Promise(async (resolve, reject) => {
            try {

             let insertCoupon= await db.user.updateOne({"coupons.couponName":couponName},{
                    $set:{
                        "coupons.$.couponstatus":true
                    }
                 })

                let productdetails = await db.cart.aggregate([
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




                //  inventory management 

                for (let i = 0; i < productdetails.length; i++) {
                    let response = await db.product.updateOne(
                        {
                            _id: productdetails[i]._id
                        },
                        {
                            $inc: {
                                Quantity: -productdetails[i].quantity
                            }
                        }
                    )

                }
                let Address = await db.address.aggregate([
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
                let status = orderData['payment-method'] === 'Cod' ? 'Placed' : 'Pending'
                let orderstatus = orderData['payment-method'] === 'Cod' ? 'Success' : 'Pending'
                let orderdata = {

                    name: orderaddress.fname,
                    paymentStatus: status,
                    paymentmode: orderData['payment-method'],
                    paymenmethod: orderData['payment-method'],
                    productDetails: productdetails,
                    shippingAddress: orderaddress,
                    OrderStatus: orderstatus,
                    totalPrice: total,
                    discountAmount: DiscountAmount,
                    grandTotal: grandTotal

                }


                let order = await db.order.findOne({ userid: orderData.user })

                if (order) {
                    await db.order.updateOne({ userid: orderData.user },
                        {
                            '$push':
                            {
                                'orders': orderdata
                            }
                        }).then((productdetails) => {

                            resolve(productdetails)
                        })
                } else {
                    let newOrder = db.order({
                        userid: orderData.user,
                        orders: orderdata
                    })

                    await newOrder.save().then((orders) => {
                        resolve(orders)

                    })
                }
                await db.cart.deleteMany({ user: orderData.user }).then(() => {
                    resolve()

                })
            } catch (err) {
                reject(err)
            }
        })
    },


    // generate Razorpay


    generateRazorpay: (userId, total) => {


        return new Promise(async (resolve, reject) => {
          let orders = await db.order.find({ userid: userId });
    
          let order = orders[0].orders.slice().reverse();
    
          let orderId = order[0]._id;
    
          total = total * 100;
    
          var options = {
            amount: Number(total),
            currency: "INR",
            receipt: "" + orderId,
          };
          instance.orders.create(options, function (err, order) {
            if (err) {
    
            } else {
    
              resolve(order);
    
            }
          });
        });
      },

    // view orderpage



    orderPage: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                await db.order.aggregate([{
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
            } catch (err) {
                reject(err)
            }
        })


    },



    // verify payment 



    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            try {
                const crypto = require('crypto')
                let hmac = crypto.createHmac('sha256', process.env.secret_id)
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
                let orders = await db.order.find({ userid: ObjectId(userId) });

                let ourorders = await db.order.findOne({ 'orders._id': orderId }, { 'orders.$': 1 })


                let users = await db.order.updateOne({ 'orders._id': orderId },
                    {
                        $set: {
                            'orders.$.OrderStatus': 'Success',
                            'orders.$.paymentStatus': 'Paid'
                        }
                    }

                )
                await db.cart.deleteMany({ user: userId });
                resolve();

            } catch (err) {

            }
        });
    },


    // delete order

    // for payament failure 
    deleteOrder: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const updatedUser = await user.order.updateMany({ userid: userId },
                    { $pull: { orders: { paymentStatus: 'pending' } } }
                );
                resolve(updatedUser);
            } catch (error) {
                reject(error);
            }
        });
    },

    // CANCEL ORDER


    cancelOrder: (orderId, userId) => {

        return new Promise(async (resolve, reject) => {
            try {
                let orders = await db.order.find({ 'orders._id': orderId })
                let orderIndex = orders[0].orders.findIndex(orders => orders._id == orderId)
                await db.order.updateOne({ 'orders._id': orderId },
                    {
                        $set:
                        {
                            ['orders.' + orderIndex + '.OrderStatus']: 'Cancelled'

                        }


                    }).then(async (orders) => {

                        resolve(orders)
                        let cancelledItems = await db.order.aggregate([
                            {
                                $unwind: '$orders'
                            },
                            {
                                $match: {
                                    "orders._id": ObjectId(orderId),
                                }
                            },
                            {
                                $unwind: "$orders.productDetails"
                            },
                            {
                                $project: {
                                    _id: 0,
                                    productDetails: "$orders.productDetails"
                                }
                            }

                        ]);



                        // after cancellation incermenting product quantity 

                        for (let i = 0; i < cancelledItems.length; i++) {
                            if (cancelledItems[i].productDetails.quantity !== undefined) { // Check if quantity is defined
                                let response = await db.product.updateOne(
                                    {
                                        _id: cancelledItems[i].productDetails._id
                                    },
                                    {
                                        $inc: {
                                            Quantity: cancelledItems[i].productDetails.quantity
                                        }
                                    }
                                );

                            }
                        }
                    })
            } catch (err) {
                reject(err)
            }
        })
    },




    // RETURN ORDER

    returnOrder: (Data) => {
        return new Promise(async (resolve, reject) => {
            try {
                let returnOrderDetails = {

                    orderNumber:Data.orderNumber,
                    returnReason: Data.reasonForReturn,
                    returnDate: Data.returnDate,
                    returnStatus: true,
                }
                let Orders = await db.order.findOne({ "orders._id":Data.orderNumber}, { "orders.$": 1 })

                if (Orders.orders[0].returnOrder.length===0) {
                    await db.order.updateOne(
                        { 'orders._id': Data.orderNumber },
                        {
                            "$push": {

                                'orders.$.returnOrder': returnOrderDetails
                            }
                        }
                    ).then(async () => {

                        resolve({ status: true,Message:'Return Form Has Been Submitted successfully With In 15 Days Refund Will Be Credited To Respective BankAccount ' })
                       
                        //   inventory mangement updation means here after the return incrementing the quantity

                        let returnedItems = await db.order.aggregate([
                            {
                                $unwind: '$orders'
                            },
                            {
                                $match: {
                                    "orders._id":ObjectId(orderId),
                                }
                            },
                            {
                                $unwind: "$orders.productDetails"
                            },
                            {
                                $project: {
                                    _id: 0,
                                    productDetails: "$orders.productDetails"
                                }
                            }

                        ]);


                        // after cancellation incermenting product quantity 

                        for (let i = 0; i < returnedItems.length; i++) {
                            if (returnedItems[i].productDetails.quantity !== undefined) {
                                let response = await db.product.updateOne(
                                    {
                                        _id: returnedItems[i].productDetails._id
                                    },
                                    {
                                        $inc: {
                                            Quantity: returnedItems[i].productDetails.quantity
                                        }
                                    }
                                );

                            }
                        }

                    })

                }else{
                    resolve({status:true,Message:"This Product Is Already Submited The Return Form & Wait For the Further Updates "})
                }

            } catch (err) {
                reject(err)
            }
        });
    },


    viewOrderDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {
            try {
                let productid = await db.order.findOne({ "orders._id": orderId }, { 'orders.$': 1 })

                let details = productid.orders[0]
                let order = productid.orders[0].productDetails

                const productDetails = productid.orders.map(object => object.productDetails);
                const address = productid.orders.map(object => object.shippingAddress);
                const products = productDetails.map(object => object)

                resolve({ products, address, details, })


            } catch (err) {
                reject(err)
            }
        })



    },

    // user invoice


    createData: (details, Dates) => {
        try {
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
                    address: "Kerala",
                    zip: "4567 CD",
                    city: "Palakkad",
                    country: "India",

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
                        quantity: product?.quantity,
                        description: product?.productsName,
                        "tax-rate": 0,
                        price: product?.productsPrice,
                        Total: product?.grandTotal,
                        subtotal: product?.grandTotal,
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
        } catch (err) {
        }
    },
}