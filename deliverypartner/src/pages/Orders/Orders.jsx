
import React, { useEffect, useState } from 'react';
import './Orders.css';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets, url, currency } from '../../assets/assets';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpInputs, setOtpInputs] = useState({});

  const fetchAssignedOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${url}/api/order/list`);
      if (res.data.success) {
        const filtered = res.data.data.filter(
          order => order.status === 'Waiting for Pickup' || order.status === 'Out for delivery'
        );
        setOrders(filtered.reverse());
      } else {
        setError('Failed to fetch orders');
        toast.error('Failed to fetch orders');
      }
    } catch {
      setError('Server error fetching orders');
      toast.error('Server error fetching orders');
    }
    setLoading(false);
  };

  const handleOtpChange = (orderId, value) => {
    setOtpInputs(prev => ({ ...prev, [orderId]: value }));
  };

  const handleOtpSubmit = async (orderId, currentStatus) => {
    const enteredOtp = otpInputs[orderId];
    if (!enteredOtp) return toast.warning('Please enter OTP');

    const endpoint =
      currentStatus === 'Waiting for Pickup'
        ? 'verify-pickup-otp'
        : 'verify-delivery-otp';

    try {
      const res = await axios.post(`${url}/api/order/${endpoint}`, {
        orderId,
        otp: enteredOtp,
      });

      if (res.data.success) {
        toast.success(
          currentStatus === 'Waiting for Pickup'
            ? 'Pickup OTP verified! Out for Delivery.'
            : 'Delivery OTP verified! Order Delivered.'
        );

        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? {
                  ...order,
                  status:
                    currentStatus === 'Waiting for Pickup'
                      ? 'Out for delivery'
                      : 'Delivered',
                }
              : order
          )
        );

        setOtpInputs(prev => ({ ...prev, [orderId]: '' }));
      } else {
        toast.error(res.data.message || 'Incorrect OTP');
      }
    } catch {
      toast.error('Server error verifying OTP');
    }
  };

  useEffect(() => {
    fetchAssignedOrders();
  }, []);

  if (loading) return <div>Loading orders...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="order add">
      <h3>Assigned Orders</h3>
      <div className="order-list">
        {orders.length === 0 && <p>No orders to deliver</p>}
        {orders.map((order, index) => (
          <div key={order._id || index} className="order-item">
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
                  {order.address.city}, {order.address.state}, {order.address.country},{' '}
                  {order.address.zipcode}
                </p>
              </div>
              <p className="order-item-phone">{order.address.phone}</p>
              <p><strong>Status:</strong> {order.status}</p>
            </div>

            <p>Items: {order.items.length}</p>
            <p>{currency}{order.amount}</p>

                     OTP Verification
            {(order.status === 'Waiting for Pickup' || order.status === 'Out for delivery') && (
              <div className="otp-verification">
                <input
                  type="text"
                  placeholder={
                    order.status === 'Waiting for Pickup'
                      ? 'Enter Pickup OTP'
                      : 'Enter Delivery OTP'
                  }
                  value={otpInputs[order._id] || ''}
                  onChange={(e) => handleOtpChange(order._id, e.target.value)}
                />
                <button onClick={() => handleOtpSubmit(order._id, order.status)}>
                  Verify OTP
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

