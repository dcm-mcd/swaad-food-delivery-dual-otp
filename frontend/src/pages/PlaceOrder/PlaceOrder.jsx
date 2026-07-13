'use client';

import { useContext, useEffect, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../Context/StoreContext';
import { assets } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const [payment, setPayment] = useState("cod");
  const [useSavedAddress, setUseSavedAddress] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const {
    getTotalCartAmount,
    token,
    food_list,
    cartItems,
    url,
    setCartItems,
    currency,
    deliveryCharge
  } = useContext(StoreContext);

  const [data, setData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: ""
  });

  // Load saved address on first mount
  useEffect(() => {
    const savedAddress = localStorage.getItem("savedAddress");
    if (savedAddress) {
      setData(JSON.parse(savedAddress));
      setUseSavedAddress(true);
    }
  }, []);

  // Redirect unauthenticated or empty cart
  useEffect(() => {
    if (!token) {
      toast.error("Please sign in to place an order.");
      navigate('/cart');
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token, getTotalCartAmount, navigate]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    // Prepare items
    let orderItems = [];
    food_list.forEach(item => {
      if (cartItems[item._id] > 0) {
        orderItems.push({ ...item, quantity: cartItems[item._id] });
      }
    });

    if (orderItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    const subtotal = getTotalCartAmount();
    const gstAmount = parseFloat(((subtotal * 5) / 100).toFixed(2));
    const totalAmount = subtotal + gstAmount + deliveryCharge;

    const orderData = {
      address: data,
      items: orderItems,
      amount: parseFloat(totalAmount.toFixed(2)),
      paymentMethod: payment
    };

    setIsPlacingOrder(true);

    try {
      if (payment === "stripe") {
        const res = await axios.post(`${url}/api/order/place`, orderData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          window.location.replace(res.data.session_url);
        } else {
          toast.error("Stripe payment failed.");
        }
      } else {
        const res = await axios.post(`${url}/api/order/placecod`, orderData, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          localStorage.setItem("savedAddress", JSON.stringify(data));
          setCartItems({});
          toast.success(res.data.message || "Order placed!");
          if (res.data.otp) {
            alert(`Delivery OTP: ${res.data.otp}`);
          }
          navigate("/myorders");
        } else {
          toast.error("COD order failed.");
        }
      }
    } catch (err) {
      console.error("Order Error:", err);
      toast.error(err.response?.data?.message || "Order placement failed.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const subtotal = getTotalCartAmount();
  const gstAmount = parseFloat(((subtotal * 5) / 100).toFixed(2));
  const totalAmount = subtotal + gstAmount + deliveryCharge;

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className='title'>Delivery Information</p>

        <div className="address-toggle">
          <label>
            <input
              type="checkbox"
              checked={useSavedAddress}
              onChange={(e) => {
                const isChecked = e.target.checked;
                setUseSavedAddress(isChecked);
                if (isChecked) {
                  const saved = localStorage.getItem("savedAddress");
                  if (saved) setData(JSON.parse(saved));
                } else {
                  setData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    street: "",
                    city: "",
                    state: "",
                    zipcode: "",
                    country: "",
                    phone: ""
                  });
                }
              }}
            /> Use Saved Address
          </label>
        </div>

        <div className="multi-field">
          <input type="text" name='firstName' value={data.firstName} onChange={onChangeHandler} placeholder='First name' required readOnly={useSavedAddress} />
          <input type="text" name='lastName' value={data.lastName} onChange={onChangeHandler} placeholder='Last name' required readOnly={useSavedAddress} />
        </div>
        <input type="email" name='email' value={data.email} onChange={onChangeHandler} placeholder='Email address' required readOnly={useSavedAddress} />
        <input type="text" name='street' value={data.street} onChange={onChangeHandler} placeholder='Street' required readOnly={useSavedAddress} />
        <div className="multi-field">
          <input type="text" name='city' value={data.city} onChange={onChangeHandler} placeholder='City' required readOnly={useSavedAddress} />
          <input type="text" name='state' value={data.state} onChange={onChangeHandler} placeholder='State' required readOnly={useSavedAddress} />
        </div>
        <div className="multi-field">
          <input type="text" name='zipcode' value={data.zipcode} onChange={onChangeHandler} placeholder='Zip code' required readOnly={useSavedAddress} />
          <input type="text" name='country' value={data.country} onChange={onChangeHandler} placeholder='Country' required readOnly={useSavedAddress} />
        </div>
        <input type="tel" name='phone' value={data.phone} onChange={onChangeHandler} placeholder='Phone' required pattern="[0-9]{10}" readOnly={useSavedAddress} />
      </div>

      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div className="cart-total-details"><p>Subtotal</p><p>{currency}{subtotal}</p></div>
          <div className="cart-total-details"><p>GST (5%)</p><p>{currency}{gstAmount}</p></div>
          <hr />
          <div className="cart-total-details"><p>Delivery Fee</p><p>{currency}{deliveryCharge}</p></div>
          <hr />
          <div className="cart-total-details"><b>Total</b><b>{currency}{totalAmount}</b></div>
        </div>

        <div className="payment">
          <h2>Payment Method</h2>
          <div onClick={() => setPayment("cod")} className="payment-option">
            <img src={payment === "cod" ? assets.checked : assets.un_checked} alt="cod" />
            <p>COD (Cash on Delivery)</p>
          </div>
          <div onClick={() => setPayment("stripe")} className="payment-option">
            <img src={payment === "stripe" ? assets.checked : assets.un_checked} alt="stripe" />
            <p>Stripe (Credit / Debit Card)</p>
          </div>
        </div>

        <button type='submit' className='place-order-submit' disabled={isPlacingOrder}>
          {isPlacingOrder ? "Placing Order..." : (payment === "cod" ? "Place Order" : "Proceed To Payment")}
        </button>
      </div>
    </form>
  );
};

export default PlaceOrder;
