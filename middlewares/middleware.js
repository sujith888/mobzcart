

let users= require("../models/connection")
    
  module.exports={
    auth:(function(req,res,next){
        if(req.session.adminloggedIn){
          next()
        }else{
          res.render('admin/login',{layout:'adminlayout'})
        }
       
      }),
      userauth:(function(req,res,next){
        if(req.session.loggedIn){
          next()
        }else{
          res.render('user/login')
        }
       
      }),
      userBlock:(async(req,res,next)=>{
        let userId =req.session.user.id
    let   user=  await users.user.findOne({_id:userId})
    console.log(user);
        if(!user.blocked){
    console.log('hi');
          next()
          
        }else{

          res.redirect('/logout')
        }
       
      }),
      userlandingauth:(function(req,res,next){
        if(req.session.loggedIn){
          next()
        }else{
          res.render('user/user')
        }
       
      }),
      
  }