import Product from "../Models/productModel.js";

// ✅ Add new product (used by Admin)
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock, weight, customWeight, eggType} = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    const product = new Product({ 
      name, 
      description, 
      price, 
      category, 
      image, 
      stock: stock || 0,
      weight: weight || '',
      customWeight: customWeight || '',
      eggType: eggType || 'egg'
    });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "Error adding product", error });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock, weight, customWeight, eggType } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.category = category || product.category;
    product.image = image || product.image;
    product.stock = stock || product.stock;
    product.weight = weight || product.weight;
    product.customWeight = customWeight || product.customWeight;
    product.eggType = eggType || product.eggType;
    
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: "Error updating product", error: error.message });
  }
};

// ✅ Get all products (with optional search)
export const getProducts = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      // case-insensitive search in name, description, or category
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } }
        ]
      };
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Error fetching products", error: error.message });
  }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product removed" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error: error.message });
  }
};
// ✅ Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Error fetching product", error: error.message });
  }
};
// ✅ Toggle like placeholder
export const toggleLike = async (req, res) => {
  res.status(200).json({ message: "toggleLike not implemented yet" });
};

// ✅ Add to cart placeholder
export const addToCart = async (req, res) => {
  res.status(200).json({ message: "addToCart not implemented yet" });
};


