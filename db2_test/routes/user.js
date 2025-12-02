const express = require("express");
const path = require("path");
const router = express.Router();
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const {
  isAuthenticated,
  isSeller,
  isAdminAuthenticatedMiddleware,
} = require("../middleware/auth");
const { upload } = require("../multer");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const pool = require("../db/db");
const sendToken = require("../utils/jwtToken");
const {
  getCoordinatesFromPincode,
  getCoordinatesFromZipcode,
} = require("../utils/geoService");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/cloudinary");

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
    console.error(`Error deleting orphan location ${zipCode}:`, error.message);
  }
};

router.post(
  "/create-user",
  upload.single("file"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, name, password, zipCode } = req.body;

      if (email && email.endsWith("@hyperlocal.com")) {
        if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
        return next(
          new ErrorHandler("Invalid email domain for user registration", 400)
        );
      }

      const [existingUser] = await pool.query(
        "SELECT * FROM Users WHERE email = ?",
        [email]
      );
      if (existingUser.length > 0) {
        if (req.file) fs.unlink(req.file.path, () => {});
        return next(new ErrorHandler("User already exists", 400));
      }

      let avatarUrl = null;
      if (req.file) {
        try {
          const uploadResult = await uploadToCloudinary(req.file.path, 'hyperlocal/avatars');
          avatarUrl = uploadResult.url;
          // Delete temp file after upload
          fs.unlink(req.file.path, () => {});
        } catch (error) {
          if (req.file) fs.unlink(req.file.path, () => {});
          return next(new ErrorHandler("Image upload failed", 500));
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
      }

      const [result] = await pool.query(
        `INSERT INTO Users (name, email, avatar, password, zipcode, createdAt)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [name, email, avatarUrl, hashedPassword, zipCode || null]
      );

      const [userRows] = await pool.query(
        `SELECT u.*, l.city, l.country, l.latitude, l.longitude 
         FROM Users AS u
         LEFT JOIN Locations AS l ON u.zipCode = l.zipCode
         WHERE u.id = ?`,
        [result.insertId]
      );

      if (userRows.length === 0) {
        return next(
          new ErrorHandler("Failed to create user after insert", 500)
        );
      }

      const user = userRows[0];
      sendToken(user, 201, res);
    } catch (error) {
      if (req.file) fs.unlink(`uploads/${req.file.filename}`, () => {});
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.put(
  "/update-user-info",
  isAuthenticated,
  upload.single("file"), 
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { name, email, phoneNumber, address, zipCode } = req.body;
      const userId = req.user.id;
      let oldZipCode = null;

      const [currentUser] = await pool.query(
        "SELECT * FROM Users WHERE id = ?",
        [userId]
      );
      if (currentUser.length === 0) {
        return next(new ErrorHandler("User not found", 404));
      }

      const user = currentUser[0];
      oldZipCode = user.zipCode;

      if (zipCode && zipCode !== oldZipCode) {
        const coords = await getCoordinatesFromPincode(zipCode);

        if (!coords) {
          if (req.file) fs.unlink(req.file.path, () => {}); // Clean up file
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

      const updates = [];
      const values = [];

      if (name) {
        updates.push("name = ?");
        values.push(name);
      }
      if (email) {
        updates.push("email = ?");
        values.push(email);
      }
      if (phoneNumber) {
        updates.push("phoneNumber = ?");
        values.push(phoneNumber);
      }
      if (address) {
        updates.push("address = ?");
        values.push(address);
      }
      if (zipCode) {
        updates.push("zipcode = ?");
        values.push(zipCode);
      }
      if (req.file) {
        if (user.avatar) {
          const avatarPath = path.join("uploads", user.avatar);
          fs.unlink(avatarPath, (err) => {
            if (err) console.error("Error deleting old avatar:", err.message);
          });
        }
        updates.push("avatar = ?");
        values.push(req.file.filename);
      }

      if (updates.length > 0) {
        updates.push("updatedAt = NOW()");
        values.push(userId);

        await pool.query(
          `UPDATE Users SET ${updates.join(", ")} WHERE id = ?`,
          values
        );
      }

      if (zipCode && zipCode !== oldZipCode && oldZipCode) {
        await deleteOrphanLocation(oldZipCode);
      }

      const [updatedUser] = await pool.query(
        `SELECT u.*, l.city, l.country, l.latitude, l.longitude 
         FROM Users AS u
         LEFT JOIN Locations AS l ON u.zipCode = l.zipCode
         WHERE u.id = ?`,
        [userId]
      );

      res.status(200).json({ success: true, user: updatedUser[0] });
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
           if (err) console.error("Error deleting uploaded file on failure:", err.message);
        });
      }
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.post(
  "/login-user",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return next(new ErrorHandler("Please provide all the fields!", 400));
      }
      if (email && email.endsWith("@hyperlocal.com")) {
        return next(
          new ErrorHandler("Use admin login for @hyperlocal.com emails", 400)
        );
      }

      const [users] = await pool.query(
        `SELECT u.*, l.city, l.country, l.latitude, l.longitude 
         FROM Users AS u
         LEFT JOIN Locations AS l ON u.zipCode = l.zipCode
         WHERE u.email = ?`,
        [email]
      );

      if (users.length === 0) {
        return next(new ErrorHandler("User doesn't exist!", 400));
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return next(new ErrorHandler("Invalid credentials", 400));
      }

      sendToken(user, 201, res);
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


router.get(
  "/getuser",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    const [users] = await pool.query(
      `SELECT u.*, l.city, l.country, l.latitude, l.longitude 
       FROM Users AS u
       LEFT JOIN Locations AS l ON u.zipCode = l.zipCode
       WHERE u.id = ?`,
      [req.user.id]
    );
    if (users.length === 0) {
      return next(new ErrorHandler("User doesn't exist", 400));
    }
    res.status(200).json({ success: true, user: users[0] });
  })
);

router.get(
  "/user-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    // Allow both authenticated users and sellers to access user info
    const userToken = req.cookies.token;
    const sellerToken = req.cookies.seller_token;
    
    if (!userToken && !sellerToken) {
      return next(new ErrorHandler("Please login to continue", 401));
    }
    
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return next(new ErrorHandler("Invalid user ID", 400));
    }
    
    const [users] = await pool.query(
      `SELECT u.id, u.name, u.avatar, u.createdAt,
              l.city, l.country
       FROM Users AS u
       LEFT JOIN Locations AS l ON u.zipCode = l.zipCode
       WHERE u.id = ?`,
      [userId]
    );
    if (users.length === 0) {
      return next(new ErrorHandler("User doesn't exist", 404));
    }
    res.status(200).json({ success: true, user: users[0] });
  })
);

router.get("/logout", (req, res) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
  res.status(201).json({ success: true, message: "Log out successful!" });
});

router.get(
  "/admin-all-users",
  isAdminAuthenticatedMiddleware,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const [users] = await pool.query(
        `SELECT u.*, l.city, l.country, l.latitude, l.longitude 
         FROM Users AS u
         LEFT JOIN Locations AS l ON u.zipCode = l.zipCode
         ORDER BY u.createdAt DESC`
      );
      res.status(200).json({
        success: true,
        users,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.get("/nearby-shops/:userId", async (req, res) => {
  const { userId } = req.params;
  const radiusKm = Number(req.query.radius ?? 20);

  try {
    // Get user coordinates
    const [users] = await pool.query(
      `SELECT l.latitude, l.longitude 
       FROM Users AS u
       LEFT JOIN Locations AS l ON u.zipCode = l.zipCode
       WHERE u.id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { latitude, longitude } = users[0];
    if (latitude == null || longitude == null) {
      return res.status(400).json({
        success: false,
        message: "User location not set. Please update your zipcode/address in profile.",
      });
    }
    const sql = `
      SELECT
        s.id, s.name, s.address, s.phoneNumber, s.email,
        l.latitude, l.longitude,
        (6371 * ACOS(
          LEAST(1, GREATEST(-1,
            COS(RADIANS(?)) * COS(RADIANS(l.latitude)) *
            COS(RADIANS(l.longitude) - RADIANS(?)) +
            SIN(RADIANS(?)) * SIN(RADIANS(l.latitude))
          ))
        )) AS distance
      FROM Shops AS s
      JOIN Locations AS l ON s.zipCode = l.zipCode
      WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL
      HAVING distance < ?
      ORDER BY distance ASC
    `;
    const params = [latitude, longitude, latitude, radiusKm];

    const [shops] = await pool.query(sql, params);

    if (shops.length === 0) {
      return res.status(200).json({
        success: true,
        shops: [],
        message: `No shops found within ${radiusKm} km having valid coordinates.`,
      });
    }

    res.json({ success: true, shops });
  } catch (error) {
    console.error("Error in /nearby-shops:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching nearby shops",
    });
  }
});

module.exports = router;
