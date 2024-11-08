'use client';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaTasks,
  FaCheckCircle,
  FaPlayCircle,
  FaCalendarAlt,
  FaFilter,
} from 'react-icons/fa';
import { useDarkMode } from './components/DarkModeProvider';
import { motion } from 'framer-motion';
import LoadingSpinner from './components/LoadingSpinner';
import dynamic from 'next/dynamic';
import 'chart.js/auto';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Menu, Transition } from '@headlessui/react';
import Tooltip from './components/Tooltip';

// Dynamic imports for charts
const DoughnutChart = dynamic(() => import('./components/DoughnutChart'), { ssr: false });
const BarChart = dynamic(() => import('./components/BarChart'), { ssr: false });

// Import background images
import LightBackground from './assets/light-background.png';
import DarkBackground from './assets/dark-background.png';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks);
      setLoading(false);
    };
    fetchTasks();
  }, []);

  const selectedDate = date;

  // Helper functions
  const getDayIndex = (task, selectedDate) => {
    const createdAt = new Date(task.createdAt);
    const dayDifference = Math.floor((selectedDate - createdAt) / (24 * 60 * 60 * 1000));
    const weekIndex = Math.floor(dayDifference / 7);
    const weekdayIndex = task.daysOfWeek.indexOf(
      selectedDate.toLocaleDateString('en-US', { weekday: 'long' })
    );
    return weekdayIndex === -1 || weekIndex >= task.weeks
      ? -1
      : weekIndex * task.daysOfWeek.length + weekdayIndex;
  };

  const filterTasks = () => {
    const tasksForSelectedDate = tasks.filter((task) => getDayIndex(task, selectedDate) !== -1);
    return tasksForSelectedDate.filter((task) => {
      const dayIndex = getDayIndex(task, selectedDate);
      if (filter === 'Completed') {
        return task.isCompleted[dayIndex];
      } else if (filter === 'Ongoing') {
        return task.isRunning[dayIndex];
      }
      return true;
    });
  };

  const calculateStatistics = (tasksForSelectedDate) => {
    let totalCompletionPercentage = 0;
    let taskCount = 0;
  
    tasksForSelectedDate.forEach((task) => {
      const dayIndex = getDayIndex(task, selectedDate);
      if (dayIndex !== -1) {
        let completionPercentage = 0;
  
        if (task.isCompleted[dayIndex]) {
          completionPercentage = 100;
        } else if (task.totalTimeSpent[dayIndex]) {
          const timeSpentInSeconds = task.totalTimeSpent[dayIndex]
            .split(':')
            .reduce((acc, time) => 60 * acc + +time, 0);
  
          const activityDurationInSeconds = task.activityDuration
            .split(':')
            .reduce((acc, time) => 60 * acc + +time, 0);
  
          completionPercentage = Math.min(
            (timeSpentInSeconds / activityDurationInSeconds) * 100,
            100
          );
        } else {
          completionPercentage = 0;
        }
  
        totalCompletionPercentage += completionPercentage;
        taskCount++;
      }
    });
  
    const completionRate =
      taskCount > 0 ? parseFloat((totalCompletionPercentage / taskCount).toFixed(1)) : 0;
  
    const completedTasksCount = tasksForSelectedDate.filter((task) => {
      const dayIndex = getDayIndex(task, selectedDate);
      return task.isCompleted[dayIndex];
    }).length;
  
    const totalTasksCount = tasksForSelectedDate.length;
  
    const ongoingTasksCount = tasksForSelectedDate.filter((task) => {
      const dayIndex = getDayIndex(task, selectedDate);
      return task.isRunning[dayIndex];
    }).length;
  
    return { completionRate, completedTasksCount, totalTasksCount, ongoingTasksCount };
  };
  

  if (loading) return <LoadingSpinner />;

  const filteredTasks = filterTasks();
  const { completionRate, completedTasksCount, totalTasksCount, ongoingTasksCount } =
    calculateStatistics(filteredTasks);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

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

  return (
    <div
      className="min-h-screen p-6 bg-cover bg-center"
      style={{ backgroundImage: colors.backgroundImage }}
    >
      <div className="container mx-auto max-w-screen-xl">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className={`text-5xl font-extrabold tracking-tight ${colors.textPrimary}`}>
            Welcome Back George!
          </h1>
          <div className="flex items-center space-x-4">
            <Link
              href={'/calendar'}
              className={`px-6 py-3 ${colors.buttonPrimary} rounded-full ${colors.shadow} ${colors.hoverPrimary} transition transform hover:-translate-y-1`}
            >
              Todays Tasks
            </Link>
            <button
              onClick={() => router.push('/tasks')}
              className={`px-6 py-3 ${colors.buttonSecondary} rounded-full ${colors.shadow} ${colors.hoverSecondary} transition transform hover:-translate-y-1`}
            >
              View All Tasks
            </button>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="grid grid-cols-1 xl:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left Column */}
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hero Section */}
            <motion.div
              className={`${
                darkMode
                  ? 'bg-gradient-to-r from-slate-900 via-gray-900 to-slate-900'
                  : 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-100'
              }col-span-1 md:col-span-2 relative overflow-hidden rounded-2xl shadow-lg`}
              variants={itemVariants}
            >
              <div
                className={` p-8 ${darkMode ? ' text-white': ' text-slate-700'}`}
              >
                <h2 className={`text-4xl font-bold mb-2`}>Your Productivity Hub</h2>
                <p className="text-lg mb-4">
                  Track your tasks, stay organized, and achieve your goals.
                </p>
                <Link
                  href={'/form'}
                  className="inline-block px-6 py-3 bg-gray-50 text-slate-900 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:-translate-y-1"
                >
                  Get Started
                </Link>
              </div>
            </motion.div>

            {/* Completion Rate */}
            <motion.div
              className={`${colors.cardBackground} p-6 rounded-2xl ${colors.shadow} relative ${colors.cardHover} transition`}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className={`text-2xl font-semibold mb-4 ${colors.textPrimary}`}>Completion Rate</h2>
              <Suspense fallback={<LoadingSpinner />}>
                <DoughnutChart completionRate={completionRate} darkMode={darkMode} />
              </Suspense>
            </motion.div>

            {/* Task Statistics */}
            <motion.div
              className={`${colors.cardBackground} p-6 rounded-2xl ${colors.shadow} relative ${colors.cardHover} transition`}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className={`text-2xl font-semibold mb-4 ${colors.textPrimary}`}>Task Overview</h2>
              <Suspense fallback={<LoadingSpinner />}>
                <BarChart
                  completedTasksCount={completedTasksCount}
                  totalTasksCount={totalTasksCount}
                  ongoingTasksCount={ongoingTasksCount}
                  darkMode={darkMode}
                />
              </Suspense>
            </motion.div>

            {/* Task List */}
            <motion.div
              className={`${colors.cardBackground} p-6 rounded-2xl ${colors.shadow} col-span-1 md:col-span-2 relative ${colors.cardHover} transition`}
              variants={itemVariants}
              whileHover={{ scale: 1.01 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-2xl font-semibold ${colors.textPrimary}`}>
                  Tasks for {selectedDate.toDateString()}
                </h2>
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button
                    className={`inline-flex justify-center w-full px-4 py-2 ${
                      darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700'
                    } text-sm font-medium rounded-full hover:bg-gray-300 focus:outline-none`}
                  >
                    <FaFilter className="mr-2" />
                    {filter}
                  </Menu.Button>
                  <Transition
                    as={motion.div}
                    enter="transition ease-out duration-100"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Menu.Items
                      className={`${
                        darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
                      } absolute z-10 right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
                    >
                      <div className="px-1 py-1 ">
                        {['All', 'Completed', 'Ongoing'].map((option) => (
                          <Menu.Item key={option} >
                            {({ active }) => (
                              <button
                                onClick={() => setFilter(option)}
                                className={`${
                                  active ? 'bg-gray-100 text-gray-900' : ''
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm `}
                              >
                                {option}
                              </button>
                            )}
                          </Menu.Item>
                        ))}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
              {filteredTasks.length > 0 ? (
                <ul className="space-y-4">
                  {filteredTasks.map((task) => (
                    <motion.li
                      key={task._id || task.activityName}
                      className={`flex items-center justify-between p-4 rounded-xl ${colors.cardBackground} ${colors.cardHover} transition shadow-md`}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div>
                        <p className={`text-lg font-semibold ${colors.textPrimary}`}>
                          {task.activityName}
                        </p>
                        <p className={`text-sm ${colors.textSecondary}`}>
                          Duration: {task.activityDuration}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Tooltip content="View Task">
                          <button
                            onClick={() => router.push(`/task/${task._id}`)}
                            className="px-3 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-400 transition"
                          >
                            View
                          </button>
                        </Tooltip>
                        <Tooltip content="Edit Task">
                          <button
                            onClick={() => router.push(`/edit-task/${task._id}`)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded-full hover:bg-yellow-400 transition"
                          >
                            Edit
                          </button>
                        </Tooltip>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className={`text-center ${colors.textSecondary} mt-4`}>
                  No tasks found for this filter.
                </p>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="grid grid-cols-1 gap-6">
            {/* Calendar */}
            <motion.div
              className={`${colors.cardBackground} p-6 rounded-2xl ${colors.shadow} relative ${colors.cardHover} transition`}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className={`text-2xl font-semibold mb-4 flex items-center ${colors.textPrimary}`}>
                <FaCalendarAlt className="inline mr-2 text-red-500" /> Calendar
              </h2>
              <Calendar
                onChange={setDate}
                value={date}
                className={`rounded ${
                  darkMode ? 'text-gray-800' : 'text-gray-800'
                } custom-calendar`}
              />
            </motion.div>

            {/* Statistics Cards */}
            {[
              {
                title: 'Total Tasks',
                count: totalTasksCount,
                icon: <FaTasks className="inline mr-2" />,
                bgColor: darkMode
                  ? 'from-blue-700 to-blue-800'
                  : 'from-blue-500 to-blue-600',
              },
              {
                title: 'Completed Tasks',
                count: completedTasksCount,
                icon: <FaCheckCircle className="inline mr-2" />,
                bgColor: darkMode
                  ? 'from-green-700 to-green-800'
                  : 'from-green-500 to-green-600',
              },
              {
                title: 'Ongoing Tasks',
                count: ongoingTasksCount,
                icon: <FaPlayCircle className="inline mr-2" />,
                bgColor: darkMode
                  ? 'from-yellow-600 to-yellow-700'
                  : 'from-yellow-500 to-yellow-600',
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className={`p-6 rounded-2xl shadow-lg bg-gradient-to-r ${stat.bgColor} text-white relative overflow-hidden`}
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <h2 className="text-2xl font-semibold mb-2 flex items-center relative">
                  {stat.icon} {stat.title}
                </h2>
                <p className="text-5xl font-bold relative">{stat.count}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
