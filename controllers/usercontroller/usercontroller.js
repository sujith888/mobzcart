const userhelpers = require('../../helpers/UserHelpers/UserHelpers')
const otpLogin = require('../../allKeys/otpLogin')
const client = require('twilio')(otpLogin.AccountSId, otpLogin.authtoken)
const db = require("../../models/connection");
const { log } = require('console');
const { cart } = require('../../models/connection');
const productHelpers = require('../../helpers/UserHelpers/userProductHelpers');
const profileHelper = require('../../helpers/UserHelpers/profileHelper')

const couponHelpers = require('../../helpers/adminHelpers/adminCouponHelpers')
const cartHelper = require('../../helpers/UserHelpers/cartHelper')
const addressHelper = require('../../helpers/UserHelpers/addressHelper')
const userCategoryHelper = require('../../helpers/UserHelpers/categoryHelper')
const couponHelper = require('../../helpers/UserHelpers/couponHelper')
const orderHelper = require('../../helpers//UserHelpers/orderHelper');
const userProductControllers = require('./userProductControllers');

let Number, wishCount, count, userSession, response, banner;

module.exports = {


  // user home page 


  getHome: async (req, res) => {

    userSession = req.session.user

    if (req.session.loggedIn) {
      response = await productHelpers.bestSeller()
      banner = await userhelpers.findBanner()
      wishCount = await productHelpers.getWishCount(req.session.user.id)
      count = await cartHelper.getCartCount(req.session.user.id)
      res.render('user/user', { userSession, count, wishCount, response, banner })

    } else {
      response = await productHelpers.bestSeller()
      banner = await userhelpers.findBanner()
      res.render('user/user', { userSession, count, wishCount, response, banner })

    }




  },
  // get user login


  getUserLogin: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect('/')
    } else {
      res.render("user/user-Dashboard")
    }
  },
  // post user login
  postUserLogin: (req, res) => {
    userhelpers.doLogin(req.body).then((response) => {
      req.session.loggedIn = true
      req.session.user = response

      let loggedinstatus = response.loggedinstatus
      let blockedStatus = response.blockedStatus

      if (loggedinstatus == true) {
        res.redirect('/')
      } else {

        res.render('user/login', { blockedStatus, loggedinstatus })

      }
    })

  },
  //get signup

  getSignUp: (req, res) => {
    emailStatus = true
    if (req.session.loggedIn) {
      res.redirect('/login')
    } else {
      res.render("user/signup"
      );
    }
  },
  //post sign up
  postSignUp: (req, res) => {
    userhelpers.doSignUp(req.body).then((response) => {

      let emailStatus = response.status
      if (emailStatus == false) {
        res.redirect('/login')
      } else {

        res.render('user/signup', { emailStatus })
      }

    })
  },
  //getuser logout


  getLogout: (req, res) => {

    req.session.user = null;
    req.session.loggedIn = false;

    res.redirect("/login");

  },





  //get otp page

  getOtp: (req, res) => {

    res.render('user/otp')
  },

  //post otp

  postOtp: async (req, res) => {
    Number = req.body.phonenumber;
    users = await user.user.find({ phonenumber: Number }).exec()
    if (users == false) {
      res.redirect('/login')
    } else {
      client.verify.v2
        .services(otpLogin.serviceId)
        .verifications.create({ to: `+91 ${Number}`, channel: "sms" })
        .then((verification) =>
          console.log(verification.status))
        .then(() => {
          const readline = require("readline").createInterface({
            input: process.stdin,
            output: process.stdout,
          })

        })

    }
    res.render('user/otpverify')
  },


  getVerify: (req, res) => {
    res.render('user/otpPage')
  },

  postVerify: (req, res) => {
    OtpNumber = req.body.number
    client.verify.v2
      .services(otpLogin.serviceId)
      .verificationChecks.create({ to: `+91 ${Number}`, code: OtpNumber })
      .then((verification_check) => {
        if (verification_check.valid) {
          res.redirect('/')
        } else {
          res.render('user/otpverify', { status: false })
        }

      }
      )

  },

  // <======================================= user profile mangement ========================>

  getProfile: async (req, res) => {
    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await productHelpers.getWishCount(req.session.user.id)
    let data = await profileHelper.findUser(req.session.user.id);
    res.render("user/profile", { userSession, data, wishCount, count });
  },



  updateProfile: (req, res) => {
    profileHelper.updateProfile(req.body, req.query.userId).then((data) => {
      res.json({ data });
    });
  },



  resetPassword: async (req, res) => {
    count = await cartHelper.getCartCount(req.session.user.id)
    wishCount = await productHelpers.getWishCount(req.session.user.id)
    let user = req.session.user.id;
    res.render("user/reset-password", { userSession, user, count, wishCount });
  },


  updatePassword: async (req, res) => {
    let passResponse = await profileHelper.verifyPassword(
      req.body,
      req.query.proId
    );
    if (passResponse) {
      res.json(true);
    } else {
      res.json(false);
    }
  },




}

