const express = require('express');
const router = express.Router();
const pool = require('../db/db');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const { isSeller, isAuthenticated, isUserOrSeller } = require('../middleware/auth');

// Create new conversation
router.post(
  '/create-new-conversation',
  isUserOrSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { groupTitle, userId, sellerId } = req.body;
      if (!userId || !sellerId) {
        return next(new ErrorHandler('Both userId and sellerId are required', 400));
      }
      const userIdNum = parseInt(userId, 10);
      const sellerIdNum = parseInt(sellerId, 10);
      if (isNaN(userIdNum) || isNaN(sellerIdNum)) {
        return next(new ErrorHandler('userId and sellerId must be valid numbers', 400));
      }
      const [userRows] = await pool.query('SELECT id FROM Users WHERE id = ?', [userIdNum]);
      if (userRows.length === 0) {
        return next(new ErrorHandler('User not found', 404));
      }
      const [sellerRows] = await pool.query('SELECT id FROM Shops WHERE id = ?', [sellerIdNum]);
      if (sellerRows.length === 0) {
        return next(new ErrorHandler('Seller not found', 404));
      }
      const [existingConversation] = await pool.query(
        'SELECT * FROM CONVERSATION WHERE userId = ? AND sellerId = ?',
        [userIdNum, sellerIdNum]
      );
      if (existingConversation.length > 0) {
        return res.status(201).json({
          success: true,
          conversation: existingConversation[0]
        });
      }
      const [result] = await pool.query(
        'INSERT INTO CONVERSATION (groupTitle, userId, sellerId, createdAt, updatedAt) VALUES (?, ?, ?, NOW(), NOW())',
        [groupTitle, userIdNum, sellerIdNum]
      );
      const [newConversation] = await pool.query('SELECT * FROM CONVERSATION WHERE id = ?', [result.insertId]);
      res.status(201).json({
        success: true,
        conversation: newConversation[0]
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);


// Get all conversations for seller
router.get(
  '/get-all-conversation-seller/:id',
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const sellerId = parseInt(req.params.id, 10);
      const loggedInSellerId = req.seller.id;
      if (sellerId !== loggedInSellerId) {
        return next(new ErrorHandler(`Unauthorized: Cannot view conversations for seller ${sellerId}. You are logged in as seller ${loggedInSellerId}`, 403));
      }
      const [conversations] = await pool.query(
        `SELECT * FROM CONVERSATION WHERE sellerId = ? ORDER BY updatedAt DESC, createdAt DESC`,
        [sellerId]
      );
      const formattedConversations = conversations.map(conv => ({
        id: conv.id,
        groupTitle: conv.groupTitle,
        userId: conv.userId,
        sellerId: conv.sellerId,
        lastMessage: conv.lastMessage,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      }));
      res.status(200).json({
        success: true,
        conversations: formattedConversations || []
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

// Get all conversations for user
router.get(
  '/get-all-conversation-user/:id',
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const loggedInUserId = req.user.id;
      if (userId !== loggedInUserId) {
        return next(new ErrorHandler(`Unauthorized: Cannot view conversations for user ${userId}. You are logged in as user ${loggedInUserId}`, 403));
      }
      const [conversations] = await pool.query(
        `SELECT * FROM CONVERSATION WHERE userId = ? ORDER BY updatedAt DESC, createdAt DESC`,
        [userId]
      );
      const formattedConversations = conversations.map(conv => ({
        id: conv.id,
        groupTitle: conv.groupTitle,
        userId: conv.userId,
        sellerId: conv.sellerId,
        lastMessage: conv.lastMessage,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt
      }));
      res.status(200).json({
        success: true,
        conversations: formattedConversations || []
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
