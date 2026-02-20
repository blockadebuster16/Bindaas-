const path = require('path');

// explicit logging for debugging
const envPath = path.join(__dirname, '../../.env');
console.log("Loading env from:", envPath);
require('dotenv').config({ path: envPath });

const mongoose = require('mongoose');
const Product = require('../models/Product');

const products = [
    {
        name: "Slim Fit Piqué Polo",
        description: "Signature breathable cotton piqué. A timeless classic for the modern wardrobe.",
        price: 4500,
        category: "Apparel",
        images: ["https://images.unsplash.com/photo-1626497764746-6dc36546b388?q=80&w=800&auto=format&fit=crop"],
        stock: 50,
        sizes: ["S", "M", "L", "XL"],
        isFeatured: true
    },
    {
        name: "Water-Repellent Jacket",
        description: "Lightweight, technical fabric designed for urban exploration and sudden downpours.",
        price: 12500,
        category: "Outerwear",
        images: ["https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=800&auto=format&fit=crop"],
        stock: 30,
        sizes: ["M", "L", "XL"],
        isFeatured: true
    },
    {
        name: "Elite Court Sneaker",
        description: "Premium leather construction with an ergonomic sole for all-day comfort and style.",
        price: 8500,
        category: "Footwear",
        images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop"],
        stock: 45,
        sizes: ["7", "8", "9", "10", "11"],
        isFeatured: true
    },
    {
        name: "Oxford Cotton Shirt",
        description: "Crisp, tailored fit perfect for business casual or weekend layering.",
        price: 5500,
        category: "Apparel",
        images: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop"],
        stock: 60,
        sizes: ["S", "M", "L", "XL"],
        isFeatured: false
    },
    {
        name: "Midnight Silk Kimono",
        description: "Hand-dyed Japanese silk with gold thread embroidery. A masterpiece of midnight elegance.",
        price: 25000,
        category: "Limited Edition",
        images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop"],
        stock: 10,
        sizes: ["S", "M", "L"],
        isFeatured: true
    }
];

const seedDB = async () => {
    try {
        console.log("MONGO_URI defined:", !!process.env.MONGO_URI);
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is missing in .env");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        await Product.deleteMany({});
        console.log("Cleared existing products...");

        await Product.insertMany(products);
        console.log("Added 5 luxury products!");

        process.exit();
    } catch (err) {
        console.error("SEED FAIL:", err);
        process.exit(1);
    }
};

seedDB();
