import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  CheckCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, tasksAPI } from '../services/api';
import { formatDate, getStatusClasses, getPriorityClasses } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          projectsAPI.getAll(),
          tasksAPI.getMyTasks(),
        ]);
        setProjects(Array.isArray(projRes.data) ? projRes.data : projRes.data.projects || []);
        setTasks(Array.isArray(taskRes.data) ? taskRes.data : taskRes.data.tasks || []);
      } catch {
        // handled silently
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;

  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;

  const firstName = user?.name?.split(' ')[0] || 'there';

  // Chart data
  const chartData = [
    { name: 'To Do', count: tasks.filter((t) => t.status === 'To Do').length, fill: '#9ca3af' },
    { name: 'In Progress', count: tasks.filter((t) => t.status === 'In Progress').length, fill: '#3b82f6' },
    { name: 'Completed', count: tasks.filter((t) => t.status === 'Completed').length, fill: '#22c55e' },
  ];

  // Upcoming deadlines — tasks with due dates in the future, sorted
  const upcoming = tasks
    .filter((t) => t.dueDate && new Date(t.dueDate) >= new Date() && t.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 5);

  const statCards = [
    { label: 'Total Projects', value: totalProjects, icon: FolderKanban, bg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { label: 'Total Tasks', value: totalTasks, icon: CheckSquare, bg: 'bg-purple-50', iconColor: 'text-purple-600' },
    { label: 'Completed', value: completedTasks, icon: CheckCircle, bg: 'bg-green-50', iconColor: 'text-green-600' },
    { label: 'Pending', value: pendingTasks, icon: Clock, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName}</h1>
        <p className="mt-1 text-sm text-gray-600">Here&apos;s what&apos;s happening with your projects.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2.5 ${card.bg}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Upcoming Deadlines row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Progress Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Task Progress</h2>
          {totalTasks === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No tasks yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Upcoming Deadlines</h2>
          {upcoming.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No upcoming deadlines</p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between rounded-md border border-gray-100 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-500">{task.project?.name || 'Project'}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-3 shrink-0">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityClasses(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Projects */}
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent Projects</h2>
          <Link
            to="/projects"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {projects.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">No projects yet. Create your first one!</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((project) => (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="rounded-lg border border-gray-100 p-4 transition-colors hover:border-gray-200 hover:bg-gray-50"
              >
                <h3 className="text-sm font-semibold text-gray-900">{project.name}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusClasses(project.status)}`}>
                    {project.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {project.dueDate && (
                  <p className="mt-1.5 text-xs text-gray-500">Due {formatDate(project.dueDate)}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
