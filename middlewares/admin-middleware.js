     Permission={

    "superadmin": ["/","/view_users","/unblock_users","/add_category","/delete_category","/edit_category","/add_product","/order_details",
    "/view_product","/edit_product","/delete_product","/orders_list","/find_subcategory","/login","/view_admin","/block_admin","/unblock_admin","/logout","/adminorder_details",
    "/order_page","/add_banner","/list_banner","/edit_banner","/block_users","/unblock_users",'/sales_report',"/add_coupon",'/list_coupons',"/coupon_delete"],
    "admin1": ["/orders_list", "/order_details","/login","/","/logout"],
    "admin2": ["/add_product", "/view_product", "/edit_product","/login","/","/delete_product","/logout"]

  },


module.exports={
 
    auth:function checkAccess(req, res, next) {
      if(req.session.adminloggedIn) {
       let  role = req.session.admin.role;
        console.log(req.session.admin.role+"hlo");
        let currentPage = req.path;
        console.log( currentPage);
      
        if (Permission[role].includes(currentPage)) {
          next();
        } else {
            res.status(401).send("Unauthorized");
        }
    }else{
      res.render('admin/login',{layout:'adminlayout'});
    }
  }
}