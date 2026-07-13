// routes/userRoutes.js

import express from 'express';
import { loginUser, registerUser, getUserProfile } from '../controllers/userController.js';
import authMiddleware  from '../middleware/auth.js';

const userRouter = express.Router();

// Route to register a new user
userRouter.post('/register', registerUser);

// Route to login a user
userRouter.post('/login', loginUser);

userRouter.get('/profile', authMiddleware, getUserProfile);

export default userRouter;
