const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const pool = require("../db/db");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) return next(new ErrorHandler("Please login to continue", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const [users] = await pool.query("SELECT * FROM Users WHERE id = ?", [decoded.id]);

  if (users.length === 0) return next(new ErrorHandler("User not found", 401));

  req.user = users[0];
  next();
});

exports.isSeller = catchAsyncErrors(async (req, res, next) => {
  const { seller_token } = req.cookies;
  if (!seller_token) return next(new ErrorHandler("Please login to continue", 401));

  const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
  const [sellers] = await pool.query("SELECT * FROM Shops WHERE id = ?", [decoded.id]);

  if (sellers.length === 0) return next(new ErrorHandler("Seller not found", 401));

  req.seller = sellers[0];
  next();
});

exports.isUserOrSeller = catchAsyncErrors(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.split(" ")[1];
  const { token, seller_token } = req.cookies;
  
  const tokenToUse = tokenFromHeader || token || seller_token;
  
  if (!tokenToUse) {
    return next(new ErrorHandler("Please login to continue", 401));
  }

  try {
    const decoded = jwt.verify(tokenToUse, process.env.JWT_SECRET_KEY);
    
    const [users] = await pool.query("SELECT * FROM Users WHERE id = ?", [decoded.id]);
    if (users.length > 0) {
      req.user = users[0];
      return next();
    }
    
    const [sellers] = await pool.query("SELECT * FROM Shops WHERE id = ?", [decoded.id]);
    if (sellers.length > 0) {
      req.seller = sellers[0];
      return next();
    }
    
    return next(new ErrorHandler("User or seller not found", 401));
  } catch (error) {
    return next(new ErrorHandler("Invalid or expired token", 401));
  }
});

exports.isAdminAuthenticatedMiddleware = catchAsyncErrors(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.admin_token;

  if (!token) return res.status(401).json({ message: "Admin login required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin only" });
    }
    const [admins] = await pool.query("SELECT * FROM Admins WHERE id = ?", [decoded.id]);
    if (admins.length > 0) {
      req.admin = admins[0];
    } else {
      return res.status(403).json({ message: "Admin account not found" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
});