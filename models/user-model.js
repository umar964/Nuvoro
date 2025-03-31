const mongoose = require("mongoose");
 
 
 
const userSchema = new mongoose.Schema({
    fullname:{
        type:String,required:true
    },
    username:{
        type:String,required:true
    },
    email:{
        type:String,required:true
    },
    password:{
        type:String,required:true
    },
    isAdmin:
    {
        type:Boolean,default:false
    },
    profilePicture: {
        type: String,
        default: '/images/default-avatar.png'  
    }
   
   
 



});


module.exports = mongoose.model("user",userSchema);