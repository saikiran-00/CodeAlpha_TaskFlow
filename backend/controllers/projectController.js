const Project = require('../models/Project');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * @desc    Get all projects the user owns or is a member of
 * @route   GET /api/projects
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate('owner', 'name email')
      .populate('members', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new project
 * @route   POST /api/projects
 * @access  Private
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description, startDate, dueDate } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide a project name' });
    }

    // Create project with owner set to current user, and add owner to members
    const project = await Project.create({
      name,
      description,
      startDate,
      dueDate,
      owner: req.user._id,
      members: [req.user._id],
    });

    // Populate owner and members before returning
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single project by ID (with task stats)
 * @route   GET /api/projects/:id
 * @access  Private
 */
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is owner or member
    const isMember =
      project.owner._id.toString() === req.user._id.toString() ||
      project.members.some((m) => m._id.toString() === req.user._id.toString());

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    // Get task stats for this project
    const tasks = await Task.find({ project: project._id });
    const taskStats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'To Do').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      completed: tasks.filter((t) => t.status === 'Completed').length,
    };

    res.status(200).json({
      ...project.toObject(),
      taskStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a project (owner only)
 * @route   PUT /api/projects/:id
 * @access  Private
 */
const updateProject = async (req, res, next) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only the owner can update
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can update this project' });
    }

    const { name, description, startDate, dueDate, status } = req.body;

    project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description, startDate, dueDate, status },
      { new: true, runValidators: true }
    )
      .populate('owner', 'name email')
      .populate('members', 'name email');

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a project and all related tasks/comments (owner only)
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only the owner can delete
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can delete this project' });
    }

    // Delete all comments on tasks belonging to this project
    const taskIds = await Task.find({ project: project._id }).distinct('_id');
    await Comment.deleteMany({ task: { $in: taskIds } });

    // Delete all tasks in this project
    await Task.deleteMany({ project: project._id });

    // Delete the project itself
    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a member to a project by email (owner only)
 * @route   POST /api/projects/:id/members
 * @access  Private
 */
const addMember = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email address' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only the owner can add members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can add members' });
    }

    // Find the user by email
    const userToAdd = await User.findOne({ email: email.toLowerCase() });
    if (!userToAdd) {
      return res.status(404).json({ message: 'No user found with that email' });
    }

    // Check if user is already a member
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member of this project' });
    }

    // Add user to members
    project.members.push(userToAdd._id);
    await project.save();

    // Create notification for the added user
    await Notification.create({
      recipient: userToAdd._id,
      type: 'project_invitation',
      message: `You have been added to the project "${project.name}"`,
      relatedProject: project._id,
    });

    // Return populated project
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove a member from a project (owner only)
 * @route   DELETE /api/projects/:id/members/:userId
 * @access  Private
 */
const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Only the owner can remove members
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the project owner can remove members' });
    }

    // Cannot remove the owner
    if (req.params.userId === project.owner.toString()) {
      return res.status(400).json({ message: 'Cannot remove the project owner from members' });
    }

    // Remove user from members array
    project.members = project.members.filter(
      (memberId) => memberId.toString() !== req.params.userId
    );
    await project.save();

    await project.populate('owner', 'name email');
    await project.populate('members', 'name email');

    res.status(200).json(project);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
};
