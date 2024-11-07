'use client';
import { useEffect, useState } from 'react';
import { BsFillSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { FaChevronLeft, FaChevronRight, FaCheckCircle, FaPlay, FaPause, FaTrash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDarkMode } from '../components/darkmode';
import TaskModal from '../components/TaskModal';

const addElapsedTime = (timeSpent = "00:00:00", elapsed = 0) => {
  const total = timeSpent.split(':').reduce((acc, t) => 60 * acc + +t, 0) + elapsed;
  return new Date(total * 1000).toISOString().substr(11, 8);
};

export default function CalendarPage() {
  const [darkMode, toggleDarkMode] = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [currentDay, setCurrentDay] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);

  // Fetch tasks initially
  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      const updatedTasks = data.tasks.map(task => 
        task.isRunning 
          ? { ...task, totalTimeSpent: addElapsedTime(task.totalTimeSpent, Math.floor((Date.now() - new Date(task.startTime).getTime()) / 1000)) } 
          : task
      );
      setTasks(updatedTasks);
      setLoading(false);
    };
    fetchTasks();
  }, []);

  // Real-time timer update for running tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.isRunning 
            ? { ...task, totalTimeSpent: addElapsedTime(task.totalTimeSpent, 1) } 
            : task
        )
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateTaskStatus = async (taskId, action) => {
    await fetch(`/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, action })
    });
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data.tasks);
  };

  const toggleTaskTimer = (task) => 
    task.isRunning ? updateTaskStatus(task._id, 'pause') : updateTaskStatus(task._id, 'start');

  const deleteTask = async (taskId) => {
    toast.info("Deleting task...", { autoClose: 1000 });
    await fetch(`/api/tasks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId })
    });
    setTasks(tasks.filter(task => task._id !== taskId));
    toast.success("Task deleted successfully!");
  };

  // Check if tasks are defined to avoid filter error
  const filteredTasksForDay = tasks ? tasks.filter(task => {
    const createdAt = new Date(task.createdAt);
    const dayDifference = Math.floor((currentDay - createdAt) / (7 * 24 * 60 * 60 * 1000));
    return task.daysOfWeek.includes(currentDay.toLocaleDateString('en-US', { weekday: 'long' })) && dayDifference < parseInt(task.weeks);
  }) : [];

  const animateButton = {
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.95 }
  };

  return loading ? (
    <motion.div className="flex justify-center items-center h-screen" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
      <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-16 h-16"></div>
    </motion.div>
  ) : (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} min-h-screen transition duration-500`}>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
      <div className="container mx-auto p-6 min-h-screen space-y-6">
        <motion.button {...animateButton} onClick={toggleDarkMode} className="absolute top-4 right-4 p-3 rounded-full text-2xl">
          {darkMode ? <BsFillSunFill className="text-yellow-400" /> : <BsMoonStarsFill className="text-blue-500" />}
        </motion.button>

        <motion.h1 className="text-4xl font-extrabold text-center mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          Daily Task Calendar
        </motion.h1>

        <div className="flex justify-between items-center mb-6">
          <motion.button {...animateButton} onClick={() => setCurrentDay(new Date(currentDay.setDate(currentDay.getDate() - 1)))}>
            <FaChevronLeft size={24} />
          </motion.button>
          <h2 className="text-xl font-semibold">
            {currentDay.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h2>
          <motion.button {...animateButton} onClick={() => setCurrentDay(new Date(currentDay.setDate(currentDay.getDate() + 1)))}>
            <FaChevronRight size={24} />
          </motion.button>
        </div>

        {filteredTasksForDay.length === 0 ? (
          <p className="text-center text-gray-500">No tasks for today. Create new tasks to get started!</p>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTasksForDay.map(task => (
              <motion.div
                key={task._id}
                className={`relative p-6 rounded-xl shadow-lg transform ${darkMode ? 'bg-gray-800' : 'bg-white'} ${
                  task.isCompleted ? 'bg-green-100 text-black' : ''
                }`}
                whileHover={{ scale: 1.03 }}
              >
                {task.isCompleted ? (
                  <FaCheckCircle className="absolute top-4 right-4 text-green-600 text-3xl" />
                ) : task.isRunning ? (
                  <FaPlay className="absolute top-4 right-4 text-blue-600 text-3xl" />
                ) : (
                  <FaPause className="absolute top-4 right-4 text-yellow-600 text-3xl" />
                )}

                <h2 className="text-2xl font-bold mb-2">{task.activityName}</h2>
                <p>Priority: <span className="font-semibold">{task.priority}</span></p>
                <p>Total Time: <span className="font-semibold text-blue-600">{task.totalTimeSpent}</span></p>
                <p>Duration: <span className="font-semibold text-green-600">{task.activityDuration}</span></p>

                <div className="relative h-4 mt-4 bg-gray-300 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(task.totalTimeSpent.split(':').reduce((a, b) => 60 * a + +b) / task.activityDuration.split(':').reduce((a, b) => 60 * a + +b)) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>

                <motion.button
                  {...animateButton}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md mt-4 flex items-center gap-2"
                  onClick={() => deleteTask(task._id)}
                >
                  <FaTrash /> Delete
                </motion.button>

                {!task.isCompleted && (
                  <motion.button
                    {...animateButton}
                    className={`mt-4 px-4 py-2 rounded-full shadow-md text-white ${task.isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                    onClick={() => toggleTaskTimer(task)}
                  >
                    {task.isRunning ? 'Pause' : task.totalTimeSpent !== '00:00:00' ? 'Resume' : 'Start'}
                  </motion.button>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {selectedTask && <TaskModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
      </div>
    </div>
  );
}
