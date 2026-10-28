import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  X,
  MessageSquare,
  Send,
} from 'lucide-react';
import { projectsAPI, tasksAPI, commentsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  formatDate,
  getStatusClasses,
  getPriorityClasses,
  getInitials,
  timeAgo,
} from '../utils/helpers';
import KanbanBoard from '../components/kanban/KanbanBoard';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showDeleteProject, setShowDeleteProject] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showTaskDetail, setShowTaskDetail] = useState(null); // task object
  const [showEditTask, setShowEditTask] = useState(null);
  const [showDeleteTask, setShowDeleteTask] = useState(null);

  // Forms
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
    status: 'To Do',
  });
  const [editProjectForm, setEditProjectForm] = useState({});
  const [memberEmail, setMemberEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const { data } = await projectsAPI.getById(id);
      setProject(data.project || data);
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    }
  }, [id, navigate]);

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await tasksAPI.getByProject(id);
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch {
      // silently fail
    }
  }, [id]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchProject(), fetchTasks()]);
      setLoading(false);
    };
    load();
  }, [fetchProject, fetchTasks]);

  const isOwner = project?.owner?._id === user?._id || project?.owner === user?._id;

  // ─── Task CRUD ──────────────────────────────────────────
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    setSubmitting(true);
    try {
      await tasksAPI.create({ ...taskForm, project: id });
      toast.success('Task created');
      setShowAddTask(false);
      setTaskForm({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '', status: 'To Do' });
      await fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!showEditTask) return;
    setSubmitting(true);
    try {
      await tasksAPI.update(showEditTask._id, taskForm);
      toast.success('Task updated');
      setShowEditTask(null);
      await fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!showDeleteTask) return;
    try {
      await tasksAPI.delete(showDeleteTask._id);
      toast.success('Task deleted');
      setShowDeleteTask(null);
      setShowTaskDetail(null);
      await fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await tasksAPI.update(taskId, { status: newStatus });
      await fetchTasks();
    } catch {
      toast.error('Failed to update task status');
    }
  };

  const openEditTask = (task) => {
    setTaskForm({
      title: task.title || '',
      description: task.description || '',
      assignedTo: task.assignedTo?._id || task.assignedTo || '',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      status: task.status || 'To Do',
    });
    setShowEditTask(task);
  };

  // ─── Project Edit/Delete ────────────────────────────────
  const openEditProject = () => {
    setEditProjectForm({
      name: project.name || '',
      description: project.description || '',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      dueDate: project.dueDate ? project.dueDate.split('T')[0] : '',
      status: project.status || 'Active',
    });
    setShowEditProject(true);
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await projectsAPI.update(id, editProjectForm);
      toast.success('Project updated');
      setShowEditProject(false);
      await fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await projectsAPI.delete(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  // ─── Members ────────────────────────────────────────────
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;
    setSubmitting(true);
    try {
      await projectsAPI.addMember(id, memberEmail.trim());
      toast.success('Member added');
      setMemberEmail('');
      setShowAddMember(false);
      await fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await projectsAPI.removeMember(id, userId);
      toast.success('Member removed');
      await fetchProject();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  // ─── Comments ───────────────────────────────────────────
  const fetchComments = async (taskId) => {
    try {
      const { data } = await commentsAPI.getByTask(taskId);
      setComments(Array.isArray(data) ? data : data.comments || []);
    } catch {
      setComments([]);
    }
  };

  const openTaskDetail = async (task) => {
    setShowTaskDetail(task);
    await fetchComments(task._id);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !showTaskDetail) return;
    try {
      await commentsAPI.create(showTaskDetail._id, commentText.trim());
      setCommentText('');
      await fetchComments(showTaskDetail._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentsAPI.delete(commentId);
      if (showTaskDetail) await fetchComments(showTaskDetail._id);
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!project) return null;

  const members = project.members || [];

  // ─── Task form fields (shared by create & edit) ─────────
  const TaskFormFields = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title *</label>
        <input
          value={taskForm.title}
          onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="e.g. Design homepage"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          rows={2}
          value={taskForm.description}
          onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Assign To</label>
          <select
            value={taskForm.assignedTo}
            onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority</label>
          <select
            value={taskForm.priority}
            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Due Date</label>
          <input
            type="date"
            value={taskForm.dueDate}
            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={taskForm.status}
            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => { setShowAddTask(false); setShowEditTask(null); }}
          className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="mb-3 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClasses(project.status)}`}>
                {project.status}
              </span>
            </div>
            {project.description && (
              <p className="mt-1 text-sm text-gray-600">{project.description}</p>
            )}
            <div className="mt-1 flex gap-4 text-xs text-gray-500">
              {project.startDate && <span>Started {formatDate(project.startDate)}</span>}
              {project.dueDate && <span>Due {formatDate(project.dueDate)}</span>}
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={openEditProject}
                className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={() => setShowDeleteProject(true)}
                className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Members */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            Members ({members.length})
          </h2>
          {isOwner && (
            <button
              onClick={() => setShowAddMember(true)}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <UserPlus className="h-4 w-4" /> Add Member
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => (
            <div
              key={m._id}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 py-1 pl-1 pr-3"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                {getInitials(m.name)}
              </div>
              <span className="text-sm text-gray-700">{m.name}</span>
              {m._id === (project.owner?._id || project.owner) && (
                <span className="text-xs text-gray-400">Owner</span>
              )}
              {isOwner && m._id !== (project.owner?._id || project.owner) && (
                <button
                  onClick={() => handleRemoveMember(m._id)}
                  className="ml-1 text-gray-400 hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Task Board */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Task Board</h2>
          <button
            onClick={() => {
              setTaskForm({ title: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '', status: 'To Do' });
              setShowAddTask(true);
            }}
            className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Task
          </button>
        </div>

        <KanbanBoard
          tasks={tasks}
          onStatusChange={handleStatusChange}
          onTaskClick={openTaskDetail}
        />
      </div>

      {/* ─── Modals ───────────────────────────────────────── */}

      {/* Create Task */}
      <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="New Task">
        <TaskFormFields onSubmit={handleCreateTask} submitLabel="Create Task" />
      </Modal>

      {/* Edit Task */}
      <Modal isOpen={!!showEditTask} onClose={() => setShowEditTask(null)} title="Edit Task">
        <TaskFormFields onSubmit={handleUpdateTask} submitLabel="Save Changes" />
      </Modal>

      {/* Delete Task */}
      <ConfirmDialog
        isOpen={!!showDeleteTask}
        onClose={() => setShowDeleteTask(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Are you sure you want to delete "${showDeleteTask?.title}"? This action cannot be undone.`}
      />

      {/* Task Detail + Comments */}
      <Modal
        isOpen={!!showTaskDetail}
        onClose={() => { setShowTaskDetail(null); setComments([]); }}
        title={showTaskDetail?.title || 'Task Detail'}
        size="lg"
      >
        {showTaskDetail && (
          <div className="space-y-4">
            {/* Task info */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusClasses(showTaskDetail.status)}`}>
                {showTaskDetail.status}
              </span>
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityClasses(showTaskDetail.priority)}`}>
                {showTaskDetail.priority}
              </span>
              {showTaskDetail.dueDate && (
                <span className="text-xs text-gray-500">Due {formatDate(showTaskDetail.dueDate)}</span>
              )}
            </div>

            {showTaskDetail.description && (
              <p className="text-sm text-gray-600">{showTaskDetail.description}</p>
            )}

            {showTaskDetail.assignedTo && (
              <p className="text-sm text-gray-600">
                Assigned to: <span className="font-medium">{showTaskDetail.assignedTo?.name || 'Unknown'}</span>
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => openEditTask(showTaskDetail)}
                className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button
                onClick={() => setShowDeleteTask(showTaskDetail)}
                className="inline-flex items-center gap-1 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </div>

            {/* Comments section */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                <MessageSquare className="h-4 w-4" /> Comments ({comments.length})
              </h3>

              {/* Comment list */}
              <div className="mb-3 max-h-48 space-y-2 overflow-y-auto">
                {comments.length === 0 ? (
                  <p className="py-4 text-center text-sm text-gray-400">No comments yet</p>
                ) : (
                  comments.map((c) => (
                    <div key={c._id} className="rounded-md bg-gray-50 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-[10px] font-medium text-blue-700">
                            {getInitials(c.author?.name)}
                          </div>
                          <span className="text-xs font-medium text-gray-700">{c.author?.name}</span>
                          <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                        </div>
                        {c.author?._id === user?._id && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{c.text}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="rounded-md bg-blue-600 p-2 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Project */}
      <Modal isOpen={showEditProject} onClose={() => setShowEditProject(false)} title="Edit Project">
        <form onSubmit={handleEditProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <input
              value={editProjectForm.name || ''}
              onChange={(e) => setEditProjectForm({ ...editProjectForm, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={editProjectForm.description || ''}
              onChange={(e) => setEditProjectForm({ ...editProjectForm, description: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={editProjectForm.startDate || ''}
                onChange={(e) => setEditProjectForm({ ...editProjectForm, startDate: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={editProjectForm.dueDate || ''}
                onChange={(e) => setEditProjectForm({ ...editProjectForm, dueDate: e.target.value })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={editProjectForm.status || 'Active'}
              onChange={(e) => setEditProjectForm({ ...editProjectForm, status: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowEditProject(false)}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Project */}
      <ConfirmDialog
        isOpen={showDeleteProject}
        onClose={() => setShowDeleteProject(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? All tasks and comments in this project will also be deleted.`}
      />

      {/* Add Member */}
      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member" size="sm">
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="team@example.com"
            />
            <p className="mt-1 text-xs text-gray-500">The user must already have a TaskFlow account.</p>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddMember(false)}
              className="rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
