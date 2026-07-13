import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  customerId: mongoose.Schema.Types.ObjectId,
  deliveryDriverId: mongoose.Schema.Types.ObjectId,
  items: Array,
  totalAmount: Number,
  status: String, // 'assigned', 'out for delivery', 'delivered'
  deliveryOtp: String,
});

export default mongoose.model("Order", OrderSchema);
