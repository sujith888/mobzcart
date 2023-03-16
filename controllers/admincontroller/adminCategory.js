const { response } = require('../../app');
const adminCategoryHelper= require('../../helpers/adminHelpers/adminCategoryHelper');
const { category } = require('../../models/connection');
const db = require("../../models/connection");
const adminOrderHelper=require('../../helpers/adminHelpers/adminOrderHelper');



module.exports={
    
//get method category
getCategory:(req, res)=>{
    let admins=req.session.admin
    adminCategoryHelper.viewAddCategory().then((response)=>{
     var viewCategory=response
     let sub=response[0]?.subcategories
      res.render("admin/add-category", { layout: "adminLayout" ,viewCategory,admins,sub});
    })
    
  },
  //post method category
  
  postCategory:async(req, res)=>{
    
    let admins=req.session.admin
      let response=await   adminCategoryHelper.viewAddCategory()
          var viewCategory=response
          let sub=response[0]?.subcategories
      adminCategoryHelper.addCategory(req?.body).then((data)=>{
     let categoryStatus=data.categorystatus
     res.render("admin/add-category", { layout: "adminLayout" ,categoryStatus,viewCategory,sub,admins});


    })
     
  },
  //deletecategory
  
  deleteCategory:(req,res)=>{
      
    adminCategoryHelper.deleteCatogory(req.query.deletedid).then((response)=>{
      res.redirect('/admin/add_category')
    })
  },
  //getedit category
  
  editCategory:(req,res)=>{
    let admins=req.session.admin
     adminCategoryHelper.editCategory(req.query.edited).then((response)=>{
      res.render('admin/edit_category',{layout:"adminLayout",response,admins})
     })
  },
  //postedit category
  
  postEditCategory:(req,res)=>{
 x
     adminCategoryHelper.postEditCategory(req.query.edited,req.body).then((response)=>{
  
      res.redirect('/admin/add_category')
     })
    
  },
 
  
  
  findSubcategory: (req, res) => {

    adminCategoryHelper.findSubcategory(req.query.categoryName).then((response) => {
      let subcategories = response.subcategories
      res.json(subcategories)

    })
  },

}