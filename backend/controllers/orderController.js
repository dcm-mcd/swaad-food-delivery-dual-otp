import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const currency = "inr";
const deliveryCharge = 50;
const frontend_URL = "http://localhost:5173";

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/* ============================
   PLACE ORDER WITH STRIPE
============================ */
const placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      status: "Food Processing", // default status
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Delivery Charge" },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ success: false, message: "Error placing order" });
  }
};

/* ============================
   PLACE ORDER (CASH ON DELIVERY)
============================ */
const placeOrderCod = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      payment: true,
      status: "Food Processing",
    });

    await newOrder.save();
    await userModel.findByIdAndUpdate(req.userId, { cartData: {} });

    res.json({ success: true, message: "Order placed successfully (COD)" });
  } catch (error) {
    console.error("COD order error:", error);
    res.status(500).json({ success: false, message: "Error placing COD order" });
  }
};

/* ============================
   ADMIN: LIST ALL ORDERS
============================ */
const listOrders = async (_req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("List orders error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

/* ============================
   USER: FETCH OWN ORDERS
============================ */
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("User orders error:", error);
    res.status(500).json({ success: false, message: "Error fetching user orders" });
  }
};

/* ============================
   ADMIN: UPDATE ORDER STATUS
============================ */
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    const validStatuses = [
      "Food Processing",
      "Waiting for Pickup",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    // Generate pickup OTP when admin sets "Waiting for Pickup"
    if (status === "Waiting for Pickup" && !order.pickupOtp) {
      order.pickupOtp = generateOTP();
      console.log(`Pickup OTP generated for order ${order._id}: ${order.pickupOtp}`);
    }

    // Generate delivery OTP when admin/agent sets "Out for Delivery"
    if (status === "Out for Delivery" && !order.deliveryOtp) {
      order.deliveryOtp = generateOTP();
      console.log(`Delivery OTP generated for order ${order._id}: ${order.deliveryOtp}`);
    }

    order.status = status;
    await order.save();

    res.json({ success: true, message: `Status updated to ${status}`, order });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ success: false, message: "Error updating order status" });
  }
};

/* ============================
   STRIPE VERIFICATION
============================ */
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Payment verified" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.status(400).json({ success: false, message: "Payment failed, order deleted" });
    }
  } catch (error) {
    console.error("Verify order error:", error);
    res.status(500).json({ success: false, message: "Error verifying payment" });
  }
};

/* ============================
   DELIVERY FLOW — PICKUP OTP (Agent)
============================ */
const verifyPickupOtp = async (req, res) => {
  const { orderId, otp } = req.body;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (!order.pickupOtp)
      return res.status(400).json({ success: false, message: "Pickup OTP not generated yet" });

    if (order.pickupOtp === otp) {
      order.status = "Out for Delivery";
      order.deliveryOtp = generateOTP(); // generate delivery OTP immediately after pickup
      await order.save();
      return res.json({
        success: true,
        message: "Pickup OTP verified. Order is now Out for Delivery.",
        order,
      });
    } else {
      return res.status(400).json({ success: false, message: "Invalid Pickup OTP" });
    }
  } catch (error) {
    console.error("Pickup OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error verifying pickup OTP" });
  }
};

/* ============================
   DELIVERY FLOW — DELIVERY OTP (Customer)
============================ */
const verifyDeliveryOtp = async (req, res) => {
  const { orderId, otp } = req.body;
  try {
    const order = await orderModel.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (!order.deliveryOtp)
      return res.status(400).json({ success: false, message: "Delivery OTP not generated yet" });

    if (order.deliveryOtp === otp) {
      order.status = "Delivered";
      await order.save();
      return res.json({ success: true, message: "Delivery OTP verified. Order marked Delivered." });
    } else {
      return res.status(400).json({ success: false, message: "Invalid Delivery OTP" });
    }
  } catch (error) {
    console.error("Delivery OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error verifying delivery OTP" });
  }
};

/* ============================
   CANCEL ORDER (User)
============================ */
const cancelOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.body;

    const order = await orderModel.findOne({ _id: orderId, userId });
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    if (order.status !== "Food Processing" && order.status !== "Waiting for Pickup") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order. Current status: ${order.status}`,
      });
    }

    order.status = "Cancelled";
    await order.save();

    res.json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ success: false, message: "Server error while cancelling order" });
  }
};

/* ============================
   ADMIN: GET CANCELLED ORDERS
============================ */
const getCancelledOrders = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const cancelledOrders = await orderModel
      .find({ status: "Cancelled" })
      .sort({ updatedAt: -1 })
      .populate("userId", "name email");

    res.json({ success: true, data: cancelledOrders });
  } catch (error) {
    console.error("Fetch cancelled orders error:", error);
    res.status(500).json({ success: false, message: "Error fetching cancelled orders" });
  }
};

export {
  placeOrder,
  placeOrderCod,
  listOrders,
  userOrders,
  updateStatus,
  verifyOrder,
  verifyPickupOtp,
  verifyDeliveryOtp,
  cancelOrder,
  getCancelledOrders,
};
