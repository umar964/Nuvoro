const isAdmin = (req,res,next)=>{
    if(req.user && req.user.isAdmin){
        return next();
    }else{
        res.send(" Sorry, only admin can access it");
    }
}

 
module.exports = isAdmin;