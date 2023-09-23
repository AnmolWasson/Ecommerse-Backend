
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryID: String,
  name: String
});

module.exports = mongoose.model('Category', categorySchema);
