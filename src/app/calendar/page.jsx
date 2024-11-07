'use client';
import { useEffect, useState } from 'react';
import { BsFillSunFill, BsMoonStarsFill } from 'react-icons/bs';
import {FaChevronLeft,FaChevronRight,FaCheckCircle,FaPlay,FaPause,FaTrash,} from 'react-icons/fa';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDarkMode } from '../components/DarkModeProvider';
import LoadingSpinner from '../components/LoadingSpinner';

const addElapsedTime = (timeSpent = '00:00:00', elapsed = 0) => {
  const total =
    timeSpent.split(':').reduce((acc, t) => 60 * acc + +t, 0) + elapsed;
  return new Date(total * 1000).toISOString().substr(11, 8);
};

const getDayIndex = (task, currentDay) => {
  const createdAt = new Date(task.createdAt);
  // Ensure the task is only shown from the creation date onward
  if (currentDay < createdAt) return -1;

  const dayDifference = Math.floor(
    (currentDay - createdAt) / (24 * 60 * 60 * 1000)
  );
  const weekIndex = Math.floor(dayDifference / 7);
  const weekdayIndex = task.daysOfWeek.indexOf(
    currentDay.toLocaleDateString('en-US', { weekday: 'long' })
  );
  return weekdayIndex === -1 || weekIndex >= task.weeks
    ? -1
    : weekIndex * task.daysOfWeek.length + weekdayIndex;
};

export default function CalendarPage() {
  const { darkMode } = useDarkMode(); 
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [currentDay, setCurrentDay] = useState(new Date());

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      const updatedTasks = data.tasks.map((task) => {
        const dayIndex = getDayIndex(task, currentDay);
        return task.isRunning[dayIndex] && dayIndex !== -1
          ? {
              ...task,
              totalTimeSpent: task.totalTimeSpent.map((time, index) =>
                index === dayIndex
                  ? addElapsedTime(
                      time,
                      Math.floor(
                        (Date.now() - new Date(task.startTime).getTime()) / 1000
                      )
                    )
                  : time
              ),
            }
          : task;
      });
      setTasks(updatedTasks);
      setLoading(false);
    };
    fetchTasks();
  }, [currentDay]);

  // Add this useEffect to update the timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          const dayIndex = getDayIndex(task, currentDay);
          if (dayIndex !== -1 && task.isRunning[dayIndex]) {
            return {
              ...task,
              totalTimeSpent: task.totalTimeSpent.map((time, index) =>
                index === dayIndex
                  ? addElapsedTime(time, 1)
                  : time
              ),
            };
          } else {
            return task;
          }
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [currentDay]);

  const updateTaskStatus = async (taskId, action, dayIndex) => {
    await fetch(`/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, action, dayIndex }),
    });
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data.tasks);
  };

  const toggleTaskTimer = (task) => {
    const dayIndex = getDayIndex(task, currentDay);
    if (dayIndex !== -1) {
      task.isRunning[dayIndex]
        ? updateTaskStatus(task._id, 'pause', dayIndex)
        : updateTaskStatus(task._id, 'start', dayIndex);
    }
  };

  const deleteTask = async (taskId) => {
    await fetch(`/api/tasks`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId }),
    });
    setTasks(tasks.filter((task) => task._id !== taskId));
    toast.success('Task deleted successfully!');
  };

  const filteredTasksForDay = tasks
    ? tasks.filter((task) => getDayIndex(task, currentDay) !== -1): [];

  

  return loading ? (
    <LoadingSpinner/>
  ) : (
    <div
      className={`${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
      } min-h-screen transition duration-500`}
    >
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="container mx-auto p-6 min-h-screen space-y-6">
        <motion.h1 className="text-4xl font-extrabold text-center mb-6">
          Daily Task Calendar
        </motion.h1>
        <div className="flex justify-between items-center mb-6">
          <motion.button
            onClick={() =>
              setCurrentDay(
                new Date(currentDay.setDate(currentDay.getDate() - 1))
              )
            }
          >
            <FaChevronLeft size={24} />
          </motion.button>
          <h2 className="text-xl font-semibold">
            {currentDay.toLocaleDateString('default', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h2>
          <motion.button
            onClick={() =>
              setCurrentDay(
                new Date(currentDay.setDate(currentDay.getDate() + 1))
              )
            }
          >
            <FaChevronRight size={24} />
          </motion.button>
        </div>
        {filteredTasksForDay.length === 0 ? (
          <p className="text-center text-gray-500">
            No tasks for today. Create new tasks to get started!
          </p>
        ) : (
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTasksForDay.map((task) => {
              const dayIndex = getDayIndex(task, currentDay);
              const progress = task.totalTimeSpent[dayIndex] && task.activityDuration
                ? (task.totalTimeSpent[dayIndex]
                    .split(':')
                    .reduce((a, b) => 60 * a + +b) /
                  task.activityDuration
                    .split(':')
                    .reduce((a, b) => 60 * a + +b)) * 100
                : 0; // Default to 0% progress if values are undefined
              return (
                <motion.div
                  key={task._id}
                  className={`relative p-6 rounded-xl shadow-lg transform ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  } ${task.isCompleted[dayIndex] ? 'bg-green-100 text-black' : ''}`}
                >
                  {task.isCompleted[dayIndex] ? (
                    <FaCheckCircle className="absolute top-4 right-4 text-green-600 text-3xl" />
                  ) : task.isRunning[dayIndex] ? (
                    <FaPlay className="absolute top-4 right-4 text-blue-600 text-3xl" />
                  ) : (
                    <FaPause className="absolute top-4 right-4 text-yellow-600 text-3xl" />
                  )}
                  <h2 className="text-2xl font-bold mb-2">
                    {task.activityName}
                  </h2>
                  <p>
                    Priority: <span className="font-semibold">{task.priority}</span>
                  </p>
                  <p>
                    Total Time:{' '}
                    <span className="font-semibold text-blue-600">
                      {task.totalTimeSpent[dayIndex]}
                    </span>
                  </p>
                  <p>
                    Duration:{' '}
                    <span className="font-semibold text-green-600">
                      {task.activityDuration}
                    </span>
                  </p>
                  <motion.div className="relative h-4 mt-4 bg-gray-300 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </motion.div>
                  <div className="flex justify-between items-center mt-4">
                    <motion.button
                      className={`px-4 py-2 rounded-full text-white ${
                        task.isRunning[dayIndex]
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                      onClick={() => toggleTaskTimer(task)}
                    >
                      {task.isRunning[dayIndex]
                        ? 'Pause'
                        : task.totalTimeSpent[dayIndex] !== '00:00:00'
                        ? 'Resume'
                        : 'Start'}
                    </motion.button>
                    <motion.button
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md"
                      onClick={() => deleteTask(task._id)}
                    >
                      <FaTrash /> Delete
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
