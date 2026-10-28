const express = require('express');
const router = express.Router();
const {
  getTasks,
  getMyTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { getComments, createComment } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Task CRUD
router.route('/').get(getTasks).post(createTask);
router.get('/my', getMyTasks);
router.route('/:id').put(updateTask).delete(deleteTask);

// Comments nested under tasks
router.route('/:taskId/comments').get(getComments).post(createComment);

module.exports = router;
