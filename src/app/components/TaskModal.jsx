import { useState } from 'react';

export default function TaskModal({ task, onClose, onUpdateTask }) {
  const [priority, setPriority] = useState(task.priority);

  const handlePriorityChange = async (newPriority) => {
    setPriority(newPriority);

    // API call to update priority in the backend
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task._id,
          action: 'updatePriority',
          priority: newPriority,
        }),
      });
      if (res.ok) {
        onUpdateTask({ ...task, priority: newPriority }); // Update task in frontend
      } else {
        console.error('Failed to update priority');
      }
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  };

  const handleMarkAsCompleted = async () => {
    // API call to mark task as completed in the backend
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: task._id,
          action: 'complete',
        }),
      });
      if (res.ok) {
        onUpdateTask({ ...task, isCompleted: true, isRunning: false }); // Update task in frontend
      } else {
        console.error('Failed to mark task as completed');
      }
    } catch (error) {
      console.error('Error marking task as completed:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black text-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">{task.activityName}</h2>
        <p><strong>Duration:</strong> {task.activityDuration}</p>
        <p><strong>Created At:</strong> {new Date(task.createdAt).toLocaleDateString()}</p>

        <div className="mt-4">
          <p><strong>Priority:</strong></p>
          <div className="flex space-x-2">
            {['high', 'medium', 'low'].map((level) => (
              <button
                key={level}
                onClick={() => handlePriorityChange(level)}
                className={`px-3 py-1 rounded ${priority === level ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            Close
          </button>
          <button
            onClick={handleMarkAsCompleted}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Mark as Completed
          </button>
        </div>
      </div>
    </div>
  );
}
