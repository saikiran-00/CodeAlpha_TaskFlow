import { useDraggable } from '@dnd-kit/core';
import { Calendar } from 'lucide-react';
import { formatDate, getPriorityClasses, getInitials } from '../../utils/helpers';

export default function TaskCard({ task, onClick, isDragging = false }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task._id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`cursor-grab rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow active:cursor-grabbing ${
        isDragging ? 'shadow-lg ring-2 ring-blue-200' : ''
      }`}
    >
      {/* Title */}
      <p className="text-sm font-medium text-gray-900">{task.title}</p>

      {/* Meta row */}
      <div className="mt-2 flex items-center justify-between">
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getPriorityClasses(
            task.priority
          )}`}
        >
          {task.priority}
        </span>

        <div className="flex items-center gap-2">
          {task.dueDate && (
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
          {task.assignedTo && (
            <div
              className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-medium text-blue-700"
              title={task.assignedTo?.name || ''}
            >
              {getInitials(task.assignedTo?.name)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
