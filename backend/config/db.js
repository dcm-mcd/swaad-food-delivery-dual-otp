import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("DB Connected");
    } catch (error) {
        console.error("DB Connection Error:", error.message);
    }
}

// Make sure your MongoDB connection string is correct.
// Avoid using '@' in your database user's password.
