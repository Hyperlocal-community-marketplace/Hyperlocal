const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const bcrypt = require("bcryptjs");
const pool = require("../db/db");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");

const { isAdminAuthenticatedMiddleware } = require("../middleware/auth");

router.post("/login", catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({ message: "Please provide email and password" });
    }
    const [admins] = await pool.query("SELECT * FROM Admins WHERE email = ?", [email]);
    if (admins.length === 0) {
      return res.status(401).json({ message: "Admin account not found" });
    }
    const admin = admins[0];
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }
      const token = jwt.sign(
      { id: admin.id, email, role: "admin" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "7d" }
      );
    const options = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
    };

    return res.status(200).cookie("admin_token", token, options).json({
        success: true,
      admin: { id: admin.id, email: admin.email, name: admin.name },
        token,
      });
  } catch (err) {
    next(err);
  }
}));

router.get("/dashboard", isAdminAuthenticatedMiddleware, (req, res) => {
  res.json({ message: "Welcome Admin 👑" });
});

router.get("/logout", (req, res) => {
  res.cookie("admin_token", "", { expires: new Date(0) });
  res.json({ success: true, message: "Admin Logged Out ✅" });
});

router.get("/orders", isAdminAuthenticatedMiddleware, catchAsyncErrors(async (req, res, next) => {
  try {
    const [orders] = await pool.query("SELECT * FROM ORDERS ORDER BY createdAt DESC");
    const enrichedOrders = await Promise.all(orders.map(async (order) => {
      const [shops] = await pool.query("SELECT id, name, email FROM Shops WHERE id = ?", [order.shopId]);
      return {
        ...order,
        shop: shops.length > 0 ? shops[0] : null
      };
    }));
    
    res.status(200).json({
      success: true,
      orders: enrichedOrders,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

router.get("/sellers", isAdminAuthenticatedMiddleware, catchAsyncErrors(async (req, res, next) => {
  try {
    const [sellers] = await pool.query("SELECT * FROM Shops ORDER BY createdAt DESC");
    
    res.status(200).json({
      success: true,
      sellers,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

router.delete("/sellers/:id", isAdminAuthenticatedMiddleware, catchAsyncErrors(async (req, res, next) => {
  try {
    const sellerId = req.params.id;
    const [sellers] = await pool.query("SELECT * FROM Shops WHERE id = ?", [sellerId]);
    
    if (sellers.length === 0) {
      return next(new ErrorHandler("Seller not found with this id", 404));
    }

    await pool.query("DELETE FROM Shops WHERE id = ?", [sellerId]);

    res.status(200).json({
      success: true,
      message: "Seller deleted successfully!",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

router.get("/users", isAdminAuthenticatedMiddleware, catchAsyncErrors(async (req, res, next) => {
  try {
    const [users] = await pool.query("SELECT * FROM Users ORDER BY createdAt DESC");
    
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

router.delete("/users/:id", isAdminAuthenticatedMiddleware, catchAsyncErrors(async (req, res, next) => {
  try {
    const userId = req.params.id;
    const [users] = await pool.query("SELECT * FROM Users WHERE id = ?", [userId]);
    
    if (users.length === 0) {
      return next(new ErrorHandler("User not found with this id", 404));
    }

    await pool.query("DELETE FROM Users WHERE id = ?", [userId]);

    res.status(200).json({
      success: true,
      message: "User deleted successfully!",
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}));

module.exports = router;
