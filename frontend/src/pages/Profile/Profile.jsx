import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { StoreContext } from '../../Context/StoreContext';
import './Profile.css';
import { toast } from 'react-toastify';

const Profile = () => {
  const { token, url } = useContext(StoreContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${url}/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProfile(res.data.user);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  if (loading) return <div className="profile-loading">Loading profile...</div>;

  if (!token) {
    return (
      <div className="profile-not-logged-in">
        <h2>Please log in to view your profile.</h2>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h2 className="profile-title">My Profile</h2>
      {profile ? (
        <div className="profile-info">
          <p><strong>Name:</strong> {profile.name || 'N/A'}</p>
          <p><strong>Email:</strong> {profile.email || 'N/A'}</p>
          <p><strong>Profile OTP:</strong> {profile.otp}</p> {/* Display OTP */}
        </div>
      ) : (
        <p>Unable to load profile.</p>
      )}
    </div>
  );
};

export default Profile;
