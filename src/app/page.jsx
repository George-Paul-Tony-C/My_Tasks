'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FaTasks,
  FaClock,
  FaCheckCircle,
  FaPlayCircle,
  FaCalendarAlt,
  FaFilter,
} from 'react-icons/fa';
import { useDarkMode } from './components/DarkModeProvider';
import { motion } from 'framer-motion';
import LoadingSpinner from './components/LoadingSpinner';
import { Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Menu, Transition } from '@headlessui/react';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [filter, setFilter] = useState('All');

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

  const tasksForSelectedDate = tasks.filter((task) => getDayIndex(task, selectedDate) !== -1);

  const filteredTasks = tasksForSelectedDate.filter((task) => {
    const dayIndex = getDayIndex(task, selectedDate);
    if (filter === 'Completed') {
      return task.isCompleted[dayIndex];
    } else if (filter === 'Ongoing') {
      return task.isRunning[dayIndex];
    }
    return true;
  });

  const totalTimeAllocated = tasksForSelectedDate.reduce((total, task) => {
    const dayIndex = getDayIndex(task, selectedDate);
    if (dayIndex !== -1) {
      const durationInSeconds = task.activityDuration
        .split(':')
        .reduce((acc, time) => 60 * acc + +time, 0);
      return total + durationInSeconds;
    }
    return total;
  }, 0);

  const totalTimeCompleted = tasksForSelectedDate.reduce((total, task) => {
    const dayIndex = getDayIndex(task, selectedDate);
    if (dayIndex !== -1 && task.totalTimeSpent[dayIndex]) {
      const timeSpentInSeconds = task.totalTimeSpent[dayIndex]
        .split(':')
        .reduce((acc, time) => 60 * acc + +time, 0);
      return total + timeSpentInSeconds;
    }
    return total;
  }, 0);

  const completionRate =
    totalTimeAllocated > 0
      ? Math.floor((totalTimeCompleted / totalTimeAllocated) * 100)
      : 0;

  const completedTasksCount = tasksForSelectedDate.filter((task) => {
    const dayIndex = getDayIndex(task, selectedDate);
    return task.isCompleted[dayIndex];
  }).length;
  const totalTasksCount = tasksForSelectedDate.length;
  const ongoingTasksCount = tasksForSelectedDate.filter((task) => {
    const dayIndex = getDayIndex(task, selectedDate);
    return task.isRunning[dayIndex];
  }).length;

  const chartData = {
    datasets: [
      {
        data: [completionRate, 100 - completionRate],
        backgroundColor: ['#22c55e', '#e5e7eb'],
        borderWidth: 0,
      },
    ],
  };

  const barChartData = {
    labels: ['Total', 'Completed', 'Ongoing'],
    datasets: [
      {
        label: 'Tasks',
        data: [totalTasksCount, completedTasksCount, ongoingTasksCount],
        backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b'],
        borderRadius: 8,
      },
    ],
  };

  return loading ? (
    <LoadingSpinner />
  ) : (
    <div
      className={`${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'
      } min-h-screen p-6`}
    >
      <div className="container mx-auto max-w-screen-xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link
              href={'/form'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
            >
              Create Task
            </Link>
            <button
              onClick={() => router.push('/tasks')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
            >
              View All Tasks
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column */}
          <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Completion Rate */}
            <motion.div
              className={`${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } p-6 rounded-2xl shadow-lg`}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-semibold mb-4">Completion Rate</h2>
              <div className="w-full">
                <Doughnut data={chartData} />
                <div className="flex items-center justify-center mt-4">
                  <span
                    className={`text-5xl font-extrabold ${
                      darkMode ? 'text-green-400' : 'text-green-500'
                    }`}
                  >
                    {completionRate}%
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Task Statistics */}
            <motion.div
              className={`${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } p-6 rounded-2xl shadow-lg`}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-semibold mb-4">Task Overview</h2>
              <Bar data={barChartData} options={{ plugins: { legend: { display: false } } }} />
            </motion.div>

            {/* Latest Task */}
            {tasks.length > 0 && (
              <motion.div
                className={`${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } p-6 rounded-2xl shadow-lg col-span-1 md:col-span-2`}
                whileHover={{ scale: 1.02 }}
              >
                <h2 className="text-2xl font-semibold mb-4 flex items-center">
                  <FaClock className="mr-2 text-blue-500" /> Latest Task
                </h2>
                <div className="flex items-center">
                  <div className="flex-grow">
                    <p className="text-2xl font-bold">{tasks[tasks.length - 1].activityName}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(tasks[tasks.length - 1].createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/task/${tasks[tasks.length - 1]._id}`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
                  >
                    View Task
                  </button>
                </div>
              </motion.div>
            )}

            {/* Task List */}
            <div
              className={`${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } p-6 rounded-2xl shadow-lg col-span-1 md:col-span-2`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">
                  Tasks for {selectedDate.toDateString()}
                </h2>
                <Menu as="div" className="relative inline-block text-left">
                  <Menu.Button className="inline-flex justify-center w-full px-4 py-2 bg-gray-200 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none">
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
                      } absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
                    >
                      <div className="px-1 py-1 ">
                        {['All', 'Completed', 'Ongoing'].map((option) => (
                          <Menu.Item key={option}>
                            {({ active }) => (
                              <button
                                onClick={() => setFilter(option)}
                                className={`${
                                  active ? 'bg-gray-100 text-gray-900' : ''
                                } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
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
                    <li
                      key={task._id || task.activityName}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      }`}
                    >
                      <div>
                        <p className="text-lg font-semibold">{task.activityName}</p>
                        <p className="text-sm text-gray-500">
                          Duration: {task.activityDuration}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/task/${task._id}`)}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => router.push(`/edit-task/${task._id}`)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-400 transition"
                        >
                          Edit
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500 mt-4">No tasks found for this filter.</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="grid grid-cols-1 gap-6">
            {/* Calendar */}
            <motion.div
              className={`${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } p-6 rounded-2xl shadow-lg`}
              whileHover={{ scale: 1.02 }}
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center">
                <FaCalendarAlt className="inline mr-2 text-red-500" /> Calendar
              </h2>
              <Calendar
                onChange={setDate}
                value={date}
                className={`${
                  darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
                } rounded-lg`}
                tileClassName={({ date, view }) => {
                  if (
                    tasks.some(
                      (task) => getDayIndex(task, date) !== -1 && view === 'month'
                    )
                  ) {
                    return 'bg-green-200';
                  }
                }}
              />
            </motion.div>

            {/* Total Tasks */}
            <motion.div
              className={`${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } p-6 rounded-2xl shadow-lg`}
              whileHover={{ scale: 1.05 }}
            >
              <h2 className="text-2xl font-semibold mb-2 flex items-center">
                <FaTasks className="inline mr-2 text-blue-500" /> Total Tasks
              </h2>
              <p className="text-5xl font-bold">{totalTasksCount}</p>
            </motion.div>

            {/* Completed Tasks */}
            <motion.div
              className={`${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } p-6 rounded-2xl shadow-lg`}
              whileHover={{ scale: 1.05 }}
            >
              <h2 className="text-2xl font-semibold mb-2 flex items-center">
                <FaCheckCircle className="inline mr-2 text-green-500" /> Completed Tasks
              </h2>
              <p className="text-5xl font-bold">{completedTasksCount}</p>
            </motion.div>

            {/* Ongoing Tasks */}
            <motion.div
              className={`${
                darkMode ? 'bg-gray-800' : 'bg-white'
              } p-6 rounded-2xl shadow-lg`}
              whileHover={{ scale: 1.05 }}
            >
              <h2 className="text-2xl font-semibold mb-2 flex items-center">
                <FaPlayCircle className="inline mr-2 text-yellow-500" /> Ongoing Tasks
              </h2>
              <p className="text-5xl font-bold">{ongoingTasksCount}</p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
