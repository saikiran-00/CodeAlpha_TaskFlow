import { useDroppable } from '@dnd-kit/core';

const columnColors = {
  'To Do': 'border-gray-300',
  'In Progress': 'border-blue-400',
  'Completed': 'border-green-400',
};

export default function KanbanColumn({ id, title, count, children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="w-72 shrink-0 lg:w-auto lg:flex-1">
      {/* Column header */}
      <div className={`mb-3 flex items-center justify-between rounded-t-lg border-t-2 ${columnColors[id] || 'border-gray-300'} px-1 pt-2`}>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
          {count}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`min-h-[200px] space-y-2 rounded-lg p-2 transition-colors ${
          isOver ? 'bg-blue-50 ring-2 ring-blue-200' : 'bg-gray-50'
        }`}
      >
        {children}
        {count === 0 && !isOver && (
          <p className="py-8 text-center text-xs text-gray-400">
            Drag tasks here
          </p>
        )}
      </div>
    </div>
  );
}
