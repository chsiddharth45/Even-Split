const mongoose = require("mongoose");

const connecDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch(err) {
        console.log("MongoDB Connection failed", err.message);
        process.exit(1);
    }
};

module.exports = connecDb;