/**
 * seed.js — Populates the database with sample data for development.
 *
 * Usage:  node seed.js
 *         npm run seed
 *
 * WARNING: This script will clear ALL existing data before seeding.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Project = require('./models/Project');
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const Notification = require('./models/Notification');

dotenv.config();

const seedDB = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');

    // ────────────────────────────────────────────
    // 1. Clear all collections
    // ────────────────────────────────────────────
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    console.log('All collections cleared.');

    // ────────────────────────────────────────────
    // 2. Create users
    // ────────────────────────────────────────────
    const john = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    });

    const sarah = await User.create({
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      password: 'password123',
    });

    const mike = await User.create({
      name: 'Mike Johnson',
      email: 'mike@example.com',
      password: 'password123',
    });

    console.log('Users created.');

    // ────────────────────────────────────────────
    // 3. Create projects (owned by John)
    // ────────────────────────────────────────────
    const portfolioProject = await Project.create({
      name: 'Portfolio Website',
      description: 'A modern, responsive portfolio website showcasing projects and skills.',
      owner: john._id,
      members: [john._id, sarah._id, mike._id],
      startDate: new Date('2024-01-15'),
      dueDate: new Date('2024-04-30'),
      status: 'Active',
    });

    const ecommerceProject = await Project.create({
      name: 'E-Commerce App',
      description: 'Full-stack e-commerce application with product catalog, cart, and checkout.',
      owner: john._id,
      members: [john._id, sarah._id, mike._id],
      startDate: new Date('2024-02-01'),
      dueDate: new Date('2024-07-31'),
      status: 'Active',
    });

    const collegeProject = await Project.create({
      name: 'College Management System',
      description: 'A system for managing students, faculty, courses, and schedules.',
      owner: john._id,
      members: [john._id, sarah._id, mike._id],
      startDate: new Date('2024-03-01'),
      dueDate: new Date('2024-09-30'),
      status: 'On Hold',
    });

    console.log('Projects created.');

    // ────────────────────────────────────────────
    // 4. Create tasks
    // ────────────────────────────────────────────

    // --- Portfolio Website tasks ---
    const task1 = await Task.create({
      title: 'Design homepage wireframe',
      description: 'Create a wireframe for the landing page with hero section, about, and projects.',
      project: portfolioProject._id,
      assignedTo: sarah._id,
      priority: 'High',
      dueDate: new Date('2024-02-15'),
      status: 'Completed',
    });

    const task2 = await Task.create({
      title: 'Implement responsive navbar',
      description: 'Build a mobile-friendly navigation bar with hamburger menu.',
      project: portfolioProject._id,
      assignedTo: mike._id,
      priority: 'Medium',
      dueDate: new Date('2024-02-28'),
      status: 'Completed',
    });

    const task3 = await Task.create({
      title: 'Build project showcase section',
      description: 'Create a grid layout with project cards, images, and links.',
      project: portfolioProject._id,
      assignedTo: sarah._id,
      priority: 'High',
      dueDate: new Date('2024-03-15'),
      status: 'In Progress',
    });

    const task4 = await Task.create({
      title: 'Add contact form with validation',
      description: 'Implement a contact form with email sending and input validation.',
      project: portfolioProject._id,
      assignedTo: john._id,
      priority: 'Medium',
      dueDate: new Date('2024-03-30'),
      status: 'To Do',
    });

    const task5 = await Task.create({
      title: 'Deploy to hosting platform',
      description: 'Deploy the portfolio website to Vercel or Netlify with a custom domain.',
      project: portfolioProject._id,
      assignedTo: john._id,
      priority: 'Low',
      dueDate: new Date('2024-04-15'),
      status: 'To Do',
    });

    // --- E-Commerce App tasks ---
    const task6 = await Task.create({
      title: 'Set up product database schema',
      description: 'Design MongoDB schemas for products, categories, and reviews.',
      project: ecommerceProject._id,
      assignedTo: john._id,
      priority: 'High',
      dueDate: new Date('2024-02-20'),
      status: 'Completed',
    });

    const task7 = await Task.create({
      title: 'Build product listing page',
      description: 'Create a product grid with filtering, sorting, and pagination.',
      project: ecommerceProject._id,
      assignedTo: sarah._id,
      priority: 'High',
      dueDate: new Date('2024-03-15'),
      status: 'In Progress',
    });

    const task8 = await Task.create({
      title: 'Implement shopping cart',
      description: 'Build shopping cart with add/remove items, quantity updates, and total calculation.',
      project: ecommerceProject._id,
      assignedTo: mike._id,
      priority: 'High',
      dueDate: new Date('2024-04-01'),
      status: 'To Do',
    });

    const task9 = await Task.create({
      title: 'Integrate payment gateway',
      description: 'Set up Stripe payment processing for checkout.',
      project: ecommerceProject._id,
      assignedTo: john._id,
      priority: 'High',
      dueDate: new Date('2024-05-01'),
      status: 'To Do',
    });

    const task10 = await Task.create({
      title: 'Build order tracking system',
      description: 'Allow users to track order status and history.',
      project: ecommerceProject._id,
      assignedTo: sarah._id,
      priority: 'Medium',
      dueDate: new Date('2024-06-01'),
      status: 'To Do',
    });

    // --- College Management System tasks ---
    const task11 = await Task.create({
      title: 'Design database ER diagram',
      description: 'Create ER diagram for students, faculty, courses, and enrollments.',
      project: collegeProject._id,
      assignedTo: john._id,
      priority: 'High',
      dueDate: new Date('2024-03-20'),
      status: 'Completed',
    });

    const task12 = await Task.create({
      title: 'Build student registration module',
      description: 'Implement student registration with form validation and data storage.',
      project: collegeProject._id,
      assignedTo: mike._id,
      priority: 'High',
      dueDate: new Date('2024-04-15'),
      status: 'In Progress',
    });

    const task13 = await Task.create({
      title: 'Create faculty dashboard',
      description: 'Build a dashboard for faculty to manage courses and view student lists.',
      project: collegeProject._id,
      assignedTo: sarah._id,
      priority: 'Medium',
      dueDate: new Date('2024-05-15'),
      status: 'To Do',
    });

    const task14 = await Task.create({
      title: 'Implement attendance tracking',
      description: 'Build an attendance system with calendar view and reporting.',
      project: collegeProject._id,
      assignedTo: mike._id,
      priority: 'Medium',
      dueDate: new Date('2024-06-15'),
      status: 'To Do',
    });

    const task15 = await Task.create({
      title: 'Generate report cards',
      description: 'Create a module to generate and export student report cards as PDF.',
      project: collegeProject._id,
      assignedTo: john._id,
      priority: 'Low',
      dueDate: new Date('2024-08-01'),
      status: 'To Do',
    });

    console.log('Tasks created.');

    // ────────────────────────────────────────────
    // 5. Create sample comments
    // ────────────────────────────────────────────
    await Comment.create({
      text: 'The wireframe looks great! Let\'s add a dark mode toggle to the hero section.',
      task: task1._id,
      author: john._id,
    });

    await Comment.create({
      text: 'I\'ve finished the mobile breakpoints. Please review the tablet layout.',
      task: task2._id,
      author: mike._id,
    });

    await Comment.create({
      text: 'Should we use a carousel or a grid for the project cards?',
      task: task3._id,
      author: sarah._id,
    });

    await Comment.create({
      text: 'Let\'s go with a grid layout — it\'s better for accessibility.',
      task: task3._id,
      author: john._id,
    });

    await Comment.create({
      text: 'The product schema is ready for review. I added support for variants (size, color).',
      task: task6._id,
      author: john._id,
    });

    await Comment.create({
      text: 'The ER diagram has been updated with the new attendance tables.',
      task: task11._id,
      author: john._id,
    });

    console.log('Comments created.');

    // ────────────────────────────────────────────
    // 6. Create sample notifications
    // ────────────────────────────────────────────
    await Notification.create({
      recipient: sarah._id,
      type: 'task_assigned',
      message: 'You have been assigned to "Design homepage wireframe" in Portfolio Website',
      relatedProject: portfolioProject._id,
      relatedTask: task1._id,
      read: true,
    });

    await Notification.create({
      recipient: mike._id,
      type: 'task_assigned',
      message: 'You have been assigned to "Implement responsive navbar" in Portfolio Website',
      relatedProject: portfolioProject._id,
      relatedTask: task2._id,
      read: false,
    });

    await Notification.create({
      recipient: sarah._id,
      type: 'project_invitation',
      message: 'You have been added to the project "E-Commerce App"',
      relatedProject: ecommerceProject._id,
      read: true,
    });

    await Notification.create({
      recipient: mike._id,
      type: 'project_invitation',
      message: 'You have been added to the project "College Management System"',
      relatedProject: collegeProject._id,
      read: false,
    });

    await Notification.create({
      recipient: sarah._id,
      type: 'comment_added',
      message: 'John Doe commented on task "Build project showcase section": "Let\'s go with a grid layout..."',
      relatedProject: portfolioProject._id,
      relatedTask: task3._id,
      read: false,
    });

    await Notification.create({
      recipient: mike._id,
      type: 'deadline_approaching',
      message: 'Task "Implement shopping cart" is due in 3 days',
      relatedProject: ecommerceProject._id,
      relatedTask: task8._id,
      read: false,
    });

    console.log('Notifications created.');

    // ────────────────────────────────────────────
    console.log('\n✅ Seed data inserted successfully!');
    console.log('\nTest accounts:');
    console.log('  john@example.com   / password123');
    console.log('  sarah@example.com  / password123');
    console.log('  mike@example.com   / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
