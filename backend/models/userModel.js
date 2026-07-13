import mongoose from "mongoose"; // ESM syntax


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    otp: { type: String },
   otpGeneratedAt: { type: Date },

}, { minimize: false });

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel; // Exporting the model for use in other files