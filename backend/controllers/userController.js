import pkg from 'jsonwebtoken';
const { sign } = pkg;
import { compare, genSalt, hash } from "bcrypt";
import validator from 'validator';
const { isEmail } = validator; // This works

import userModel from "../models/userModel.js"; 


// Create token
function createToken(id) {
    return sign({ id }, process.env.JWT_SECRET);
}

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email }); 

    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Register user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    const exists = await userModel.findOne({ email }); 
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Validating email format & strong password
    if (!isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" });
    }

    // Hashing user password
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};


export const getUserProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    const shouldGenerateOTP =
      !user.otp || !user.otpGeneratedAt ||
      (now - new Date(user.otpGeneratedAt)) > 2 * 24 * 60 * 60 * 1000; // 2 days

    if (shouldGenerateOTP) {
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      user.otp = newOtp;
      user.otpGeneratedAt = now;
      await user.save();
    }

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        otp: user.otp
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export { loginUser, registerUser }; 