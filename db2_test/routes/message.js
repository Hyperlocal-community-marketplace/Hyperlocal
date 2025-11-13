const express = require('express');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const ErrorHandler = require('../utils/ErrorHandler');
const { isAuthenticated, isSeller, isUserOrSeller } = require('../middleware/auth');
const pool = require('../db/db');
const router = express.Router();

// Get all messages in a conversation
router.get(
  '/get-all-messages/:id',
  isUserOrSeller,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const conversationId = parseInt(req.params.id, 10);
      if (isNaN(conversationId)) {
        return next(new ErrorHandler('Invalid conversation ID', 400));
      }
      // Verify conversation exists
      const [conversations] = await pool.query('SELECT * FROM CONVERSATION WHERE id = ?', [conversationId]);
      if (conversations.length === 0) {
        return next(new ErrorHandler('Conversation not found', 404));
      }
      const [messages] = await pool.query(
        'SELECT * FROM MESSAGES WHERE conversationId = ? ORDER BY createdAt ASC', 
        [conversationId]
      );
      res.status(200).json({
        success: true,
        messages: messages || [],
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

module.exports = router;
