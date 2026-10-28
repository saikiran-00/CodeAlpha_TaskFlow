const Comment = require('../models/Comment');
const Task = require('../models/Task');
const Project = require('../models/Project');
const Notification = require('../models/Notification');

/**
 * @desc    Get comments for a task
 * @route   GET /api/tasks/:taskId/comments
 * @access  Private
 */
const getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ task: req.params.taskId })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a comment on a task
 * @route   POST /api/tasks/:taskId/comments
 * @access  Private
 */
const createComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Please provide comment text' });
    }

    // Find the task
    const task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify project membership through the task
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to comment on this task' });
    }

    // Create the comment
    const comment = await Comment.create({
      text,
      task: req.params.taskId,
      author: req.user._id,
    });

    // Notify the task assignee (if different from commenter)
    if (task.assignedTo && task.assignedTo.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: task.assignedTo,
        type: 'comment_added',
        message: `${req.user.name} commented on task "${task.title}": "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
        relatedProject: project._id,
        relatedTask: task._id,
      });
    }

    // Populate author before returning
    await comment.populate('author', 'name email');

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a comment (author only)
 * @route   DELETE /api/comments/:id
 * @access  Private
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Only the author can delete their comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the comment author can delete this comment' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getComments, createComment, deleteComment };
