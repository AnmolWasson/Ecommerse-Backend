
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: String,
  name: String,
  salePrice: Number,
  images: [String],
  description: String,
  customerReviewCount: Number,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }
 
});

module.exports = mongoose.model('Product', productSchema);
