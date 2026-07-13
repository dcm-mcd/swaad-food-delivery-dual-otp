// orderRoutes.js
import express from 'express';
import authMiddleware from '../middleware/auth.js';
import {
  listOrders,
  placeOrder,
  updateStatus,
  userOrders,
  verifyOrder,
  placeOrderCod,
  verifyPickupOtp,
  verifyDeliveryOtp,
  cancelOrder,      
  getCancelledOrders,
} from '../controllers/orderController.js';

const orderRouter = express.Router();

// Customer-side routes
orderRouter.get("/list", listOrders);

orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/placecod", authMiddleware, placeOrderCod);
orderRouter.post("/status", updateStatus);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/verify-pickup-otp", verifyPickupOtp);
orderRouter.post("/verify-delivery-otp", verifyDeliveryOtp);
// New route for verifying delivered OTP

orderRouter.post("/cancel", authMiddleware, cancelOrder);
orderRouter.get("/cancelled", authMiddleware, getCancelledOrders);

export default orderRouter;
