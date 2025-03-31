const jwt = require('jsonwebtoken');
// const userModel = require("./models/user-model");
const userModel = require("../models/user-model");

const isLoggedin = async (req,res,next)=>{
    if(!req.cookies.token){
      req.flash( "error_msg", "Access denied! Please log in or sign up to continue.")
        res.redirect("/login");
        return;
    } 

    try { const decoded  = jwt.verify(req.cookies.token,"ummi");
            const user = await userModel
            .findOne({email:decoded.email})
            .select("-password");
            
        if (!user) {
            res.send("User not found");
            return;
        }

        req.user = user;
       
        next();

        }
        catch(err){
            console.log(err);
        }
    
}
module.exports = isLoggedin;