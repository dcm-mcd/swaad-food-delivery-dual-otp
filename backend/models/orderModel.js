

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  items: { type: [Object], required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Food Processing" },
  date: { type: Date, default: Date.now },
  payment: { type: Boolean, default: false },
  pickupOtp: { type: String },
  deliveryOtp: { type: String },
  assignedDriverId: { type: mongoose.Schema.Types.ObjectId, ref: "DeliveryDriver" }, // clear naming
},  { timestamps: true }
);

export default mongoose.model("order", orderSchema);
