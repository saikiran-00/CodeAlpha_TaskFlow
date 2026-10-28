const express = require('express');
const router = express.Router();
const { deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Delete a comment (only author can delete)
router.delete('/:id', deleteComment);

module.exports = router;
