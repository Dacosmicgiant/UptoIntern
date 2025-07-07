const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error("❌ MONGODB_URI is not defined in environment variables");
    }

    // Prevent multiple connections
    if (mongoose.connection.readyState !== 0) {
      console.log("✅ MongoDB is already connected");
      return;
    }

    // Simple connection with minimal options for compatibility
    await mongoose.connect(uri);
    
    console.log("🚀 ✅ MongoDB Connected Successfully");
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    throw error;
  }
};

// Event listeners for better monitoring
mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ Mongoose disconnected from MongoDB");
});

mongoose.connection.on("reconnected", () => {
  console.log("🔄 Mongoose reconnected to MongoDB");
});

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("👋 MongoDB connection closed through app termination");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error closing MongoDB connection:", error);
    process.exit(1);
  }
});

module.exports = connectToDatabase;