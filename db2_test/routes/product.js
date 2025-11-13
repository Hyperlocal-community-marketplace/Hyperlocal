const express = require("express");
const path = require("path");
const {
  isSeller,
  isAuthenticated,
  isAdminAuthenticatedMiddleware,
} = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const router = express.Router();
const pool = require("../db/db");
const { upload } = require("../multer");
const ErrorHandler = require("../utils/ErrorHandler");
const fs = require("fs");

router.post(
  "/create-product",
  isSeller,
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.body.shopId;
      const sellerIdFromToken = req.seller.id;
      if (parseInt(shopId, 10) !== sellerIdFromToken) {
        return next(
          new ErrorHandler(
            "You are not authorized to add products to this shop",
            403
          )
        );
      }

      const [shop] = await pool.query("SELECT * FROM Shops WHERE id = ?", [
        shopId,
      ]);
      if (shop.length === 0) {
        return next(new ErrorHandler("Shop Id is invalid!", 400));
      }

      const files = req.files;
      if (!files || files.length === 0) {
        return next(
          new ErrorHandler("You must upload at least one image.", 400)
        );
      }

      const imageUrls = files.map((file) => file.filename);

      const productData = {
        shopId: shopId,
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        tags: req.body.tags,
        originalPrice: req.body.originalPrice,
        discountPrice: req.body.discountPrice,
        stock: req.body.stock,
      };

      // Insert into Products table
      const [result] = await pool.query(
        `INSERT INTO Products (name, description, category, tags, originalPrice, discountPrice, stock, shopId, createdAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          productData.name,
          productData.description,
          productData.category,
          productData.tags,
          productData.originalPrice,
          productData.discountPrice,
          productData.stock,
          productData.shopId,
        ]
      );

      const productId = result.insertId;
      const imageInsertPromises = imageUrls.map((url) => {
        return pool.query(
          `INSERT INTO ProductImages (productId, imageUrl) VALUES (?, ?)`,
          [productId, url]
        );
      });
      await Promise.all(imageInsertPromises);
      const [insertedProduct] = await pool.query(
        "SELECT * FROM Products WHERE id = ?",
        [productId]
      );

      res.status(201).json({
        success: true,
        product: insertedProduct[0],
      });
    } catch (error) {
      if (req.files) {
        req.files.forEach((file) => {
          fs.unlink(file.path, () => {});
        });
      }
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.get(
  "/get-all-products-shop/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const shopId = req.params.id;
      const [products] = await pool.query(
        `SELECT p.*, JSON_ARRAYAGG(pi.imageUrl) as images 
         FROM Products p 
         LEFT JOIN ProductImages pi ON p.id = pi.productId 
         WHERE p.shopId = ? 
         GROUP BY p.id`,
        [shopId]
      );
      products.forEach((p) => {
        if (p.images && p.images[0] === null) {
          p.images = [];
        }
      });

      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.delete(
  "/delete-shop-product/:id",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;
      const sellerId = req.seller.id;
      const [productRows] = await pool.query(
        "SELECT * FROM Products WHERE id = ?",
        [productId]
      );
      if (productRows.length === 0) {
        return next(new ErrorHandler("Product not found with this id!", 404));
      }

      const product = productRows[0];
      if (product.shopId !== sellerId) {
        return next(
          new ErrorHandler("You are not authorized to delete this product", 403)
        );
      }
      const [images] = await pool.query(
        "SELECT * FROM ProductImages WHERE productId = ?",
        [productId]
      );
      if (images.length > 0) {
        images.forEach((image) => {
          const filePath = `uploads/${image.imageUrl}`;
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, () => {});
          }
        });
      }

      // Delete from ProductImages (child table) first
      await pool.query("DELETE FROM ProductImages WHERE productId = ?", [
        productId,
      ]);

      // Delete from Products (parent table)
      await pool.query("DELETE FROM Products WHERE id = ?", [productId]);

      res.status(200).json({
        success: true,
        message: "Product Deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.get(
  "/get-all-products",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const [products] = await pool.query(
        `SELECT p.*, JSON_ARRAYAGG(pi.imageUrl) as images 
         FROM Products p 
         LEFT JOIN ProductImages pi ON p.id = pi.productId 
         GROUP BY p.id 
         ORDER BY p.createdAt DESC`
      );
      products.forEach((p) => {
        if (p.images && p.images[0] === null) {
          p.images = [];
        }
      });

      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.get(
  "/get-product/:id",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;
      const [products] = await pool.query(
        `SELECT p.*, JSON_ARRAYAGG(pi.imageUrl) as images 
         FROM Products p 
         LEFT JOIN ProductImages pi ON p.id = pi.productId 
         WHERE p.id = ? 
         GROUP BY p.id`,
        [productId]
      );

      if (products.length === 0) {
        return next(new ErrorHandler("Product not found with this id!", 404));
      }

      const product = products[0];
      if (product.images && product.images[0] === null) {
        product.images = [];
      }
      const [shops] = await pool.query("SELECT * FROM Shops WHERE id = ?", [product.shopId]);
      const shop = shops[0] || {};
      const [reviewCounts] = await pool.query(
        "SELECT COUNT(*) as count FROM ProductReviews WHERE productId = ?",
        [productId]
      );

      res.status(200).json({
        success: true,
        product: {
          ...product,
          reviewCount: reviewCounts[0]?.count || 0,
          shop,
        },
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.get(
  "/get-reviews/:productId",
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.productId;
      const [reviews] = await pool.query(
        `SELECT pr.*, u.name as userName, u.avatar as userAvatar 
         FROM ProductReviews pr 
         JOIN Users u ON pr.userId = u.id 
         WHERE pr.productId = ? 
         ORDER BY pr.createdAt DESC`,
        [productId]
      );
      const formattedReviews = reviews.map((review) => ({
        id: review.id,
        productId: review.productId,
        userId: review.userId,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          id: review.userId,
          name: review.userName,
          avatar: review.userAvatar,
        },
      }));

      res.status(200).json({
        success: true,
        reviews: formattedReviews,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.put(
  "/create-new-review",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { userId, userName, rating, comment, productId, orderId } = req.body;
      const user = req.user;
      const [existingReviews] = await pool.query(
        "SELECT * FROM ProductReviews WHERE productId = ? AND userId = ?",
        [productId, user.id]
      );

      if (existingReviews.length > 0) {
        await pool.query(
          "UPDATE ProductReviews SET rating = ?, comment = ? WHERE id = ?",
          [rating, comment, existingReviews[0].id]
        );
      } else {
        await pool.query(
          "INSERT INTO ProductReviews (productId, userId, rating, comment, createdAt) VALUES (?, ?, ?, ?, NOW())",
          [productId, user.id, rating, comment]
        );
      }
      const [ratings] = await pool.query(
        "SELECT AVG(rating) AS avgRating FROM ProductReviews WHERE productId = ?",
        [productId]
      );
      const avgRating = ratings[0].avgRating || 0;

      await pool.query("UPDATE Products SET ratings = ? WHERE id = ?", [avgRating, productId]);
      res.status(200).json({
        success: true,
        message: "Reviewed successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  })
);

router.get(
  "/admin-all-products",
  isAdminAuthenticatedMiddleware,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const [products] = await pool.query(
        `SELECT p.*, JSON_ARRAYAGG(pi.imageUrl) as images 
         FROM Products p 
         LEFT JOIN ProductImages pi ON p.id = pi.productId 
         GROUP BY p.id 
         ORDER BY p.createdAt DESC`
      );

      products.forEach((p) => {
        if (p.images && p.images[0] === null) {
          p.images = [];
        }
      });

      res.status(200).json({
        success: true,
        products,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.delete(
  "/admin-delete-product/:id",
  isAdminAuthenticatedMiddleware,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;
      const [productRows] = await pool.query(
        "SELECT * FROM Products WHERE id = ?",
        [productId]
      );
      if (productRows.length === 0) {
        return next(new ErrorHandler("Product not found with this id!", 404));
      }
      const [images] = await pool.query(
        "SELECT * FROM ProductImages WHERE productId = ?",
        [productId]
      );
      if (images.length > 0) {
        images.forEach((image) => {
          const filePath = `uploads/${image.imageUrl}`;
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, () => {});
          }
        });
      }

      // Delete from ProductImages (child table) first
      await pool.query("DELETE FROM ProductImages WHERE productId = ?", [
        productId,
      ]);

      // Delete from Products (parent table)
      await pool.query("DELETE FROM Products WHERE id = ?", [productId]);

      res.status(200).json({
        success: true,
        message: "Product deleted successfully!",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.put(
  "/update-shop-product/:id",
  isSeller,
  upload.array("images"),
  catchAsyncErrors(async (req, res, next) => {
    try {
      const productId = req.params.id;
      const sellerId = req.seller.id;
      const [productRows] = await pool.query(
        "SELECT * FROM Products WHERE id = ?",
        [productId]
      );
      if (productRows.length === 0) {
        return next(new ErrorHandler("Product not found!", 404));
      }

      const product = productRows[0];
      if (product.shopId !== sellerId) {
        return next(
          new ErrorHandler("Unauthorized to update this product", 403)
        );
      }
      const {
        name,
        description,
        category,
        tags,
        originalPrice,
        discountPrice,
        stock,
      } = req.body;

      await pool.query(
        `UPDATE Products 
         SET name=?, description=?, category=?, tags=?, originalPrice=?, discountPrice=?, stock=? 
         WHERE id = ?`,
        [
          name,
          description,
          category,
          tags,
          originalPrice,
          discountPrice,
          stock,
          productId,
        ]
      );
      const files = req.files;
      if (files && files.length > 0) {
        const [oldImages] = await pool.query(
          "SELECT * FROM ProductImages WHERE productId = ?",
          [productId]
        );
        oldImages.forEach((img) => {
          const filePath = `uploads/${img.imageUrl}`;
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
        await pool.query("DELETE FROM ProductImages WHERE productId = ?", [productId]);
        const insertPromises = files.map((file) =>
          pool.query(
            "INSERT INTO ProductImages (productId, imageUrl) VALUES (?, ?)",
            [productId, file.filename]
          )
        );

        await Promise.all(insertPromises);
      }
      const [updatedProduct] = await pool.query(
        `SELECT p.*, JSON_ARRAYAGG(pi.imageUrl) AS images
         FROM Products p
         LEFT JOIN ProductImages pi ON p.id = pi.productId
         WHERE p.id = ?
         GROUP BY p.id`,
        [productId]
      );

      res.status(200).json({
        success: true,
        product: updatedProduct[0],
        message: "Product updated successfully",
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

router.post(
  "/validate-cart",
  catchAsyncErrors(async (req, res) => {
    const { cart } = req.body;

    if (!cart || cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const productIds = cart.map((item) => item.productId);
    const [products] = await pool.query(
      `SELECT id, stock FROM Products WHERE id IN (${productIds.join(",")})`
    );

    const productMap = new Map();
    products.forEach((p) => productMap.set(p.id, p.stock));

    const validProducts = [];
    const removedProducts = [];

    for (const item of cart) {
      const stock = productMap.get(item.productId);

      if (stock === undefined) {
        removedProducts.push(item);
        continue;
      }

      if (stock <= 0) {
        removedProducts.push(item);
        continue;
      }

      const correctedQuantity =
        item.quantity > stock ? stock : item.quantity;

      validProducts.push({
        ...item,
        quantity: correctedQuantity,
        availableStock: stock,
      });
    }

    res.status(200).json({
      success: true,
      validProducts,
      removedProducts,
    });
  })
);

module.exports = router;
