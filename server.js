const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Category = require('./models/category');
const Product = require('./models/product');

const app = express();
const port = process.env.PORT || 3000;


mongoose.connect('mongodb://127.0.0.1:27017/catalogDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected");
}).catch((err) => {
  console.log("Error is "+err);
});


// Define routes for syncing data
app.get('/sync/categories', async (req, res) => {
  // Fetch categories from external API
  try {
    const response = await axios.get('https://stageapi.monkcommerce.app/task/categories', {
      headers: {
        'x-api-key': 'xmja813nd8as88po',
      },
    });

    const categories = response.data.categories;
    

    // Store categories in the database
    await Category.insertMany(categories);

    res.json({ message: 'Categories  successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync categories' });
  }
});

app.get('/sync/products/:categoryID', async (req, res) => {
  const { categoryID } = req.params;

  // Fetch products for a specific category from external API
  try {
    const response = await axios.get(`https://stageapi.monkcommerce.app/task/products?categoryID=${categoryID}`, {
      headers: {
        'x-api-key': 'xmja813nd8as88po',
      },
    });

    const products = response.data.products;

    // Store products in the database
    await Product.insertMany(products.map((product) => ({ ...product, category: categoryID })));

    res.json({ message: 'Products synced successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to sync products' });
  }
});

// Define routes for catalog API
app.get('/shop/categories', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;

  try {
    const categories = await Category.find()
      .sort({ name: 1 }) // Sort by category name
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    res.json({ page, categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

app.get('/shop/products', async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const categoryID = req.query.categoryID;

  try {
    const products = await Product.find({ category: categoryID })
      .sort({ customerReviewCount: -1 }) // Sort by customer review count
      .limit(limit)
      .skip((page - 1) * limit)
      .exec();

    res.json({ page, products });
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
