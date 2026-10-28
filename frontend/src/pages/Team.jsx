import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { projectsAPI } from '../services/api';
import { getInitials } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await projectsAPI.getAll();
        const projects = Array.isArray(data) ? data : data.projects || [];

        // Collect unique members across all projects
        const memberMap = new Map();
        projects.forEach((p) => {
          (p.members || []).forEach((m) => {
            if (!memberMap.has(m._id)) {
              memberMap.set(m._id, { ...m, projectCount: 1 });
            } else {
              memberMap.get(m._id).projectCount += 1;
            }
          });
          // Include owner
          if (p.owner && !memberMap.has(p.owner._id)) {
            memberMap.set(p.owner._id, { ...p.owner, projectCount: 1 });
          } else if (p.owner && memberMap.has(p.owner._id)) {
            memberMap.get(p.owner._id).projectCount += 1;
          }
        });
        setMembers(Array.from(memberMap.values()));
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team</h1>
        <p className="mt-1 text-sm text-gray-600">
          People across your projects ({members.length})
        </p>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members yet"
          description="Team members from your projects will appear here."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <div
              key={m._id}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                {getInitials(m.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{m.name}</p>
                <p className="truncate text-xs text-gray-500">{m.email}</p>
                <p className="text-xs text-gray-400">
                  {m.projectCount} shared project{m.projectCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
