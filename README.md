# Swaad — Food Delivery Application with Dual OTP Verification

Swaad is a MERN-stack food delivery web application designed with a dual OTP verification mechanism to improve security during order pickup and delivery.

## Key Feature: Dual OTP Verification

The application uses two separate OTP verification stages:

1. **Pickup OTP Verification** — When an order is ready for pickup, a pickup OTP is used to verify the delivery partner before the order status changes to "Out for Delivery".

2. **Delivery OTP Verification** — Once the order is out for delivery, a delivery OTP is provided to the customer. The delivery partner must verify this OTP to successfully mark the order as "Delivered".

## Order Workflow

Food Processing → Waiting for Pickup → Out for Delivery → Delivered

## Modules

- **Customer Frontend** — Browse food items, add items to cart, place orders, view order history, and access the delivery OTP.
- **Admin Panel** — Manage food items, view orders, update order status, and manage the pickup process.
- **Delivery Partner Module** — View assigned orders and verify pickup and delivery OTPs.
- **Backend** — Handles authentication, REST APIs, MongoDB operations, order management, and OTP verification.

## Technologies Used

- MongoDB
- Express.js
- React.js
- Node.js
- JWT Authentication
- bcrypt
- RESTful APIs
- Stripe
- Vite

## Project Structure

```text
swaad-food-delivery-dual-otp/
├── admin/
├── backend/
├── deliverypartner/
├── frontend/
└── .gitignore
