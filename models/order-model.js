const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // ID of the user who made the order
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', }, // ID of the product
            quantity: { type: Number, required: true },  
            size: { type: String },  
            color: { type: String },
            price:Number,
            name:String,
            image: { type: Buffer }
        }
    ],
 
    status: { type: String, default: 'Pending' },  
    createdAt: { type: Date, default: Date.now },// Date when the order was created
    totalAmount:Number,
    paymentMethod:String,
   
   
    deliveryAddress: {
       
        city: String,
        pincode: String,
        country: String,
        state:String,
        address:String,
        firstname:String,
        lastname:String,
      },


});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
