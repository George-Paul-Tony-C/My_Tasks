'use client';
import { useEffect, useState } from 'react';
import { BsFillSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { FaPlay, FaPause, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { useDarkMode } from '../components/darkmode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

// Helper function to add elapsed time to the total time in hh:mm:ss format
function addElapsedTime(totalTimeSpent, elapsedTimeInSeconds) {
  const total = totalTimeSpent.split(':').reduce((acc, time) => 60 * acc + +time);
  const updatedTotal = total + elapsedTimeInSeconds;
  const h = Math.floor(updatedTotal / 3600);
  const m = Math.floor((updatedTotal % 3600) / 60);
  const s = updatedTotal % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [darkMode, toggleDarkMode] = useDarkMode();
  const [loading, setLoading] = useState(true);

  const deleteTask = async (taskId) => {
    toast.info("Deleting task...", { autoClose: 1000 });
    await fetch(`/api/tasks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    toast.success("Task deleted successfully!");
  };

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      const updatedTasks = data.tasks.map((task) => {
        if (task.isRunning) {
          const now = new Date().getTime();
          const startTime = new Date(task.startTime).getTime();
          const elapsedTime = Math.floor((now - startTime) / 1000);
          const newTotalTime = addElapsedTime(task.totalTimeSpent, elapsedTime);
          return { ...task, totalTimeSpent: newTotalTime };
        }
        return task;
      });
      setTasks(updatedTasks);
      setLoading(false);
    };
    fetchTasks();
  }, []);

  const startTask = async (taskId) => {
    localStorage.setItem(`task_${taskId}_running`, true);
    await fetch(`/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, action: 'start' }),
    });
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data.tasks);
  };

  const pauseTask = async (taskId) => {
    localStorage.removeItem(`task_${taskId}_running`);
    await fetch(`/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
            const newTotalTime = addElapsedTime(task.totalTimeSpent, 1);
            return { ...task, totalTimeSpent: newTotalTime };
          }
          return task;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  const calculateProgress = (totalTimeSpent, activityDuration) => {
    const totalSpentInSeconds = totalTimeSpent.split(':').reduce((acc, time) => 60 * acc + +time, 0);
    const totalDurationInSeconds = activityDuration.split(':').reduce((acc, time) => 60 * acc + +time, 0);
    return Math.min((totalSpentInSeconds / totalDurationInSeconds) * 100, 100);
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} min-h-screen transition duration-500`}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="container mx-auto p-8 min-h-screen">
        <div className="flex justify-end mb-6">
          <motion.button
            whileHover={{ scale: 1.2 }}
            className="p-2 rounded-full focus:outline-none"
            onClick={toggleDarkMode}
          >
            {darkMode ? <BsFillSunFill className="text-yellow-400" size={24} /> : <BsMoonStarsFill className="text-blue-500" size={24} />}
          </motion.button>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
        >
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} p-6 rounded-lg shadow-lg flex items-center justify-between`}>
            <h3 className="text-lg font-semibold">Total Tasks</h3>
            <span className={`${darkMode ? 'text-blue-400' : 'text-blue-600'} text-4xl font-bold`}>{tasks.length}</span>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} p-6 rounded-lg shadow-lg flex items-center justify-between`}>
            <h3 className="text-lg font-semibold">Completed Tasks</h3>
            <span className={`${darkMode ? 'text-green-400' : 'text-green-600'} text-4xl font-bold`}>
              {tasks.filter((task) => task.isCompleted).length}
            </span>
          </div>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} p-6 rounded-lg shadow-lg flex items-center justify-between`}>
            <h3 className="text-lg font-semibold">Ongoing Tasks</h3>
            <span className={`${darkMode ? 'text-yellow-400' : 'text-yellow-600'} text-4xl font-bold`}>
              {tasks.filter((task) => !task.isCompleted && localStorage.getItem(`task_${task._id}_running`)).length}
            </span>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center">
            <motion.div
              className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity }}
            ></motion.div>
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 text-center">No tasks found.</p>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tasks.map((task) => (
              <motion.div
                key={task._id}
                whileHover={{ scale: 1.03 }}
                className={`relative p-8 rounded-3xl shadow-xl transform ${
                  darkMode ? 'bg-gray-800' : 'bg-white text-gray-800 shadow-lg border border-gray-200'
                } ${task.isCompleted ? 'bg-green-100 text-black' : ''}`}
              >
                {task.isCompleted ? (
                  <FaCheckCircle className="absolute top-4 right-4 text-green-600 text-3xl" />
                ) : localStorage.getItem(`task_${task._id}_running`) ? (
                  <FaPlay className="absolute top-4 right-4 text-blue-600 text-3xl" />
                ) : (
                  <FaPause className="absolute top-4 right-4 text-yellow-600 text-3xl" />
                )}

                <h2 className="text-2xl font-bold mb-4">{task.activityName}</h2>
                <p className="text-lg">
                  Priority: <span className="font-semibold">{task.priority}</span>
                </p>
                <p className="text-lg">
                  Total Time Spent: <span className="font-semibold text-blue-600">{task.totalTimeSpent}</span>
                </p>
                <p className="text-lg">
                  Duration: <span className="font-semibold text-green-600">{task.activityDuration}</span>
                </p>

                <div className="relative h-4 mt-4 bg-gray-300 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProgress(task.totalTimeSpent, task.activityDuration)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md mt-4 flex items-center gap-2"
                  onClick={() => deleteTask(task._id)}
                >
                  <FaTrash /> Delete
                </motion.button>

                {task.isCompleted ? (
                  <p className="text-lg font-bold text-green-600 mt-4">Task Completed</p>
                ) : (
                  <motion.div className="mt-6">
                    {localStorage.getItem(`task_${task._id}_running`) ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-md"
                        onClick={() => pauseTask(task._id)}
                      >
                        Pause
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full shadow-md"
                        onClick={() => startTask(task._id)}
                      >
                        {task.totalTimeSpent !== '00:00:00' ? 'Resume' : 'Start'}
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
