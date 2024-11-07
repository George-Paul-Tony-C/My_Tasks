'use client';
import { useEffect, useState } from 'react';
import { BsFillSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { FaPlay, FaPause, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { useDarkMode } from '../components/darkmode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

// Helper function to add elapsed time in hh:mm:ss format
const addElapsedTime = (timeSpent = "00:00:00", elapsed = 0) => {
  const total = timeSpent.split(':').reduce((acc, t) => 60 * acc + +t) + elapsed;
  return new Date(total * 1000).toISOString().substr(11, 8);
};

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, toggleDarkMode] = useDarkMode();

  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    const updatedTasks = data.tasks.map((task) => task.isRunning
      ? { ...task, totalTimeSpent: addElapsedTime(task.totalTimeSpent, Math.floor((Date.now() - new Date(task.startTime).getTime()) / 1000)) }
      : task
    );
    setTasks(updatedTasks);
    setLoading(false);
  };

  useEffect(() => { fetchTasks(); }, []);

  // Update running tasks' timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) => prevTasks.map((task) => {
        if (task.isRunning) {
          return {
            ...task,
            totalTimeSpent: addElapsedTime(task.totalTimeSpent, 1),
          };
        }
        return task;
      }));
    }, 1000);

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  const updateTask = async (taskId, action) => {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, action }),
    });
    fetchTasks();
  };

  const deleteTask = async (taskId) => {
    toast.info("Deleting task...", { autoClose: 1000 });
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    fetchTasks();
    toast.success("Task deleted successfully!");
  };

  const calculateProgress = (timeSpent, duration) => {
    const spent = timeSpent.split(':').reduce((acc, t) => 60 * acc + +t, 0);
    const total = duration.split(':').reduce((acc, t) => 60 * acc + +t, 0);
    return Math.min((spent / total) * 100, 100);
  };

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} min-h-screen transition duration-500`}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="container mx-auto p-8 min-h-screen">
        <motion.button
          whileHover={{ scale: 1.2 }}
          className="p-2 rounded-full focus:outline-none float-right"
          onClick={toggleDarkMode}
        >
          {darkMode ? <BsFillSunFill className="text-yellow-400" size={24} /> : <BsMoonStarsFill className="text-blue-500" size={24} />}
        </motion.button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {['Total Tasks', 'Completed Tasks', 'Ongoing Tasks'].map((title, idx) => (
            <motion.div
              key={idx}
              className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} p-6 rounded-lg shadow-lg flex items-center justify-between`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <h3 className="text-lg font-semibold">{title}</h3>
              <span className={`text-4xl font-bold ${['text-blue-400', 'text-green-400', 'text-yellow-400'][idx]}`}>
                {title === 'Total Tasks' ? tasks.length :
                 title === 'Completed Tasks' ? tasks.filter(task => task.isCompleted).length :
                 tasks.filter(task => !task.isCompleted && task.isRunning).length}
              </span>
            </motion.div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center">
            <motion.div
              className="loader rounded-full border-t-4 border-blue-500 h-16 w-16"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
            ></motion.div>
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500 text-center">No tasks found.</p>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tasks.map((task) => (
              <motion.div
                key={task._id}
                className={`relative p-6 rounded-3xl shadow-xl ${darkMode ? 'bg-gray-800' : 'bg-white text-gray-800'} ${task.isCompleted ? 'bg-green-100' : ''}`}
                whileHover={{ scale: 1.03 }}
              >
                <div className="absolute top-4 right-4 text-3xl">
                  {task.isCompleted ? <FaCheckCircle className="text-green-600" /> :
                   task.isRunning ? <FaPlay className="text-blue-600" /> :
                   <FaPause className="text-yellow-600" />}
                </div>

                <h2 className="text-2xl font-bold mb-2">{task.activityName}</h2>
                <p>Priority: <span className="font-semibold">{task.priority}</span></p>
                <p>Total Time: <span className="font-semibold text-blue-600">{task.totalTimeSpent}</span></p>
                <p>Duration: <span className="font-semibold text-green-600">{task.activityDuration}</span></p>

                <div className="relative h-4 mt-4 bg-gray-300 rounded-full">
                  <motion.div
                    className="absolute h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${calculateProgress(task.totalTimeSpent, task.activityDuration)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                <div className="flex gap-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md flex items-center gap-1"
                    onClick={() => deleteTask(task._id)}
                  >
                    <FaTrash /> Delete
                  </motion.button>
                  {!task.isCompleted && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className={`px-4 py-2 rounded-full shadow-md flex items-center gap-1 text-white ${
                        task.isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                      }`}
                      onClick={() => updateTask(task._id, task.isRunning ? 'pause' : 'start')}
                    >
                      {task.isRunning ? 'Pause' : task.totalTimeSpent !== '00:00:00' ? 'Resume' : 'Start'}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
