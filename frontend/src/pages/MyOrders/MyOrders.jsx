'use client';
import { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import './MyOrders.css';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrderId, setTrackingOrderId] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');

  const { url, token, currency } = useContext(StoreContext);

  const formatDate = (date) => (date ? new Date(date).toLocaleString() : 'N/A');

  const fetchOrders = async () => {
    try {
      if (!token) return;
      const res = await axios.post(
        `${url}/api/order/userorders`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await axios.post(
        `${url}/api/order/cancel`,
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
      setTrackingOrderId(null);
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  // 🔹 Verify delivery OTP entered by customer
  const submitDeliveryOtp = async (orderId) => {
    if (!enteredOtp.trim()) {
      alert('Please enter the delivery OTP!');
      return;
    }

    try {
      const res = await axios.post(
        `${url}/api/order/verify-delivery-otp`,
        { orderId, deliveryOtp: enteredOtp },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        alert('Delivery OTP verified successfully!');
        setEnteredOtp('');
        fetchOrders();
      } else {
        alert(res.data.message || 'Invalid OTP!');
      }
    } catch (err) {
      console.error('Failed to verify delivery OTP:', err);
      alert('Something went wrong. Try again.');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const activeOrders = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Cancelled'
  );
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered');
  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled');

  return (
    <div className="my-orders">
      <h2>My Orders</h2>
      <div className="container">
        {loading ? (
          <p>Loading your orders...</p>
        ) : orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <>
            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <>
                <h3>Active Orders</h3>
                {activeOrders
                  .slice()
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .map((order) => (
                    <div key={order._id} className="my-orders-order">
                      <img src={assets.parcel_icon} alt="Parcel Icon" />
                      <p>
                        {order.items
                          .map((item) => `${item.name} x ${item.quantity}`)
                          .join(', ')}
                      </p>
                      <p>{currency}{parseFloat(order.amount).toFixed(2)}</p>
                      <p>Items: {order.items.length}</p>
                      <p>
                        <span>&#x25cf;</span> <b>{order.status}</b>
                      </p>

                      {/* Delivery OTP visible only during Out for Delivery */}
                      {order.status === 'Out for Delivery' && (
                        <div className="delivery-otp-section">
                          <p>
                            <strong>Your Delivery OTP:</strong>{' '}
                            <span style={{ color: '#222', fontWeight: 600 }}>
                              {order.deliveryOtp || 'N/A'}
                            </span>
                          </p>
                          <p style={{ fontSize: '0.9rem', color: '#666' }}>
                            Please share this OTP with the delivery partner when they arrive.
                          </p>

                        </div>
                      )}

                      {/* Track / Cancel */}
                      {trackingOrderId === order._id ? (
                        (order.status === 'Food Processing' ||
                          order.status === 'Waiting for Pickup') ? (
                          <button
                            className="cancel-btn"
                            onClick={() => cancelOrder(order._id)}
                          >
                            Cancel Order
                          </button>
                        ) : (
                          <p style={{ color: 'gray', fontSize: '0.9rem' }}>
                            This order can no longer be cancelled.
                          </p>
                        )
                      ) : (
                        <button onClick={() => setTrackingOrderId(order._id)}>
                          Track Order
                        </button>
                      )}
                    </div>
                  ))}
              </>
            )}

            {/* Delivered Orders */}
            {deliveredOrders.length > 0 && (
              <>
                <h3>Delivered Orders</h3>
                {deliveredOrders
                  .slice()
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .map((order) => (
                    <div key={order._id} className="my-orders-order delivered">
                      <img src={assets.parcel_icon} alt="Parcel Icon" />
                      <p>
                        {order.items
                          .map((item) => `${item.name} x ${item.quantity}`)
                          .join(', ')}
                      </p>
                      <p>{currency}{parseFloat(order.amount).toFixed(2)}</p>
                      <p>Items: {order.items.length}</p>
                      <p>
                        <span>&#x25cf;</span>{' '}
                        <b style={{ color: 'green' }}>{order.status}</b>
                      </p>
                      <p style={{ fontSize: '0.9rem', color: '#555' }}>
                        Delivered on {formatDate(order.updatedAt)}
                      </p>
                    </div>
                  ))}
              </>
            )}

            {/* Cancelled Orders */}
            {cancelledOrders.length > 0 && (
              <>
                <h3>Cancelled Orders</h3>
                {cancelledOrders
                  .slice()
                  .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                  .map((order) => (
                    <div
                      key={order._id}
                      className="my-orders-order cancelled"
                      style={{ opacity: 0.6 }}
                    >
                      <img src={assets.parcel_icon} alt="Parcel Icon" />
                      <p>
                        {order.items
                          .map((item) => `${item.name} x ${item.quantity}`)
                          .join(', ')}
                      </p>
                      <p>{currency}{parseFloat(order.amount).toFixed(2)}</p>
                      <p>Items: {order.items.length}</p>
                      <p>
                        <span>&#x25cf;</span>{' '}
                        <b style={{ color: 'red' }}>{order.status}</b>
                      </p>
                      <p style={{ fontSize: '0.9rem', color: '#555' }}>
                        Cancelled on {formatDate(order.updatedAt)}
                      </p>
                    </div>
                  ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
