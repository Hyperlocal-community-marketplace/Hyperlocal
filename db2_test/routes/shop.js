const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");
const {
  isAuthenticated,
  isSeller,
  isAdminAuthenticatedMiddleware,
} = require("../middleware/auth");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const pool = require("../db/db");
const { getCoordinatesFromPincode } = require("../utils/geoService");
const sendShopToken = require("../utils/shopToken");

const deleteOrphanLocation = async (zipCode) => {
  if (!zipCode) return;

  console.log(`Checking if zip code ${zipCode} is an orphan...`);
  try {
    const [countRows] = await pool.query(
      `SELECT 
        (SELECT COUNT(*) FROM Users WHERE zipCode = ?) + 
        (SELECT COUNT(*) FROM Shops WHERE zipCode = ?) AS totalCount`,
      [zipCode, zipCode]
    );

    const totalCount = countRows[0].totalCount;
    if (totalCount === 0) {
      console.log(`Deleting orphan location: ${zipCode}`);
      await pool.query("DELETE FROM Locations WHERE zipCode = ?", [zipCode]);
    } else {
      console.log(`Zip code ${zipCode} is still in use by ${totalCount} entries.`);
    }
  } catch (error) {
    // Log the error but don't fail the main request
    console.error(`Error deleting orphan location ${zipCode}:`, error.message);
  }
};

router.post(
  "/create-shop",
  upload.single("file"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, name, password, address, phoneNumber, zipCode } = req.body;

      if (email && email.endsWith("@hyperlocal.com")) {
        if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
        return next(
          new ErrorHandler("Invalid email domain for seller registration", 400)
        );
      }

      const [existingShop] = await pool.query(
        "SELECT * FROM Shops WHERE email = ?",
        [email]
      );
      if (existingShop.length > 0) {
        if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
        return next(new ErrorHandler("Shop already exists", 400));
      }

      // Upload avatar to Cloudinary if provided
      let avatarUrl = null;
      if (req.file) {
        try {
          const cloudinaryResult = await uploadToCloudinary(req.file.path, 'hyperlocal/shops');
          avatarUrl = cloudinaryResult.url;
          // Delete temp file after upload
          fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting temp file:", err.message);
          });
        } catch (uploadError) {
          if (req.file) fs.unlink(req.file.path, () => {});
          return next(new ErrorHandler("Failed to upload image", 500));
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      if (zipCode) {
        const coords = await getCoordinatesFromPincode(zipCode);

        if (!coords) {
          if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {}); // Clean up file
          return next(
            new ErrorHandler(
              "Invalid zip code. Please provide a valid location.",
              400
            )
          );
        }

        await pool.query(
          `INSERT INTO Locations (zipCode, latitude, longitude, city, country)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             latitude = ?, longitude = ?, city = ?, country = ?`,
          [
            zipCode,
            coords.latitude,
            coords.longitude,
            coords.city || null,
            coords.country || null,
            coords.latitude,
            coords.longitude,
            coords.city || null,
            coords.country || null,
          ]
        );
      } else {
        if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
          return next(new ErrorHandler("Zip code is required.", 400));
      }

      const [result] = await pool.query(
        `INSERT INTO Shops (name, email, avatar, password, zipcode, address, phoneNumber, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [name, email, avatarUrl, hashedPassword, zipCode, address, phoneNumber]
      );

      const [shopRows] = await pool.query(
        `SELECT s.*, l.city, l.country, l.latitude, l.longitude 
         FROM Shops AS s
         LEFT JOIN Locations AS l ON s.zipCode = l.zipCode
         WHERE s.id = ?`,
        [result.insertId]
      );
      if (shopRows.length === 0) {
        return next(
          new ErrorHandler("Failed to create shop after insert", 500)
        );
      }

      sendShopToken(shopRows[0], 201, res);
    } catch (error) {
      if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide all the fields!", 400));
      }

      // Prevent admin emails from logging in as sellers
      if (email && email.endsWith("@hyperlocal.com")) {
        return next(
          new ErrorHandler("Use admin login for @hyperlocal.com emails", 400)
        );
      }

      const [users] = await pool.query(
        `SELECT s.*, l.city, l.country, l.latitude, l.longitude 
         FROM Shops AS s
         LEFT JOIN Locations AS l ON s.zipCode = l.zipCode
         WHERE s.email = ?`,
        [email]
      );
      if (users.length === 0) {
        return next(new ErrorHandler("Seller doesn't exist!", 400));
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return next(
          new ErrorHandler("Please provide the correct information", 400)
        );
      }

      sendShopToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/getSeller",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const [shops] = await pool.query(
        `SELECT s.*, l.city, l.country, l.latitude, l.longitude 
         FROM Shops AS s
         LEFT JOIN Locations AS l ON s.zipCode = l.zipCode
         WHERE s.id = ?`,
        [req.seller.id]
      );
      if (shops.length === 0) {
        return next(new ErrorHandler("User doesn't exist", 400));
      }
      res.status(200).json({
        success: true,
        seller: shops[0],
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/logout",
  catchAsyncErrors(async (req, res, next) => {
    try {
      res.cookie("seller_token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
      });
      res.status(201).json({
        success: true,
        message: "Log out successful!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const [shops] = await pool.query(
        `SELECT s.*, l.city, l.country, l.latitude, l.longitude 
         FROM Shops AS s
         LEFT JOIN Locations AS l ON s.zipCode = l.zipCode
         WHERE s.id = ?`,
        [req.params.id]
      );
      if (shops.length === 0) {
        return next(new ErrorHandler("Shop not found with this id", 404));
      }
      res.status(200).json({
        success: true,
        shop: shops[0],
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.put(
  "/update-shop-avatar",
  isSeller,
  upload.single("image"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const [shops] = await pool.query("SELECT * FROM Shops WHERE id = ?", [
        req.seller.id,
      ]);
      if (shops.length === 0) {
        return next(new ErrorHandler("Seller not found", 400));
      }

      const shop = shops[0];
      
      // Upload new avatar to Cloudinary
      let avatarUrl = null;
      try {
        const cloudinaryResult = await uploadToCloudinary(req.file.path, 'hyperlocal/shops');
        avatarUrl = cloudinaryResult.url;
        // Delete temp file after upload
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("Error deleting temp file:", err.message);
        });
      } catch (uploadError) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return next(new ErrorHandler("Failed to upload image", 500));
      }

      await pool.query("UPDATE Shops SET avatar = ? WHERE id = ?", [
        avatarUrl,
        req.seller.id,
      ]);

      const [updatedShops] = await pool.query(
        `SELECT s.*, l.city, l.country, l.latitude, l.longitude 
         FROM Shops AS s
         LEFT JOIN Locations AS l ON s.zipCode = l.zipCode
         WHERE s.id = ?`,
        [req.seller.id]
      );

      res.status(200).json({
        success: true,
        seller: updatedShops[0],
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, description, address, phoneNumber, zipCode } = req.body;

      const [shops] = await pool.query("SELECT zipCode FROM Shops WHERE id = ?", [
        req.seller.id,
      ]);
      if (shops.length === 0) {
        return next(new ErrorHandler("Shop not found", 400));
      }
      const oldZipCode = shops[0].zipCode;
      if (zipCode && zipCode !== oldZipCode) {
        const coords = await getCoordinatesFromPincode(zipCode);

        if (!coords) {
          return next(
            new ErrorHandler(
              "Invalid zip code. Please provide a valid location.",
              400
            )
          );
        }

        await pool.query(
          `INSERT INTO Locations (zipCode, latitude, longitude, city, country)
           VALUES (?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
             latitude = ?, longitude = ?, city = ?, country = ?`,
          [
            zipCode,
            coords.latitude,
            coords.longitude,
            coords.city || null,
            coords.country || null,
            coords.latitude,
            coords.longitude,
            coords.city || null,
            coords.country || null,
          ]
        );
      }

      await pool.query(
        "UPDATE Shops SET name = ?, description = ?, address = ?, phoneNumber = ?, zipcode = ?, updatedAt = NOW() WHERE id = ?",
        [name, description, address, phoneNumber, zipCode, req.seller.id]
      );

      if (zipCode && zipCode !== oldZipCode && oldZipCode) {
        await deleteOrphanLocation(oldZipCode);
      }

      const [updatedShop] = await pool.query(
        `SELECT s.*, l.city, l.country, l.latitude, l.longitude 
         FROM Shops AS s
         LEFT JOIN Locations AS l ON s.zipCode = l.zipCode
         WHERE s.id = ?`,
        [req.seller.id]
      );
      res.status(201).json({ success: true, shop: updatedShop[0] });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/all-shops",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const [sellers] = await pool.query(
        `SELECT 
           s.id, s.name, s.email, s.avatar, s.address, s.phoneNumber, s.description, s.createdAt,
           l.zipCode, l.city, l.country, l.latitude, l.longitude
         FROM Shops AS s
         LEFT JOIN Locations AS l ON s.zipCode = l.zipCode
         ORDER BY s.createdAt DESC`
      );
      res.status(200).json({
        success: true,
        shops: sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get(
  "/admin-all-sellers",
  isAdminAuthenticatedMiddleware,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const [sellers] = await pool.query(
        `SELECT s.*, l.city, l.country, l.latitude, l.longitude 
         FROM Shops AS s
         LEFT JOIN Locations AS l ON s.zipCode = l.zipCode
         ORDER BY s.createdAt DESC`
      );
      res.status(201).json({
        success: true,
        sellers,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.delete(
  "/delete-seller/:id",
  isAdminAuthenticatedMiddleware,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const [sellers] = await pool.query("SELECT * FROM Shops WHERE id = ?", [
        req.params.id,
      ]);
      if (sellers.length === 0) {
        return next(
          new ErrorHandler("Seller is not available with this id", 400)
        );
      }

      await pool.query("DELETE FROM Shops WHERE id = ?", [req.params.id]);

      res.status(201).json({
        success: true,
        message: "Seller deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get("/nearby-shops/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const radiusKm = parseFloat(req.query.radius) || 20;
    const [userRows] = await pool.query(
      `SELECT l.latitude, l.longitude 
       FROM Users AS u
       LEFT JOIN Locations AS l ON u.zipCode = l.zipCode
       WHERE u.id = ?`,
      [userId]
    );
    console.log(userRows);
    if (!userRows.length) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { latitude, longitude } = userRows[0];
    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ success: false, message: "User location not set" });
    }
    const [shops] = await pool.query(
      `
      SELECT 
        s.id, s.name, s.address, s.phoneNumber, s.email,
        l.latitude, l.longitude,
        (6371 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(l.latitude)) *
          COS(RADIANS(l.longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(l.latitude))
        )) AS distance
      FROM Shops AS s
      JOIN Locations AS l ON s.zipCode = l.zipCode
      HAVING distance <= ?
      ORDER BY distance ASC
      `,
      [latitude, longitude, latitude, radiusKm]
    );
    console.log(shops);
    return res.status(200).json({ success: true, shops });
  } catch (err) {
    console.error("Nearby shops error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
