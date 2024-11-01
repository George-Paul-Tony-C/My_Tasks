'use client';
import { useEffect, useState } from 'react';
import { BsFillSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import { FaTasks, FaClock, FaCheckCircle, FaPlayCircle, FaCalendarAlt } from 'react-icons/fa'; // Icons for task status
import { useDarkMode } from './components/darkmode';

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [darkMode, toggleDarkMode] = useDarkMode();
  const [loading, setLoading] = useState(true); // Loading state
  const router = useRouter();

  useEffect(() => {
    const fetchTasks = async () => {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks);
      setLoading(false); // Data has loaded
    };

    fetchTasks();
  }, []);

  const completedTasksCount = tasks.filter((task) => task.status === 'completed').length;
  const totalTasksCount = tasks.length;
  const completionRate = totalTasksCount > 0 ? Math.floor((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} min-h-screen transition duration-500`}>
      <div className="container mx-auto p-8 min-h-screen">
        {/* Dark Mode Toggle */}
        <div className="flex justify-end mb-6">
          <button
            className="p-2 rounded-full focus:outline-none transition hover:scale-110 transform"
            onClick={toggleDarkMode}
          >
            {darkMode ? <BsFillSunFill className="text-yellow-400" size={24} /> : <BsMoonStarsFill className="text-blue-500" size={24} />}
          </button>
        </div>

        <h1 className="text-5xl font-extrabold text-center mb-12 transition duration-500">Activity Dashboard</h1>

        {/* Show loading skeleton if data is still being fetched */}
        {loading ? (
          <div className="flex justify-center items-center min-h-screen">
            <div className="space-y-4 w-full max-w-3xl mx-auto">
              <div className="h-24 bg-gray-300 animate-pulse rounded-lg"></div>
              <div className="h-24 bg-gray-300 animate-pulse rounded-lg"></div>
              <div className="h-24 bg-gray-300 animate-pulse rounded-lg"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Navigation Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-6 mb-12">
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xl font-semibold px-8 py-4 rounded-full shadow-lg transform transition hover:-translate-y-1"
                onClick={() => router.push('/tasks')}
              >
                View All Tasks
              </button>
              <button
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xl font-semibold px-8 py-4 rounded-full shadow-lg transform transition hover:-translate-y-1"
                onClick={() => router.push('/form')}
              >
                Add New Task
              </button>
              <button
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-xl font-semibold px-8 py-4 rounded-full shadow-lg transform transition hover:-translate-y-1"
                onClick={() => router.push('/calendar')}
              >
                <FaCalendarAlt className="inline mr-2" /> View Calendar
              </button>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Total Tasks Widget */}
              <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-8 rounded-3xl shadow-2xl transform transition hover:scale-105 ease-in-out border border-gray-200`}>
                <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700' }`}>
                  <FaTasks className="inline mr-2"/> Total Tasks
                </h2>
                <p className={`text-4xl font-extrabold ${darkMode ? 'text-blue-400' : 'text-blue-600' }`}>{tasks.length}</p>
              </div>

              {/* Latest Task Widget */}
              {tasks.length > 0 && (
                <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-8 rounded-3xl shadow-2xl transform transition hover:scale-105 ease-in-out border border-gray-200`}>
                  <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700' }`}>
                    <FaClock className="inline mr-2"/> Latest Task
                  </h2>
                  <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-800'}`}>{tasks[tasks.length - 1].taskName}</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    {new Date(tasks[tasks.length - 1].startTime).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Tasks Today Widget */}
              <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-8 rounded-3xl shadow-2xl transform transition hover:scale-105 ease-in-out border border-gray-200`}>
                <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700' }`}>
                  <FaCheckCircle className="inline mr-2"/> Tasks Today
                </h2>
                <p className={`text-4xl font-extrabold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {tasks.filter(
                    (task) =>
                      new Date(task.startTime).toLocaleDateString() ===
                      new Date().toLocaleDateString()
                  ).length}
                </p>
              </div>

              {/* Ongoing Tasks Widget */}
              <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} p-8 rounded-3xl shadow-2xl transform transition hover:scale-105 ease-in-out border border-gray-200`}>
                <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700' }`}>
                  <FaPlayCircle className="inline mr-2"/> Ongoing Tasks
                </h2>
                <p className={`text-4xl font-extrabold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {tasks.filter(task => !task.isCompleted && localStorage.getItem(`task_${task._id}_running`)).length}
                </p>
              </div>
            </div>

            {/* Progress Bar for Completed Tasks */}
            <div className="my-12 flex flex-col items-center">
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700' }`}>Completion Rate</h2>
              <div className="relative">
                <svg className="w-40 h-40 transform transition ease-out duration-1000">
                  <circle
                    className={`${darkMode ? 'text-white' : 'text-gray-400' }`}
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r="70"
                    cx="80"
                    cy="80"
                  />
                  <circle
                    className={`${darkMode ? 'text-blue-400' : 'text-blue-600' }`}
                    strokeWidth="4"
                    strokeDasharray={`${completionRate * 4.4} 440`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="70"
                    cx="80"
                    cy="80"
                    style={{
                      transition: 'stroke-dasharray 1s ease-in-out',
                    }}
                  />
                </svg>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                  <span className={`text-4xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600' }`}>{completionRate}%</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
