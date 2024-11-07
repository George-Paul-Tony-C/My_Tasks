'use client';
import { useEffect, useState } from 'react';
import { BsFillSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import { FaTasks, FaClock, FaCheckCircle, FaPlayCircle, FaCalendarAlt } from 'react-icons/fa';
import { useDarkMode } from './components/DarkModeProvider';
import { motion } from 'framer-motion';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const { darkMode } = useDarkMode(); 
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getDayIndex = (task, currentDay) => {
    const createdAt = new Date(task.createdAt);
    const dayDifference = Math.floor((currentDay - createdAt) / (24 * 60 * 60 * 1000));
    const weekIndex = Math.floor(dayDifference / 7);
    const weekdayIndex = task.daysOfWeek.indexOf(currentDay.toLocaleDateString('en-US', { weekday: 'long' }));
    return weekdayIndex === -1 || weekIndex >= task.weeks ? -1 : weekIndex * task.daysOfWeek.length + weekdayIndex;
  };

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks);
      setLoading(false);
    };
    fetchTasks();
  }, []);

  const currentDay = new Date();

  const tasksForToday = tasks.filter((task) => getDayIndex(task, currentDay) !== -1);

  const totalTimeAllocated = tasksForToday.reduce((total, task) => {
    const dayIndex = getDayIndex(task, currentDay);
    if (dayIndex !== -1) {
      const durationInSeconds = task.activityDuration.split(':').reduce((acc, time) => 60 * acc + +time, 0);
      return total + durationInSeconds;
    }
    return total;
  }, 0);

  const totalTimeCompleted = tasksForToday.reduce((total, task) => {
    const dayIndex = getDayIndex(task, currentDay);
    if (dayIndex !== -1) {
      const timeSpentInSeconds = task.totalTimeSpent[dayIndex].split(':').reduce((acc, time) => 60 * acc + +time, 0);
      return total + timeSpentInSeconds;
    }
    return total;
  }, 0);

  const completionRate = totalTimeAllocated > 0 ? Math.floor((totalTimeCompleted / totalTimeAllocated) * 100) : 0;

  const completedTasksCount = tasksForToday.filter((task) => task.isCompleted[getDayIndex(task, currentDay)]).length;
  const totalTasksCount = tasksForToday.length;
  const ongoingTasksCount = tasksForToday.filter((task) => task.isRunning[getDayIndex(task, currentDay)]).length;

  

  return loading ? (
    <motion.div
      className="flex justify-center items-center h-screen"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1 }}
    >
      <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-16 h-16"></div>
    </motion.div>
  ) : (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'} min-h-screen p-4`}>
      <div className="container mx-auto max-w-screen-xl flex flex-col items-center">
        
        <div className="relative flex flex-col items-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Today's Completion Rate</h2>
          <div className="relative w-56 h-56">
            <svg className="absolute inset-0 transform transition ease-out duration-1000" viewBox="0 0 160 160">
              <circle
                className={`${darkMode ? 'text-gray-700' : 'text-gray-300'}`}
                strokeWidth="15"
                stroke="currentColor"
                fill="transparent"
                r="70"
                cx="80"
                cy="80"
              />
              <circle
                className={`${darkMode ? 'text-green-400' : 'text-green-500'}`}
                strokeWidth="15"
                strokeDasharray={`${(completionRate / 100) * 440} 440`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="70"
                cx="80"
                cy="80"
                transform="rotate(-90 80 80)"
                style={{ transition: 'stroke-dasharray 1s ease-in-out' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-5xl font-extrabold ${darkMode ? 'text-green-400' : 'text-green-500'}`}>{completionRate}%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4">
          <motion.div
            className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-transform transform hover:-translate-y-1`}
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <FaTasks className="inline mr-2 text-indigo-500" /> Total Tasks Today
            </h2>
            <p className="text-4xl font-bold">{totalTasksCount}</p>
          </motion.div>
          {tasks.length > 0 && (
            <motion.div
              className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-transform transform hover:-translate-y-1`}
              whileHover={{ scale: 1.05 }}
            >
              <h2 className="text-lg font-semibold mb-2 flex items-center">
                <FaClock className="inline mr-2 text-blue-500" /> Latest Task
              </h2>
              <p className="text-lg font-light">{tasks[tasks.length - 1].activityName}</p>
              <p className="text-xs text-gray-500 mt-2">{new Date(tasks[tasks.length - 1].createdAt).toLocaleString()}</p>
            </motion.div>
          )}
          <motion.div
            className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-transform transform hover:-translate-y-1`}
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <FaCheckCircle className="inline mr-2 text-green-500" /> Completed Tasks Today
            </h2>
            <p className="text-4xl font-bold">{completedTasksCount}</p>
          </motion.div>
          <motion.div
            className={`${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'} p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-transform transform hover:-translate-y-1`}
            whileHover={{ scale: 1.05 }}
          >
            <h2 className="text-lg font-semibold mb-2 flex items-center">
              <FaPlayCircle className="inline mr-2 text-yellow-500" /> Ongoing Tasks Today
            </h2>
            <p className="text-4xl font-bold">{ongoingTasksCount}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
