const express = require("express");
const router = express.Router();
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { isAuthenticated, isSeller, isAdminAuthenticatedMiddleware } = require("../middleware/auth");
const pool = require("../db/db");

router.post(
  "/create-order",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { cart, shippingAddress, user, totalPrice, paymentInfo } = req.body;
      
      // Validate zipcode matches user's zipcode (hyperlocal marketplace requirement)
      const userId = req.user.id;
      const [userRows] = await pool.query("SELECT zipCode FROM Users WHERE id = ?", [userId]);
      if (userRows.length === 0) {
        return next(new ErrorHandler("User not found", 404));
      }
      const userZipCode = userRows[0].zipCode;
      if (userZipCode && shippingAddress.zipCode && shippingAddress.zipCode !== userZipCode) {
        return next(new ErrorHandler("ZIP Code cannot be changed. Orders must be placed within your registered location.", 400));
      }
      if (userZipCode && !shippingAddress.zipCode) {
        shippingAddress.zipCode = userZipCode;
      }
      
      const shopItemsMap = new Map();
      for (const item of cart) {
        const shopId = item.shopId;
        if (!shopItemsMap.has(shopId)) shopItemsMap.set(shopId, []);
        shopItemsMap.get(shopId).push(item);
      }
      const insertedOrders = [];
      for (const [shopId, items] of shopItemsMap) {
        for (const item of items) {
          const productId = item.productId || item.id;
          const quantity = item.quantity || item.qty || 1;
          const [productRows] = await pool.query("SELECT stock FROM Products WHERE id = ?", [productId]);
          if (productRows.length === 0) {
            return next(new ErrorHandler(`Product ${productId} not found`, 404));
          }
          const currentStock = productRows[0].stock;
          if (currentStock < quantity) {
            return next(new ErrorHandler(`Insufficient stock for product ${productId}. Available: ${currentStock}, Requested: ${quantity}`, 400));
          }
          await pool.query("UPDATE Products SET stock = stock - ? WHERE id = ?", [quantity, productId]);
        }
        const [result] = await pool.query(
          `INSERT INTO ORDERS (cart, shippingAddress, user, totalPrice, paymentInfo, shopId, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, 'Pending', NOW(), NOW())`,
          [
            JSON.stringify(items),
            JSON.stringify(shippingAddress),
            JSON.stringify(user), 
            totalPrice,
            JSON.stringify(paymentInfo),
            shopId,
          ]
        );

        const [insertedOrder] = await pool.query(
          "SELECT * FROM ORDERS WHERE id = ?",
          [result.insertId]
        );
        insertedOrders.push(insertedOrder[0]);
      }

      res.status(201).json({
        success: true,
        orders: insertedOrders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/get-all-orders/:userId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      if (isNaN(userId)) {
        return next(new ErrorHandler("Invalid user ID", 400));
      }
      let [orders] = await pool.query(
        'SELECT * FROM ORDERS WHERE JSON_EXTRACT(user, "$.id") = ? ORDER BY createdAt DESC',
        [userId]
      );
      if (orders.length === 0) {
        const [allOrders] = await pool.query(
          'SELECT * FROM ORDERS ORDER BY createdAt DESC'
        );
        orders = allOrders.filter(order => {
          try {
            const userData = typeof order.user === 'string' 
              ? JSON.parse(order.user) 
              : order.user;
            return userData && userData.id === userId;
          } catch {
            return false;
          }
        });
      }

      res.status(200).json({
        success: true,
        orders: orders || [],
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/get-seller-all-orders/:shopId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.params.shopId;
      const [orders] = await pool.query(
        "SELECT * FROM ORDERS WHERE shopId = ? ORDER BY createdAt DESC",
        [shopId]
      );

      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.put(
  "/update-order-status/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const orderId = req.params.id;
      const { status } = req.body;
      const [orderRows] = await pool.query("SELECT * FROM ORDERS WHERE id = ?", [orderId]);
      if (orderRows.length === 0) {
        return next(new ErrorHandler("Order not found with this id", 400));
      }
      const order = orderRows[0];
      let deliveredAt = order.deliveredAt;
      let paymentInfo = typeof order.paymentInfo === "string" ? JSON.parse(order.paymentInfo) : order.paymentInfo;

      if (status === "Delivered") {
        deliveredAt = new Date();
        paymentInfo.status = "Succeeded";
      }

      await pool.query(
        "UPDATE ORDERS SET status = ?, deliveredAt = ?, paymentInfo = ?, updatedAt = NOW() WHERE id = ?",
        [status, deliveredAt, JSON.stringify(paymentInfo), orderId]
      );
      const [updatedOrderRows] = await pool.query("SELECT * FROM ORDERS WHERE id = ?", [orderId]);
      res.status(200).json({
        success: true,
        order: updatedOrderRows[0],
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/admin-all-orders",
  isAdminAuthenticatedMiddleware,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const [orders] = await pool.query(
        "SELECT * FROM ORDERS ORDER BY deliveredAt DESC, createdAt DESC"
      );
      res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


module.exports = router;

