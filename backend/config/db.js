import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect('mongodb+srv://anusridc67:Z9Fy85X0OydR7QvM@cluster0.u4xm90x.mongodb.net/food-del');
        console.log("DB Connected");
    } catch (error) {
        console.error("DB Connection Error:", error.message);
    }
}

// Make sure your MongoDB connection string is correct.
// Avoid using '@' in your database user's password.