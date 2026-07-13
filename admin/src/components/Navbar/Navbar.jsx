import React from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'

const Navbar = () => {
  return (
    <div className='navbar'>
      <img className='logo' src={assets.logo} alt="Logo" />
      <h2 className='navbar-title'>Swaad - Admin 🧑‍💼</h2>
      <img className='profile' src={assets.profile_image} alt="Profile" />
    </div>
  )
}

export default Navbar