import userModel from "../models/userModel.js"

// add to user cart  
const addToCart = async (req, res) => {
   try {
      const { userId, itemId } = req.body;
      const userData = await userModel.findById(userId);
      if (!userData) return res.json({ success: false, message: "User not found" });

      const cartData = { ...userData.cartData };
      cartData[itemId] = (cartData[itemId] || 0) + 1;

      await userModel.findByIdAndUpdate(userId, { cartData });
      res.json({ success: true, message: "Added To Cart" });
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" });
   }
}

// remove food from user cart
const removeFromCart = async (req, res) => {
   try {
      const { userId, itemId } = req.body;
      const userData = await userModel.findById(userId);
      if (!userData) return res.json({ success: false, message: "User not found" });

      const cartData = { ...userData.cartData };
      if (cartData[itemId] && cartData[itemId] > 0) {
         cartData[itemId] -= 1;
         if (cartData[itemId] === 0) {
            delete cartData[itemId];
         }
         await userModel.findByIdAndUpdate(userId, { cartData });
         res.json({ success: true, message: "Removed From Cart" });
      } else {
         res.json({ success: false, message: "Item not in cart" });
      }
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" });
   }
}

// get user cart
const getCart = async (req, res) => {
   try {
      const { userId } = req.body;
      const userData = await userModel.findById(userId);
      if (!userData) return res.json({ success: false, message: "User not found" });

      res.json({ success: true, cartData: userData.cartData });
   } catch (error) {
      console.log(error);
      res.json({ success: false, message: "Error" });
   }
}

export { addToCart, removeFromCart, getCart }