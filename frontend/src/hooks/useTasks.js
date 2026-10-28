import { useState, useCallback, useRef } from 'react';
import { tasksAPI } from '../services/api';
import toast from 'react-hot-toast';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastProjectId = useRef(null);

  const fetchTasks = useCallback(async (projectId) => {
    setLoading(true);
    setError(null);
    lastProjectId.current = projectId;
    try {
      const { data } = await tasksAPI.getByProject(projectId);
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    lastProjectId.current = null;
    try {
      const { data } = await tasksAPI.getMyTasks();
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks');
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = async (taskData) => {
    const { data } = await tasksAPI.create(taskData);
    toast.success('Task created');
    if (lastProjectId.current) {
      await fetchTasks(lastProjectId.current);
    } else {
      await fetchMyTasks();
    }
    return data;
  };

  const updateTask = async (id, taskData) => {
    const { data } = await tasksAPI.update(id, taskData);
    // Silently refetch (no toast for drag-and-drop status changes)
    if (lastProjectId.current) {
      await fetchTasks(lastProjectId.current);
    } else {
      await fetchMyTasks();
    }
    return data;
  };

  const deleteTask = async (id) => {
    await tasksAPI.delete(id);
    toast.success('Task deleted');
    if (lastProjectId.current) {
      await fetchTasks(lastProjectId.current);
    } else {
      await fetchMyTasks();
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    fetchMyTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}
