import { useState, useCallback } from 'react';
import { projectsAPI } from '../services/api';
import toast from 'react-hot-toast';

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await projectsAPI.getAll();
      setProjects(Array.isArray(data) ? data : data.projects || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = async (projectData) => {
    const { data } = await projectsAPI.create(projectData);
    toast.success('Project created');
    await fetchProjects();
    return data;
  };

  const updateProject = async (id, projectData) => {
    const { data } = await projectsAPI.update(id, projectData);
    toast.success('Project updated');
    await fetchProjects();
    return data;
  };

  const deleteProject = async (id) => {
    await projectsAPI.delete(id);
    toast.success('Project deleted');
    await fetchProjects();
  };

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}
