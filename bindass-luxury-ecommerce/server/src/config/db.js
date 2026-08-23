const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ Connected to MongoDB Atlas: ${conn.connection.host}`);

        // DB Migration: Drop obsolete non-sparse firebaseUID index if present in DB
        try {
            await mongoose.connection.collection('users').dropIndex('firebaseUID_1');
            console.log('🧹 Cleaned up legacy firebaseUID_1 index from users collection');
        } catch (idxErr) {
            // Index already dropped or doesn't exist — ignore safely
        }
    } catch (error) {
        console.error(`❌ Error connecting to MongoDB: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
