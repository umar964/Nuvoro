const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const pdfkit  = require('pdfkit');
const moment = require('moment');
 const Razorpay = require('razorpay');
 const flash = require("connect-flash");
const sharp  = require("sharp");
 
 const bodyParser = require('body-parser');

 
 
 
 
const db = require("./config/mongoose-connection");
const isLoggedIn = require("./middleware/Auth");
const isAdmin = require("./middleware/admin");
const upload = require("./config/multer");
 
const userModel = require("./models/user-model");
const productModel = require("./models/product-model");
const Cart = require("./models/cart-model");
const Order = require("./models/order-model");
 
const { generatePrimeSync } = require('crypto');
const { type } = require('os');
const { Http2ServerRequest } = require('http2');

 
const app = express();
app.use(bodyParser.json());
 
 

 

 
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use(session({
    secret: 'ummi',  
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
})); 



app.use((req, res, next) => {
    
    if (req.session.user) {
        res.locals.user = req.session.user;
       
    } else   {
        res.locals.user = null;
       
    }
    next();
});


app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});
require("dotenv").config();
 


//  app.get("/otp",(req,res)=>{
//     res.render("otp");
//  });


// app.post("/send-otp",async(req,res)=>{
// const {email} = req.body;
// console.log(email);

// if(!email){
//     console.log("Email is required");
// }else{

// const otp = generateOTP();
// const token = generateToken(otp);
// try{
//    await sendOTP(email,otp);
//    console.log("otp send successfully",token);
// }catch(err){
//     console.log("Failed to send otp",err);
    
// }
// }

//  });


//  app.post("/verify-otp",async(req,res)=>{
//     const {token,otp} = req.body;
//     if(!token || otp){
//         console.log("Token and otp is required");
//     }
//     const isValid = verifyOtp(token,otp);
//     if(isValid){
//         console.log("Otp verified successfully");
//     }else{
//         console.log("Otp invalid"); 
//     }
//  })
  
 

// app.get("/zoom", (req,res)=>{
//     res.render("zoom");
// });
// app.get("/rotate", (req,res)=>{
//     res.render("rotate");
// });
// app.get("/video",(req,res)=>{
//     res.render("video");
// });






 
 
 
 
const instance = new Razorpay({
  key_id: 'rzp_test_UStpNiJ9RhDoDS',    
  key_secret: '18MsDJ6u0SuC1WjbfSXD5x1Y'   
});

app.get("/pay",(req,res)=>{
    res.render("pay-page");
});

 
 

 

 
 






app.get('/', async (req, res) => {

     const shirtandtshirt = await productModel.find({page:'shirt&tshirt'});
     const pants = await productModel.find({page:'pant'});
     const  sneakers = await productModel.find({page:'sneaker'});
     const  watches = await productModel.find({page:'watch'});
     
     const generateRandomPositions = (count) => {
        return Array.from({ length: count }, () => ({
            top: Math.random() * 80,   
            left: Math.random() * 80    
        }));
    };

    const randomPositionsPants = generateRandomPositions(pants.length);
   
    shirtandtshirt.forEach(product => {
        if (!product.originalPrice) {
            product.originalPrice = product.price / (1 - product.discount / 100);
        }
        
    });

    pants.forEach(product => {
        if (!product.originalPrice) {
            product.originalPrice = product.price / (1 - product.discount / 100);
        }
        
    });

    sneakers.forEach(product => {
        if (!product.originalPrice) {
            product.originalPrice = product.price / (1 - product.discount / 100);
        }
        
    });
     watches.forEach(product => {
        if (!product.originalPrice) {
            product.originalPrice = product.price / (1 - product.discount / 100);
        }
        
    });
     
    
   
    
    res.render("frontpage", {
        sneakers,
        pants,
        shirtandtshirt,
        watches,
        randomPositionsPants,
        isAdmin: req.user && req.user.isAdmin,
    });
     
    
});


app.get("/shop-page", async (req, res) => {

    const shirtandtshirt = await productModel.find({page:'shirt&tshirt'});
    const pants = await productModel.find({page:'pant'});
    const  sneakers = await productModel.find({page:'sneaker'});
    const  watches = await productModel.find({page:'watch'});
   
    
   shirtandtshirt.forEach(product => {
       if (!product.originalPrice) {
           product.originalPrice = product.price / (1 - product.discount / 100);
       }
       
   });

   pants.forEach(product => {
       if (!product.originalPrice) {
           product.originalPrice = product.price / (1 - product.discount / 100);
       }
       
   });

   sneakers.forEach(product => {
       if (!product.originalPrice) {
           product.originalPrice = product.price / (1 - product.discount / 100);
       }
       
   });
    watches.forEach(product => {
       if (!product.originalPrice) {
           product.originalPrice = product.price / (1 - product.discount / 100);
       }
       
   });


    
   res.render("shop-page",{ sneakers, pants, shirtandtshirt,watches});
});


app.get('/aboutroute',   async (req, res) => {
    res.render("about");
   
});


 



app.get('/signup', async  (req, res) => {
    res.render("signup");
    // const email = req.body;
   
});

 
app.post("/signup",async(req,res)=>{
    const { fullname,username, email, password,confirmpassword } = req.body;
     try{
        if(password !== confirmpassword){
             console.log("Both password are not same");
             return
        }
        const user = await userModel.findOne({email});
        if(user){
             console.log("user already created . please login");
             return
        }else{
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
    
            const createdUser = await userModel.create({
                fullname,
                username,
                email,
                password: hash
            });
            req.session.user = createdUser;
            console.log(createdUser);
    
    
            let token = jwt.sign({ email }, "ummi");
            res.cookie("token", token);
      
            res.send("User created successfully");
            console.log(user);

        }
     }catch(err){
        console.log(err);
     }
})
 
app.post("/my-account", isLoggedIn, async (req, res) => {
    const { fullname, username, email, currentPassword, newPassword } = req.body;

    try {
        // Find the user by their ID
        const user = await userModel.findById(req.user._id);

        // Update user details (fullname, username, email)
        user.fullname = fullname || user.fullname;
        user.username = username || user.username;
        user.email = email || user.email;

        // Only check the current password and update if the user provided a new password
        if (newPassword) {
            if (currentPassword) {
                // Compare the current password with the hashed password
                const isMatch = await bcrypt.compare(currentPassword, user.password);
                
                if (isMatch) {
                    //  Hash the new password
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(newPassword, salt);
                    console.log("Password updated successfully");
                } else {
                    return res.send("Current password is wrong"); 
                }
            } else {
                return res.send("Please provide the current password to update your password.");
            }
        }

        // Save the updated user details
        await user.save();
        req.flash('success_msg', 'Profile updated successfully');
        
        res.redirect("/myaccount");

    } catch (err) {
        console.error("Error during updating user account", err);
        res.status(500).send('Server error');
    }
});


app.get("/admin-create-route",isLoggedIn,isAdmin,async(req,res)=>{
    res.render("admin-create-page");
});

app.post("/admin-create-route",isLoggedIn,isAdmin, async(req,res)=>{
const { fullname,username, email, password} = req.body;
// console.log(username);
console.log(password);
 try{
    let user = await userModel.findOne({email});
    console.log("1stuser",user);
    if(!user){
        const hashedPassword = await bcrypt.hash(password, 10);
        user = new userModel({
             fullname,
             username,
             email,
             password:hashedPassword,
            isAdmin:true
    
        });
        await user.save();
         
        res.send("admin created successfully");
    }else{
        user.isAdmin=true;
        await user.save();
         
        res.send('User is now an admin.');
    }
    
 }catch(err){
    console.log("main error",err);
    res.send("check err");
 }

 });

 
app.get("/login",(req,res)=>{
res.render("loginpage");
});
 
app.post("/login",async(req,res)=>{

    const {email,password} = req.body;
    if(!req.session.loginAttempts){
        req.session.loginAttempts = 0;
    }

    const user  = await userModel.findOne({email});
    console.log(user)
    if(!user){
        req.session.loginAttempts += 1;
        req.flash("error_msg", "Email or password are incorrect..!   ");

        if (req.session.loginAttempts === 3) {
            req.flash("error_msg", " You have entered incorrect credentials 3 times.Be carefull, After 10 wrong attempts, your account will be locked.");
        }

        if (req.session.loginAttempts >= 10) {
            req.flash("error_msg", " Your account has been locked due to too many incorrect attempts. Please check your email to recover your account.");
            return res.redirect("/locked");
        }
        return res.redirect("/login");
    }

    if(user){
        
        bcrypt.compare(password,user.password,(err,result)=>{
            if(result){
                req.session.user = user;
                let token = jwt.sign({ email}, "ummi");
                res.cookie("token", token);
                req.session.loginAttempts = 0;
                res.redirect("/");

            }else{
                req.session.loginAttempts += 1;   
                req.flash("error_msg", "Email or password are incorrect..!  ");
    
                if (req.session.loginAttempts === 3) {
                    req.flash("error_msg", " You have entered incorrect credentials 3 times.Be carefull, After 10 wrong attempts, your account will be locked.");
                }


                if (req.session.loginAttempts >= 10) {
                    req.flash("error_msg", " Your account has been locked due to too many incorrect attempts. Please check your email to recover your account.");
                    return res.redirect("/locked");
                }
                res.redirect("/login");
                 
            }
     });
    
    }



});
 
  
app.post("/create",isLoggedIn,isAdmin, upload.single("image"), async (req,res)=>{
   try{
    const {name,price,discount,description,sizes,colors,page } = req.body;
   
    const product = await productModel.create({
        image:req.file.buffer,
        name,
        price,
        discount,
        description,
        sizes, 
        colors,
        page
    });
     
     
     res.redirect("/owner");
   } catch(err){
    res.send(err);
   }

 
});


app.get("/submit",(req,res)=>{
    res.send("sucessfull");
})
 
 
 
app.get("/owner",isLoggedIn,isAdmin, (req,res)=>{
  res.render("createproduct"); 
});
 
app.get("/shop",isLoggedIn,isAdmin, async (req,res)=>{
    const products =  await productModel.find();
   
    res.render("shoppage",{products});

});

app.get("/shopping/:productId",async(req,res)=>{
     try {
        const productId = req.params.productId;
        console.log(productId);

        console.log("Type of ID:", typeof productId);
        console.log("ID value:", productId);
        console.log("ID length:", productId.length);

        const product = await productModel.findById(productId);
        console.log("product is",product);
          const coreName = product.name.replace(/\d+$/, '').trim();
        const namePattern = new RegExp(coreName.split(' ').join('|'), 'i'); 



        const similarProducts = await productModel.find({
            name: { $regex: namePattern },
            _id: { $ne: productId }  
        });


          similarProducts.forEach(product => {
            if (!product.originalPrice) {
                product.originalPrice = product.price / (1 - product.discount / 100);
            }
        });

         
        
    

        res.render("shopping",{product,similarProducts});
        
    }catch(err){
        console.log(err);
    }
});


 
app.post('/addtocart/:productid', isLoggedIn, async (req, res) => {
    const productId = req.params.productid;
    const userId = req.user._id;
    const { quantity, size, color } = req.body; // Get quantity, size, and color from request body

    try {
        // Check if the item already exists in the cart
        let cartItem= await Cart.findOne({userId,productId });
         
        if (cartItem) {
            // Update the quantity if item already exists
            cartItem.quantity = parseInt(cartItem.quantity) + parseInt(quantity);
            if (size) cartItem.size = size;
            if (color) cartItem.color = color;
            await cartItem.save();
            req.flash('success_msg', 'Updated item added to cart successfully.');
            
            
        } else {
            // Add new item to the cart
            cartItem = new Cart({ userId, productId, quantity, size, color });
            await cartItem.save();
            req.flash('success_msg', 'Item added to cart successfully.');
        }
        
        console.log('Addeded to cart');
        res.redirect(`/shopping/${productId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
 
 
// Route to get cart items
app.get('/mycart', isLoggedIn, async (req, res) => {
    const userId = req.user._id;

    try {
       
        const cartItems = await Cart.find({ userId }).populate('productId');
         
        const invalidItems = cartItems.filter(item => !item.productId);
        console.log('Invalid Cart Items:', invalidItems);
        await Cart.deleteMany({ _id: { $in: invalidItems.map(item => item._id) } });
        console.log('Invalid cart items removed.');
        const cartItemsWithTotal = cartItems.map(item => {
            console.log(item);
            const totalPrice = item.quantity * item.productId.price;
            return {
                ...item.toObject(),
                totalPrice
            };
        });

      
        

        const grandTotal = cartItemsWithTotal.reduce((sum, item) => sum + item.totalPrice, 0);

        
        res.render('cartpage', { cartItems: cartItemsWithTotal,grandTotal });


    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
 

app.get("/product-image/:productId", async (req,res)=>{
    try{
    const product = await productModel.findById(req.params.productId);
    if(!product || !product.image){
        res.send("image not found");
    }else{
        res.contentType(image/jpeg);
        res.send(product.image);
    }
      }catch(err){
        console.log(err);
      }
    
    

  });
 
app.get("/edit-product/:productId",isLoggedIn,isAdmin, async (req,res)=>{
   try{
    const product = await productModel.findById(req.params.productId);
    if(!product) {
        res.send("Product Not Found");
    }
    res.render("editpage",{product});

   }catch(err){
    console.log(err);
    res.send("An Error Occured");
   }

  });


 

app.post("/editproduct",isLoggedIn,isAdmin,upload.single("image"), async(req,res)=>{
    try{
        const{productId,name, price,discount} = req.body;
        const updateData = {name,price,discount};
        if(req.file){
        updateData.image = req.file.buffer;
        }
        await productModel.findByIdAndUpdate(productId,updateData,{new:true});
        res.redirect("/shop");
    }catch(err){
        console.log(err);
        res.send("Error, Check ur terminal..!");
    }

  });


app.post("/delete/:productId", isLoggedIn,isAdmin,async(req,res)=>{
    try{
        await productModel.findByIdAndDelete(req.params.productId);
        req.flash('success', 'Product deleted successfully');

        res.redirect("/deleteProduct");
    }catch(err){
        console.log(err);
        req.flash('error', 'Failed to delete product');
        res.send("Error");
    }
  });

 // Add this route (make sure it's protected by isAdmin middleware)
app.post("/deleteAllProducts", isLoggedIn, isAdmin, async (req, res) => {
    try {
        await productModel.deleteMany({});
        req.flash('success', 'All products have been deleted successfully');
        res.redirect("/deleteProduct");
    } catch (error) {
        console.error(error);
        req.flash('error', 'Failed to delete all products');
        res.redirect("/deleteProduct");
    }
});

app.get("/deleteProduct",isLoggedIn,isAdmin,async(req,res)=>{
     try{
        const allProducts = await productModel.find()

       res.render("DeleteProduct",{allProducts,
        messages: {
            success: req.flash('success'),
            error: req.flash('error')
        }
       })
     }catch(error){
        console.log(error);
        res.send("Error");
     }
})
 
 
app.get('/search', async (req, res) => {
   

    try {
        const productOp =  await productModel.find();
        productOp.forEach(product => {
            if (!product.originalPrice) {
                product.originalPrice = product.price / (1 - product.discount / 100);
            }
            
        });
         
        const query = req.query.q;  
        if (!query) {
            return res.status(400).json({ message: 'Query parameter is required' });
        }

        const normalizedQuery = query.trim().toLowerCase(); 
        const exactPattern = new RegExp(`^${normalizedQuery}$`, 'i');
        const exactMatches = await productModel.find({
            $or: [
                { name: exactPattern },
                { description: exactPattern }
            ]
        }).lean();
        const partialPattern = new RegExp(normalizedQuery.split('').join('.*?'), 'i');
        const similarMatches = await productModel.find({
            $or: [
                { name: { $regex: partialPattern } },
                { description: { $regex: partialPattern } }
            ]
        }).lean();
        const coreName = normalizedQuery.replace(/\d+$/, '');
        const coreNamePattern = new RegExp(coreName, 'i');
        const additionalMatches = await productModel.find({
            $or: [
                { name: { $regex: coreNamePattern } },
                { description: { $regex: coreNamePattern } }
            ]
        }).lean();
        let combinedMatches = exactMatches.concat(similarMatches, additionalMatches);
        const uniqueMatches = Array.from(new Map(combinedMatches.map(product => [product._id.toString(), product])).values());
    

        res.render("search-result",{ 
            productOp,
            products: uniqueMatches,
            message: uniqueMatches.length === 0 ? 'No result founds' : null
         });
    } catch (err) {
        console.log('Search Error:', err);
        
    }
});

 
app.get("/myaccount", isLoggedIn,async (req,res)=>{
const user = await userModel.findOne({email:req.user.email});
 console.log(user.username);
    res.render("myaccountpage",{ user });
  });
 

app.post("/purchase/:productId",isLoggedIn,  async(req,res)=>{
    const productId = req.params.productId
 try{
    const  {size,color,quantity} = req.body;
   
     
        const product = await productModel.findById(productId);
        if(!product){
           res.send("Product Not Found");
        }else{
           req.session.product = {
               ...product.toObject(),
               size,
               color,
               quantity
           };
           const products =  req.session.product;
          
        
            res.redirect("/delivery");
             
            
           
        }
     
 
    
 }catch(err){
    console.log(err);
    res.send("check terminal");
 }
});

 

  app.get("/delivery",(req,res)=>{

    const product =  req.session.product || {};
    res.render("delivery-address",{product:  req.session.product });
    
  })



 app.post("/proceed/:productId",isLoggedIn,async(req,res)=>{
    
    const  product = req.session. product || {};
    // const product = await productModel.findById(req.params.productId);
    req.session.product = product;
    const{ productId,firstname, lastname,country,state,city,pincode,address,number} = req.body;
    
    userDeliveryAddress = {firstname, lastname,country,state,city,pincode,address,number}
    // const product  = await productModel.findById(req.params.productId);
    req.session.deliveryAddress =  userDeliveryAddress;
   
    const price = product.price || 0; 
    const quantity =  product.quantity ||0;  

    
    const subtotal = price * quantity;
    const order = await Order.findOne({ userId: req.user._id }).sort({ createdAt: -1 }).exec();
     
     res.render('pay-page', { subtotal});
   

    
 });

 app.post("/proceed2",isLoggedIn,async(req,res)=>{
    
    const{orderamount, productId,firstname, lastname,country,state,city,pincode,address,number} = req.body;
  
    userDeliveryAddress = {firstname, lastname,country,state,city,pincode,address,number}

    req.session.deliveryAddress =  userDeliveryAddress;

    
   
    const subtotal=  orderamount;
    
    res.render("pay-page",{subtotal});
 });
 

app.post('/remove/:productid', isLoggedIn, async (req, res) => {
    const productId = req.params.productid;
    console.log(productId);
    const userId = req.user._id;
    console.log(userId); // Get user ID from session or authentication

  try{

    const cartItem = await Cart.findOne({userId,productId});
    if(cartItem){
        await Cart.deleteOne({_id:cartItem._id});
        console.log("Product remove from cart");
        res.redirect("/mycart");
    }else{
        console.log("no product");
        res.send("no product");
    }

  }catch(err){
    console.error(err);
    res.status(500).send('Server error');
  }
});

 
app.post('/checkcart/:productid', isLoggedIn, async (req, res) => {
    const productId = new mongoose.Types.ObjectId(req.params.productid);  
    const userId = req.user._id;  

    try {
        // Check if the product exists in the user's cart
        const cartItem = await Cart.findOne({ productId: productId, userId: userId });

        if (cartItem) {
            console.log('Product is in the cart:', cartItem);
            res.status(200).send('Product is in the cart');
        } else {
            console.log('Product not found in the cart');
            res.status(404).send('Product not found in the cart');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});
 

app.post("/complete-payment/:productid", isLoggedIn,async (req, res) => {
    try {
        
         
        const productId = req.params.productid;
        const userId = req.user._id;
        req.session.userId = userId;
      

        
        const productDetails = req.session.productDetails || {};
        
        const { paymentMethod } = req.body;
     
         
        
         
        const product = await productModel.findById(productId);
     

        if (!product) {
            return res.status(404).send('Product not found');
        }

        const deliveryAddress = req.session.deliveryAddress;
        

       const  productDetail ={
        productId: product._id,
            name: product.name,
            price: product.price,
            quantity: productDetails.quantity,  
            size: req.body.size || null,
            color: productDetails.color || null,
            imageUrl: product.imageUrl

            
       }

        const order = new Order({
            userId:userId,
            products :[productDetail],
            totalAmount: product.price* productDetails.quantity,
            paymentMethod: paymentMethod,
          
            
           
            deliveryAddress:{
               
                city: deliveryAddress.city || 'N/A',
                pincode: deliveryAddress.pincode || 'N/A',
                country: deliveryAddress.country || 'N/A',
                state: deliveryAddress.state || 'N/A',
                firstName: deliveryAddress.firstname || 'N/A',
                lastName: deliveryAddress.lastname || 'N/A',
                address:deliveryAddress.address || 'N/A'
            },
            product:product,
            
        });
         
        await order.save();
         
       

        res.redirect(`/purchased-product-detail/${productId}`);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error processing payment');
    }
});
 
app.get('/purchased-product-detail/:productid',isLoggedIn,isAdmin, async(req,res)=>{


    const userId = req.user._id; 
    const productId = req.params.productid;
    const product = await productModel.findById(productId);
    if(product){
        const imageBase64 = product.image.toString('base64');
        product.imageUrl = `data:image/jpeg;base64,${imageBase64}`;
      }
      
      
    const orders = await Order.find({userId}).populate('products.productId');
    
    res.render("purchased-product-detail",{orders,product});
});
 
app.post("/delete-all-order",isLoggedIn,isAdmin,async(req,res)=>{
    try{
         await Order.deleteMany({});
         res.send("delete done");

    }catch(err){
        console.log(err);
    }
})

  
  app.get('/cancel', (req, res) => {
    res.status(200).send('Payment cancelled');
  });
 

app.get("/logout",(req,res)=>{
    res.clearCookie("token");
    req.session.user = null;
    res.redirect("/");
});


 

app.post('/checkout', isLoggedIn, async (req, res) => {
    const userId = req.user._id;
      
    try {
        
        // const cartItems = await Cart.find({ userId }).populate('productId');
        const cartItems = await Cart.find({ userId }).populate('productId');
   
      
    if (cartItems.length > 0) {
     let totalAmount = 0;
     const products = [];

     
     for (const cartItem of cartItems) {
       
    const product = await productModel.findById(cartItem.productId);
  
    if (product) {
      totalAmount += product.price * cartItem.quantity;
    //   const base64Image = product.image.toString('base64');
    const base64Image = await sharp(product.image)
                        .resize({ width: 300, height: 450, fit: sharp.fit.cover })  
                        .toBuffer()
                        .then(buffer => buffer.toString('base64'));
    
                    products.push({
                        productId: product._id,
                        quantity: cartItem.quantity,
                        size: cartItem.size,
                        color: cartItem.color,
                        name: product.name,
                        price: product.price,
                        image:base64Image
                        // image:newImage._id
                    });
                     
                  
                }
              
            }

            
            req.session.cartDetails =  {
                userId,
                products,
                totalAmount
            };
            
             
           
            
            // Clear the user's cart
            // await Cart.deleteMany({ userId });

        
            res.redirect("/delivery2");
        } else {
            res.status(400).send('No items in the cart');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

 

app.get("/delivery2",isLoggedIn,async(req,res)=>{
     
    // const productDetails = req.session.productDetails || {};
    const order =  req.session.cartDetails;
    // const   order = await   order.findOne({ userId: req.user._id }).sort({ createdAt: -1 }).exec();
     
    if (order) {
         
        res.render('delivery-address2', { order });
        
       
         
    } else {
        res.status(404).send('Order not found');
    }
    

        
         
        // res.render("delivery-address2",{ product: req.session.productDetails,grandTotal});
    
  });



app.get("/order-success", isLoggedIn, async (req, res) => {
    try {
        
        const order = await Order.findOne({ userId: req.user._id }).sort({ createdAt: -1 }).exec();
         
        if (order) {
            res.render('order-success', { order });
           
             
        } else {
            res.status(404).send('Order not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

 
 
 

app.post('/createOrder', isLoggedIn, async (req, res) => {
    const amount = req.body.amount*100 ;  
    try {
        

        
        const deliveryAdd = req.session.deliveryAddress || {};
        const cartProducts = req.session.cartDetails || {};
        const cartProductList = cartProducts.products || [];
        const singleProduct = req.session.product || {};
        
        let product = [];
        let totalAmount = 0;

        if (Object.keys(singleProduct).length > 0) {
            product.push({ ...singleProduct });
           
        } else if (cartProductList.length > 0) {
            product = cartProductList.map(item => ({
                productId: item.productId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                color: item.color,
                image: item.image
            }));
            
        }
         
        const newOrder = new Order({
            userId: req.user._id, 
            deliveryAddress: deliveryAdd,   
            products: product,  
            totalAmount: totalAmount || amount,   
            paymentMethod: 'Online',   
            status: 'Pending'  
        });
       
        const  order = await instance.orders.create({
            amount: amount,
            currency: 'INR',
            receipt: 'order_rcptid_11'
        });
        
        res.json({ orderId:   order.id, amount:   order.amount });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).send({ error: 'Failed to create order' });
    }
});


app.post('', isLoggedIn, async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', 'rzp_test_UStpNiJ9RhDoDS');
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
         
       res.redirect("/createnewOrder");
     
    } else {
        res.json({ status: 'failure' });
    }
});

app.post('/verifyPayment', isLoggedIn, async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
   

    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', '18MsDJ6u0SuC1WjbfSXD5x1Y');
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generated_signature = hmac.digest('hex');
 

   
    
    if (generated_signature === razorpay_signature) {
        res.json({ status: 'success' });
        
 
    } else {
        res.json({ status: 'failure' }); 
    }
});



app.get("/createnewOrder",isLoggedIn,async(req,res)=>{
    const deliveryAdd = req.session.deliveryAddress || {};  
    const cartProducts = req.session.cartDetails || {};      
    const cartProductList = cartProducts.products || [];    
    const singleProduct = req.session.product || {};    
       

       
     
  
    try {
        let product = [];
        let totalAmount = 0;

      
        


        if (Object.keys(singleProduct).length > 0) {
            product.push({ ...singleProduct });
            totalAmount = singleProduct.price * singleProduct.quantity; 
            req.session.cartDetails = null;
            req.session.product = null;
           
        } 
        
        else if (cartProductList.length > 0) {
            product = cartProductList.map(item => {
                if (!item.quantity) {
                    throw new Error(`Product ${item.name} is missing a quantity.`);
                }
                return {
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,  // Ensure this exists
                    size: item.size,
                    color: item.color,
                    image: item.image
                };
            });
        
        
            totalAmount = cartProductList.reduce((total, item) => total + (item.price * item.quantity), 0);
            req.session.product = null;
          
         
 
            
        } else {
            return res.status(400).send("No products found in cart or session.");
        }

        // Create a new order
        const newOrder = new Order({
            userId: req.user._id, 
            deliveryAddress: deliveryAdd,   
            products: product,  
            totalAmount,   
            paymentMethod: 'online',   
            status: 'Pending'  
        });
       
        await newOrder.save();  

         req.session.newOrder = newOrder;
        req.session.cartDetails = null;
        req.session.product = null;
        
       res.redirect("/order-confirmation")
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
 
 

app.post('/createCODOrder', isLoggedIn, async (req, res) => {
    const deliveryAdd = req.session.deliveryAddress || {};  
    const cartProducts = req.session.cartDetails || {};      
    const cartProductList = cartProducts.products || [];    
    const singleProduct = req.session.product || {};    
     
    const { amount } = req.body;  
  
    try {
        let product = [];
        let totalAmount = 0;

      
        if (Object.keys(singleProduct).length > 0) {
           

            product.push({ ...singleProduct });
  
  
            req.session.cartDetails = null;
        }
        


        else if (cartProductList.length > 0) {
            product = cartProductList.map(item => {
                if (!item.quantity) {
                    throw new Error(`Product ${item.name} is missing a quantity.`);
                }
                return {
                    productId: item.productId,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,  // Ensure this exists
                    size: item.size,
                    color: item.color,
                    image: item.image
                };
            });
        
        

       
         
 
            req.session.product = null;
        } else {
            return res.status(400).send("No products found in cart or session.");
        }

        // Create a new order
        const newOrder = new Order({
            userId: req.user._id, 
            deliveryAddress: deliveryAdd,   
            products: product,  
            totalAmount: totalAmount || amount,   
            paymentMethod: 'COD',   
            status: 'Pending'  
        });
       
        await newOrder.save();  

         req.session.newOrder = newOrder;
        req.session.cartDetails = null;
        req.session.product = null;
        
       res.redirect("/order-confirmation")
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
 

app.get('/order-confirmation', isLoggedIn, async (req, res) => {
    try {
        const order =  req.session.newOrder;
        const orderId = order._id;

        const newOrder = await Order.findById(orderId);
       

        if ( newOrder) {
            res.render('order-confirmation-page', { newOrder });
        } else {
            res.status(404).send('Order not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

 app.post('/updateOrderStatus/:orderId',isLoggedIn,async(req,res)=>{
     const {orderId} = req.params;
     const {status}= req.body;

     try {
        
        await Order.findByIdAndUpdate(orderId, { status: status });
     
        res.redirect("/admin/orders");
      } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).send("Server error");
      }
 });
 
 
app.get('/admin/orders',isLoggedIn,isAdmin, async (req, res) => {
    try {
        const allOrders = await Order.find().populate('userId');  // Populate user details if needed
        res.render('allorder', { orders: allOrders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

 

app.post('/admin/search-orders', isLoggedIn, isAdmin, async (req, res) => {
    const { emailOrUsernameOrFullname, state, city, address, pincode, startDate, endDate } = req.body;  
    try {
        const allOrders = await Order.find().populate('userId');
        console.log(city)
 
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if (end) end.setHours(23, 59, 59);  

        const filteredOrders = allOrders.filter(order => {
            
             const matchesUserDetails = (
                order.userId.email.toLowerCase().includes(emailOrUsernameOrFullname.toLowerCase()) || // Check email
                order.userId.username.toLowerCase().includes(emailOrUsernameOrFullname.toLowerCase()) || // Check username
                order.userId.fullname.toLowerCase().includes(emailOrUsernameOrFullname.toLowerCase()) // Check fullname
            );
 
    const matchesAddressDetails = (
    (state ? order.deliveryAddress.state.toLowerCase().includes(state.toLowerCase()) : true) &&  
    (city ? order.deliveryAddress.city.toLowerCase().includes(city.toLowerCase()) : true) &&  
    (address ? order.deliveryAddress.address.toLowerCase().includes(address.toLowerCase()) : true) &&  
    (pincode ? order.deliveryAddress.pincode.includes(pincode) : true)  
   );


           

            // Check date conditions if both start and end dates are provided
            const isDateInRange = (
                (!start || order.createdAt >= start) &&
                (!end || order.createdAt <= end)
            );

             
            return (matchesAddressDetails && matchesUserDetails && isDateInRange);
        });
     

        res.render('allorder', { orders: filteredOrders });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
 
app.post('/admin/delete-order/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        await Order.findByIdAndDelete(orderId);
        res.redirect('/admin/orders');  
    } catch (err) {
        res.status(500).send('Error deleting order');
    }
});

app.post('/admin/delete-all-orders', async (req, res) => {
    try {
        await  Order.deleteMany({});
        res.redirect('/admin/orders');  
    } catch (err) {
        res.status(500).send('Error deleting all orders');
    }
});

app.get("/myorder",isLoggedIn,async(req,res)=>{
    const userId = req.user._id;
    const orders = await Order.find({userId});
    if(orders){
        if(orders.length>0){
            res.render("my-order",{orders});
            console.log("yesssssss")
        }else{
            res.send("No order  is placed");
        }
    }else{
        res.send("error during fetching order")
    }
});
 
app.get("/random",(req,res)=>{
    res.render("random");
});

 

 
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});





 