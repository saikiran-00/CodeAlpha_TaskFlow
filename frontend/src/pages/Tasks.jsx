import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Search, Filter } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { formatDate, getStatusClasses, getPriorityClasses } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function Tasks() {
  const { tasks, loading, fetchMyTasks } = useTasks();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  useEffect(() => {
    fetchMyTasks();
  }, [fetchMyTasks]);

  if (loading) return <LoadingSpinner />;

  // Apply filters
  let filtered = tasks;
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.project?.name || '').toLowerCase().includes(q)
    );
  }
  if (statusFilter !== 'All') {
    filtered = filtered.filter((t) => t.status === statusFilter);
  }
  if (priorityFilter !== 'All') {
    filtered = filtered.filter((t) => t.priority === priorityFilter);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
        <p className="mt-1 text-sm text-gray-600">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} assigned to you
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Status</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={tasks.length === 0 ? 'No tasks assigned' : 'No matching tasks'}
          description={
            tasks.length === 0
              ? 'Tasks assigned to you will appear here.'
              : 'Try adjusting your search or filters.'
          }
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <Link
              key={task._id}
              to={`/projects/${task.project?._id || task.project}`}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all hover:border-gray-300 hover:shadow"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{task.title}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {task.project?.name || 'Project'}
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2 shrink-0">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityClasses(task.priority)}`}>
                  {task.priority}
                </span>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusClasses(task.status)}`}>
                  {task.status}
                </span>
                {task.dueDate && (
                  <span className="hidden text-xs text-gray-500 sm:block">
                    {formatDate(task.dueDate)}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
