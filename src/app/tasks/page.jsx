'use client';
import { useEffect, useState } from 'react';
import { BsFillSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { FaPlay, FaPause, FaCheckCircle } from 'react-icons/fa';

// Helper function to add elapsed time to the total time in hh:mm:ss format
function addElapsedTime(totalTimeSpent, elapsedTimeInSeconds) {
  const total = totalTimeSpent.split(':').reduce((acc, time) => (60 * acc) + +time); // Convert hh:mm:ss to total seconds
  const updatedTotal = total + elapsedTimeInSeconds; // Add the new elapsed time
  const h = Math.floor(updatedTotal / 3600);
  const m = Math.floor((updatedTotal % 3600) / 60);
  const s = updatedTotal % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [darkMode, setDarkMode] = useState(false); // For dark/light mode toggle
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Fetch tasks from the API
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks');
      const data = await res.json();

      const updatedTasks = data.tasks.map((task) => {
        if (task.isRunning) {
          const now = new Date().getTime();
          const startTime = new Date(task.startTime).getTime();
          const elapsedTime = Math.floor((now - startTime) / 1000); // Elapsed time in seconds
          const newTotalTime = addElapsedTime(task.totalTimeSpent, elapsedTime); // Add elapsed time to the total
          return { ...task, totalTimeSpent: newTotalTime };
        }
        return task;
      });

      setTasks(updatedTasks);
      setLoading(false); // Disable loading once data is fetched
    };
    fetchTasks();
  }, []);

  // Start the task timer
  const startTask = async (taskId) => {
    localStorage.setItem(`task_${taskId}_running`, true); // Store running state in local storage
    await fetch(`/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId, action: 'start' }),
    });

    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data.tasks);
  };

  // Pause the task timer and update time spent
  const pauseTask = async (taskId) => {
    localStorage.removeItem(`task_${taskId}_running`); // Remove running state from local storage
    await fetch(`/api/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskId, action: 'pause' }),
    });

    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data.tasks);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          if (localStorage.getItem(`task_${task._id}_running`)) {
            const newTotalTime = addElapsedTime(task.totalTimeSpent, 1); // Add 1 second every tick
            return { ...task, totalTimeSpent: newTotalTime };
          }
          return task;
        })
      );
    }, 1000); // Update every second

    return () => clearInterval(interval); // Clear interval when component unmounts
  }, [tasks]);
  // Helper function to calculate percentage of time spent
  const calculateProgress = (totalTimeSpent, activityDuration) => {
    const totalSpentInSeconds = totalTimeSpent.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
    const totalDurationInSeconds = activityDuration.split(':').reduce((acc, time) => (60 * acc) + +time, 0);
    return Math.min((totalSpentInSeconds / totalDurationInSeconds) * 100, 100);
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} min-h-screen transition duration-500`}>
      <div className="container mx-auto p-8 min-h-screen">
        {/* Dark Mode Toggle */}
        <div className="flex justify-end mb-6">
          <button
            className="p-2 rounded-full focus:outline-none transition hover:scale-110 transform"
            onClick={() => setDarkMode(!darkMode)}
          >
            {darkMode ? <BsFillSunFill className="text-yellow-400" size={24} /> : <BsMoonStarsFill className="text-blue-500" size={24} />}
          </button>
        </div>

        {/* Dashboard-like Task Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} p-6 rounded-lg shadow-lg flex items-center justify-between`}>
            <h3 className="text-lg font-semibold">Total Tasks</h3>
            <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} text-4xl font-bold`}>{tasks.length}</span>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} p-6 rounded-lg shadow-lg flex items-center justify-between`}>
            <h3 className="text-lg font-semibold">Completed Tasks</h3>
            <span className={`${darkMode ? 'text-green-400' : 'text-green-600'} text-4xl font-bold`}>{tasks.filter(task => task.isCompleted).length}</span>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} p-6 rounded-lg shadow-lg flex items-center justify-between`}>
            <h3 className="text-lg font-semibold">Ongoing Tasks</h3>
            <span className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'} text-4xl font-bold`}>{tasks.filter(task => !task.isCompleted && localStorage.getItem(`task_${task._id}_running`)).length}</span>
          </div>
        </div>

        {/* Task Cards */}
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 text-center">No tasks found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`relative p-8 rounded-3xl shadow-xl transform transition hover:scale-105 
                ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800 shadow-lg border border-gray-200'} 
                ${task.isCompleted ? 'bg-green-100' : ''}`}
              >
                {/* Task Status Badge */}
                {task.isCompleted ? (
                  <FaCheckCircle className="absolute top-4 right-4 text-green-600 text-3xl" />
                ) : localStorage.getItem(`task_${task._id}_running`) ? (
                  <FaPlay className="absolute top-4 right-4 text-blue-600 text-3xl" />
                ) : (
                  <FaPause className="absolute top-4 right-4 text-yellow-600 text-3xl" />
                )}

                {/* Task Info */}
                <h2 className="text-2xl font-bold mb-4">{task.activityName}</h2>
                <p className="text-lg">
                  Total Time Spent: <span className="font-semibold text-blue-600">{task.totalTimeSpent}</span>
                </p>
                <p className="text-lg">
                  Duration: <span className="font-semibold text-green-600">{task.activityDuration}</span>
                </p>

                {/* Progress Bar */}
                <div className="relative h-4 mt-4 bg-gray-300 rounded-full">
                  <div
                    className="absolute h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    style={{ width: `${calculateProgress(task.totalTimeSpent, task.activityDuration)}%`, transition: 'width 0.5s ease' }}
                  ></div>
                </div>

                {/* Task Completion Status */}
                {task.isCompleted ? (
                  <p className="text-lg font-bold text-green-600 mt-4">Task Completed</p>
                ) : (
                  <div className="mt-6">
                    {localStorage.getItem(`task_${task._id}_running`) ? (
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-md transition transform hover:-translate-y-1"
                        onClick={() => pauseTask(task._id)}
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-md transition transform hover:-translate-y-1"
                        onClick={() => startTask(task._id)}
                      >
                        {task.totalTimeSpent !== '00:00:00' ? 'Resume' : 'Start'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
