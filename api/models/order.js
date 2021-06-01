const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product'},
    quantity: { type: Number, default: 1}
    //name: { type: String, required: true},
    //price: { type: Number, required: true}
});

module.exports = mongoose.model('Order', orderSchema);