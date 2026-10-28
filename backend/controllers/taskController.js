const Task = require('../models/Task');
const Project = require('../models/Project');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

/**
 * @desc    Get tasks for a project (user must be a member)
 * @route   GET /api/tasks?project=xxx
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { project: projectId } = req.query;

    if (!projectId) {
      return res.status(400).json({ message: 'Please provide a project query parameter' });
    }

    // Verify the project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view tasks for this project' });
    }

    const tasks = await Task.find({ project: projectId })
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get tasks assigned to the current user
 * @route   GET /api/tasks/my
 * @access  Private
 */
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, project: projectId, assignedTo, priority, dueDate, status } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Please provide a title and project' });
    }

    // Verify project exists and user is a member
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to create tasks in this project' });
    }

    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      priority,
      dueDate,
      status,
    });

    // If a user was assigned, create a notification
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: assignedTo,
        type: 'task_assigned',
        message: `You have been assigned to the task "${title}" in project "${project.name}"`,
        relatedProject: project._id,
        relatedTask: task._id,
      });
    }

    // Populate before returning
    await task.populate('assignedTo', 'name email');
    await task.populate('project', 'name');

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify project membership
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    // Track changes for notifications
    const oldAssignedTo = task.assignedTo ? task.assignedTo.toString() : null;
    const oldStatus = task.status;

    // Update the task
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    // Notify if assignedTo changed
    if (
      req.body.assignedTo &&
      req.body.assignedTo !== oldAssignedTo &&
      req.body.assignedTo !== req.user._id.toString()
    ) {
      await Notification.create({
        recipient: req.body.assignedTo,
        type: 'task_assigned',
        message: `You have been assigned to the task "${task.title}" in project "${project.name}"`,
        relatedProject: project._id,
        relatedTask: task._id,
      });
    }

    // Notify assignee if status changed
    if (
      req.body.status &&
      req.body.status !== oldStatus &&
      task.assignedTo &&
      task.assignedTo._id.toString() !== req.user._id.toString()
    ) {
      await Notification.create({
        recipient: task.assignedTo._id,
        type: 'task_assigned',
        message: `Task "${task.title}" status changed to "${task.status}"`,
        relatedProject: project._id,
        relatedTask: task._id,
      });
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task and its comments
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify project membership
    const project = await Project.findById(task.project);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isMember =
      project.owner.toString() === req.user._id.toString() ||
      project.members.some((m) => m.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to delete this task' });
    }

    // Delete all comments for this task
    await Comment.deleteMany({ task: task._id });

    // Delete the task
    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, getMyTasks, createTask, updateTask, deleteTask };
