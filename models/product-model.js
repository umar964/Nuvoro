const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  image:Buffer,    
  price: Number,
  name: String,
  discount: Number,
  sizes:[{ type:String }],
  colors:[{type:String}],
  description:String,
  page:String
  
});

 
module.exports = mongoose.model("Product", productSchema);
