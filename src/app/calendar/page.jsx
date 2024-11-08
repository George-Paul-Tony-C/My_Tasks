'use client';

import { useEffect, useState } from 'react';
import {
  BsChevronLeft,
  BsChevronRight,
  BsCheckCircleFill,
  BsPlayFill,
  BsPauseFill,
  BsTrashFill,
  BsArrowCounterclockwise,
} from 'react-icons/bs';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDarkMode } from '../components/DarkModeProvider';
import LoadingSpinner from '../components/LoadingSpinner';

// Import background images
import LightBackground from '../assets/light-background.png';
import DarkBackground from '../assets/dark-background.png';

export default function CalendarPage() {
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [currentDay, setCurrentDay] = useState(new Date());

  // Move getDayIndex function above its first use
  const getDayIndex = (task, currentDay) => {
    const createdAt = new Date(task.createdAt);

    // Calculate the number of days between createdAt and currentDay
    const dayDifference = Math.floor(
      (currentDay - createdAt) / (24 * 60 * 60 * 1000)
    );

    // If currentDay is before the createdAt date, return -1 (do not show the task)
    if (dayDifference < 0) return -1;

    // Find the weekday index based on task's repeating days (daysOfWeek)
    const weekdayIndex = task.daysOfWeek.indexOf(
      currentDay.toLocaleDateString('en-US', { weekday: 'long' })
    );

    // If the current day does not match any scheduled day, return -1
    if (weekdayIndex === -1) return -1;

    // Calculate the week offset based on the total number of passed days and repeat cycle
    const weekIndex = Math.floor(dayDifference / 7);

    // Only show the task if within the allowed week range
    return weekIndex < task.weeks
      ? weekIndex * task.daysOfWeek.length + weekdayIndex
      : -1;
  };

  const addElapsedTime = (timeSpent = '00:00:00', elapsed = 0) => {
    const total =
      timeSpent.split(':').reduce((acc, t) => 60 * acc + +t, 0) + elapsed;
    return new Date(total * 1000).toISOString().substr(11, 8);
  };

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

  // Update the timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) =>
        prevTasks.map((task) => {
          const dayIndex = getDayIndex(task, currentDay);
          if (dayIndex !== -1 && task.isRunning[dayIndex]) {
            return {
              ...task,
              totalTimeSpent: task.totalTimeSpent.map((time, index) =>
                index === dayIndex ? addElapsedTime(time, 1) : time
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

  const markTaskCompleted = (task) => {
    const dayIndex = getDayIndex(task, currentDay);
    if (dayIndex !== -1) {
      updateTaskStatus(task._id, 'complete', dayIndex);
    }
  };

  const resetTaskCompletion = (task) => {
    const dayIndex = getDayIndex(task, currentDay);
    if (dayIndex !== -1) {
      updateTaskStatus(task._id, 'reset', dayIndex);
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
    ? tasks.filter((task) => getDayIndex(task, currentDay) !== -1)
    : [];

  // Color variables based on dark mode
  const colors = {
    backgroundImage: darkMode ? `url(${DarkBackground.src})` : `url(${LightBackground.src})`,
    textPrimary: darkMode ? 'text-white' : 'text-gray-800',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    cardBackground: darkMode ? 'bg-gray-800 bg-opacity-80' : 'bg-white bg-opacity-80',
    cardHover: darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100',
    buttonPrimary: 'bg-indigo-600 text-white',
    buttonSecondary: darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800',
    hoverPrimary: 'hover:bg-indigo-500',
    hoverSecondary: darkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-100',
    shadow: 'shadow-xl',
  };

  return loading ? (
    <LoadingSpinner />
  ) : (
    <div
      className="min-h-screen p-6 bg-cover bg-center"
      style={{ backgroundImage: colors.backgroundImage }}
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
      <div className="container mx-auto min-h-screen space-y-6">
        <motion.h1
          className={`text-5xl font-extrabold text-center mb-6 ${colors.textPrimary}`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Daily Task Calendar
        </motion.h1>
        <div className="flex justify-between items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              setCurrentDay(
                new Date(currentDay.setDate(currentDay.getDate() - 1))
              )
            }
            aria-label="Previous Day"
            className={`p-2 rounded-full ${colors.buttonSecondary} ${colors.hoverSecondary} transition`}
          >
            <BsChevronLeft size={24} />
          </motion.button>
          <h2 className={`text-2xl font-semibold ${colors.textPrimary}`}>
            {currentDay.toLocaleDateString('default', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() =>
              setCurrentDay(
                new Date(currentDay.setDate(currentDay.getDate() + 1))
              )
            }
            aria-label="Next Day"
            className={`p-2 rounded-full ${colors.buttonSecondary} ${colors.hoverSecondary} transition`}
          >
            <BsChevronRight size={24} />
          </motion.button>
        </div>
        {filteredTasksForDay.length === 0 ? (
          <p className={`text-center ${colors.textSecondary}`}>
            No tasks for today. Create new tasks to get started!
          </p>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1 },
              },
            }}
          >
            {filteredTasksForDay.map((task) => {
              const dayIndex = getDayIndex(task, currentDay);
              const progress =
                task.totalTimeSpent[dayIndex] && task.activityDuration
                  ? (task.totalTimeSpent[dayIndex]
                      .split(':')
                      .reduce((a, b) => 60 * a + +b) /
                      task.activityDuration
                        .split(':')
                        .reduce((a, b) => 60 * a + +b)) * 100
                  : 0;

              return (
                <motion.div
                  key={task._id}
                  className={`relative p-6 rounded-2xl ${colors.cardBackground} ${colors.shadow} transform transition duration-300 ${colors.cardHover}`}
                  whileHover={{ scale: 1.02 }}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  {task.isCompleted[dayIndex] ? (
                    <BsCheckCircleFill className="absolute top-4 right-4 text-green-500 text-3xl" />
                  ) : task.isRunning[dayIndex] ? (
                    <BsPlayFill className="absolute top-4 right-4 text-blue-500 text-3xl animate-pulse" />
                  ) : (
                    <BsPauseFill className="absolute top-4 right-4 text-yellow-500 text-3xl" />
                  )}
                  <h2 className={`text-2xl font-bold mb-2 ${colors.textPrimary}`}>
                    {task.activityName}
                  </h2>
                  <p className={`mb-1 ${colors.textSecondary}`}>
                    Priority:{' '}
                    <span
                      className={`font-semibold ${
                        task.priority === 'High'
                          ? 'text-red-500'
                          : task.priority === 'Medium'
                          ? 'text-yellow-500'
                          : 'text-green-500'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </p>
                  <p className={`mb-1 ${colors.textSecondary}`}>
                    Total Time:{' '}
                    <span className="font-semibold text-blue-500">
                      {task.totalTimeSpent[dayIndex]}
                    </span>
                  </p>
                  <p className={`mb-4 ${colors.textSecondary}`}>
                    Duration:{' '}
                    <span className="font-semibold text-green-500">
                      {task.activityDuration}
                    </span>
                  </p>
                  <div className="relative h-4 bg-gray-300 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute h-4 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    {!task.isCompleted[dayIndex] ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-4 py-2 rounded-full text-white shadow-md flex items-center space-x-2 ${
                          task.isRunning[dayIndex]
                            ? 'bg-red-500 hover:bg-red-600'
                            : 'bg-green-500 hover:bg-green-600'
                        }`}
                        onClick={() => toggleTaskTimer(task)}
                      >
                        {task.isRunning[dayIndex] ? (
                          <>
                            <BsPauseFill />
                            <span>Pause</span>
                          </>
                        ) : task.totalTimeSpent[dayIndex] !== '00:00:00' ? (
                          <>
                            <BsPlayFill />
                            <span>Resume</span>
                          </>
                        ) : (
                          <>
                            <BsPlayFill />
                            <span>Start</span>
                          </>
                        )}
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-full shadow-md flex items-center space-x-2"
                        onClick={() => resetTaskCompletion(task)}
                      >
                        <BsArrowCounterclockwise />
                        <span>Reset</span>
                      </motion.button>
                    )}
                    <div className="flex space-x-2">
                      {!task.isCompleted[dayIndex] && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-md flex items-center space-x-2"
                          onClick={() => markTaskCompleted(task)}
                        >
                          <BsCheckCircleFill />
                          <span>Complete</span>
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full shadow-md flex items-center space-x-2"
                        onClick={() => deleteTask(task._id)}
                      >
                        <BsTrashFill />
                        <span>Delete</span>
                      </motion.button>
                    </div>
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
