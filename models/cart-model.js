const mongoose = require('mongoose');

 
const cartSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    },
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    name:{
        type:String
    },
    image:{
        type:Buffer
    },
    quantity: { 
        type: Number, 
        required: true, 
        default: 1 
    },
    price:{
        type:Number
    },
    size: { 
        type: String 
    },
    color: { 
        type: String 
    }
}, { timestamps: true });  

 
const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
