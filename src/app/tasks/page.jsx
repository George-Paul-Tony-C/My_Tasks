// TasksPage.jsx

'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '../components/DarkModeProvider';
import { motion } from 'framer-motion';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { darkMode } = useDarkMode();
  const router = useRouter();

  // Fetch tasks with simplified fields
  const fetchTasks = async () => {
    const res = await fetch('/api/tasks');
    const data = await res.json();
    setTasks(data.tasks);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div
      className={`${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'
      } min-h-screen transition duration-500`}
    >
      <div className="container mx-auto p-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-6">Tasks</h1>

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
                className={`relative p-6 rounded-3xl shadow-xl ${
                  darkMode ? 'bg-gray-800' : 'bg-white text-gray-800'
                } cursor-pointer`}
                whileHover={{ scale: 1.03 }}
                onClick={() => router.push(`/task/${task._id}`)}
              >
                <h2 className="text-2xl font-bold mb-2">{task.activityName}</h2>
                <p>
                  Duration:{' '}
                  <span className="font-semibold text-green-600">
                    {task.activityDuration}
                  </span>
                </p>
                <p>
                  Weeks: <span className="font-semibold">{task.weeks}</span>
                </p>
                <p>
                  Days:{' '}
                  <span className="font-semibold">
                    {task.daysOfWeek.join(', ')}
                  </span>
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
