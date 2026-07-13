import React, { useEffect, useState } from "react";
import "./Orders.css";
import { toast } from "react-toastify";
import axios from "axios";
import { assets, url, currency } from "../../assets/assets";

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch all orders
  const fetchAllOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${url}/api/order/list`);
      if (response.data.success) {
        setOrders(response.data.data.reverse());
      } else {
        toast.error("Failed to fetch orders");
        setError("Failed to fetch orders");
      }
    } catch (err) {
      toast.error("Server error fetching orders");
      setError("Server error fetching orders");
    }
    setLoading(false);
  };

  // Update order status (Admin)
  const statusHandler = async (e, orderId) => {
    const newStatus = e.target.value;
    try {
      const response = await axios.post(`${url}/api/order/status`, {
        orderId,
        status: newStatus,
      });
      if (response.data.success) {
        toast.success("Order status updated successfully");
        await fetchAllOrders();
      } else {
        toast.error(response.data.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error updating status");
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  // Group orders by status
  const activeOrders = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled"
  );
  const deliveredOrders = orders.filter((o) => o.status === "Delivered");
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled");

  const renderOrderItem = (order, index) => {
    const isCancelled = order.status === "Cancelled";

    return (
      <div
        key={order._id || index}
        className={`order-item ${isCancelled ? "cancelled" : ""}`}
        style={{ opacity: isCancelled ? 0.6 : 1 }}
      >
        <img src={assets.parcel_icon} alt="Parcel Icon" />
        <div>
          <p className="order-item-food">
            {order.items.map((item, i) =>
              i === order.items.length - 1
                ? `${item.name} x ${item.quantity}`
                : `${item.name} x ${item.quantity}, `
            )}
          </p>
          <p className="order-item-name">
            {order.address.firstName} {order.address.lastName}
          </p>
          <div className="order-item-address">
            <p>{order.address.street},</p>
            <p>
              {order.address.city}, {order.address.state},{" "}
              {order.address.country}, {order.address.zipcode}
            </p>
          </div>
          <p className="order-item-phone">{order.address.phone}</p>
        </div>

        <p>Items: {order.items.length}</p>
        <p>
          {currency}
          {order.amount}
        </p>

        {/* Order Status Dropdown */}
        <select
          onChange={(e) => statusHandler(e, order._id)}
          value={order.status}
          name="status"
          id={`status-select-${order._id}`}
          disabled={isCancelled}
        >
          <option value="Food Processing">Food Processing</option>
          <option value="Waiting for Pickup">Waiting for Pickup</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        {/* Show Pickup OTP (Admin Side Only) */}
        {order.pickupOtp && !isCancelled && (
          <p style={{ fontWeight: "bold", color: "darkgreen" }}>
            Pickup OTP: {order.pickupOtp}
          </p>
        )}

        {/* Delivery OTP intentionally hidden from admin */}

        {/* Delivered / Cancelled Info */}
        {(order.status === "Delivered" || isCancelled) && (
          <p style={{ fontSize: "0.9rem", color: "#555" }}>
            {order.status === "Delivered"
              ? `Delivered on ${new Date(order.updatedAt).toLocaleString()}`
              : `Cancelled on ${new Date(order.updatedAt).toLocaleString()}`}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="order add">
      <h3>Order Management</h3>
      <div className="order-list">
        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <>
            <h4>Active Orders</h4>
            {activeOrders.map(renderOrderItem)}
          </>
        )}

        {/* Delivered Orders */}
        {deliveredOrders.length > 0 && (
          <>
            <h4>Delivered Orders</h4>
            {deliveredOrders.map(renderOrderItem)}
          </>
        )}

        {/* Cancelled Orders */}
        {cancelledOrders.length > 0 && (
          <>
            <h4>Cancelled Orders</h4>
            {cancelledOrders.map(renderOrderItem)}
          </>
        )}

        {/* No Orders */}
        {orders.length === 0 && <p>No orders available</p>}
      </div>
    </div>
  );
};

export default Order;
