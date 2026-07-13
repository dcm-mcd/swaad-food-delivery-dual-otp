import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routers and config (update the paths as per your project)
import { connectDB } from './config/db.js';
import userRouter from './routes/userRoute.js';
import foodRouter from './routes/foodRoute.js';
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';

/*import deliveryDriverRoutes from "./routes/deliveryDriverRoutes.js";*/


// Load env variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files (for uploads/images)
app.use('/images', express.static('uploads'));

// Connect Database (choose either connectDB or mongoose.connect pattern)
// If connectDB is your own function, use it; otherwise, use this:
if (typeof connectDB === 'function') {
  connectDB();
} else {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// API Routes
app.use('/api/user', userRouter);
app.use('/api/food', foodRouter);
app.use('/api/cart', cartRouter);
app.use('/api/order', orderRouter);

/*app.use("/driver", deliveryDriverRoutes);*/



// Test endpoint
app.get('/', (req, res) => {
  res.send('API Working');
});

// Start server
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});

