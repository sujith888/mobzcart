var express = require("express");
const { getMaxListeners } = require("../app");
const adminController=require('../controllers/admincontroller/adminLogin')
const admincategorycontroller=require('../controllers/admincontroller/adminCategory')
const adminHelper=require('../helpers/adminHelpers/adminProductHelpers')
const adminusercontroller=require('../controllers/admincontroller/adminUsercontroller')
const adminproductcontroller=require('../controllers/admincontroller/product')
var router = express.Router();
const user = require("../models/connection");
const multer= require('multer');
const { doLogin } = require("../helpers/UserHelpers/UserHelpers");
const upload=require('../multer/multer')
const auths=require('../middlewares/middleware')
const check=require('../middlewares/admin-middleware');
const adminLogin = require("../controllers/admincontroller/adminLogin");



router.get("/signin",adminController.getsignin);

router.post("/signin",adminController.postsignin);

router.get("/",check.auth,auths.auth,adminController.getDashboard)

router.get("/login",check.auth,adminController.getAdminLogin);

router.post("/login",adminController.postAdminLogin)

router.get("/logout",check.auth,auths.auth,adminController.getAdminLogOut)
 
router.get("/view_users",check.auth,auths.auth,adminusercontroller.getViewUser)

router.get("/block_users",check.auth, adminusercontroller.getBlockUser)

router.get("/unblock_users", check.auth,adminusercontroller.getUnBlockUser)

router.get("/add_category",check.auth,admincategorycontroller.getCategory)

router.post("/add_category",check.auth,admincategorycontroller.postCategory)

router.get("/delete_category",check.auth,admincategorycontroller.deleteCategory)

router.get("/edit_category",check.auth,admincategorycontroller.editCategory)

router.post("/edit_category",check.auth,admincategorycontroller.postEditCategory)

router.get("/add_product",check.auth,adminproductcontroller.getAddProduct)

router.post("/add_product",check.auth,upload.uploads,adminproductcontroller.postAddProduct)

router.get("/view_product",check.auth,adminproductcontroller.getViewproduct)

router.get("/edit_product",check.auth,adminproductcontroller.editViewProduct)

router.post("/edit_product",check.auth,upload.editeduploads,adminproductcontroller.postEditAddProduct)

router.get("/delete_product",check.auth,adminproductcontroller.deleteViewProduct)

router.get("/orders_list", check.auth, adminproductcontroller.getOrderList)

router.get("/order_details", check.auth, adminproductcontroller.getOrderDetails)

router.post("/order_details", check.auth, adminproductcontroller. postOrderDetails)

router.get("/find_subcategory", check.auth, admincategorycontroller. findSubcategory)

router.get("/view_admin", check.auth, adminController.getViewAdmins)

router.put("/block_admin", check.auth, adminController.blockAdmin)

router.put("/unblock_admin", check.auth, adminController.unBlockAdmin)

router.get("/order_page", check.auth, adminproductcontroller. orderPage)

router.get("/adminorder_details", check.auth, adminproductcontroller.adminOrderDetails)

router.get("/add_banner",check.auth, adminproductcontroller.getAddBanner)

router.post("/add_banner",upload.addBannerupload,check.auth, adminproductcontroller.postAddBanner)

router.get("/list_banner",check.auth, adminproductcontroller.listBanner)

router.get("/edit_banner",check.auth, adminproductcontroller.getEditBanner)

router.post("/edit_banner",upload.editBannerupload,check.auth, adminproductcontroller.postEditBanner)

router.get('/sales_report',check.auth,adminproductcontroller.getSalesReport)

router.post('/sales_report',check.auth, adminproductcontroller.postSalesReport)

router.get('/add_coupon',check.auth, adminproductcontroller.getAddCoupon)

router.post('/add_coupon',check.auth, adminproductcontroller.postAddCoupon)

router.get("/list_coupons", check.auth, adminproductcontroller.coupons);

router.delete("/coupon_delete",check.auth, adminproductcontroller.deleteCoupon);
























module.exports = router;
