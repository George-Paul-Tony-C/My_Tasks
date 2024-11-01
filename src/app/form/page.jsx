'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { BsFillSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { FaExclamationCircle, FaExclamationTriangle, FaFlag } from 'react-icons/fa';
import { useDarkMode } from '../components/darkmode';
import { motion, AnimatePresence } from 'framer-motion'

export default function CreateActivity() {
  const [activityName, setActivityName] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [weeks, setWeeks] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [priority, setPriority] = useState('medium');
  const [hydrated, setHydrated] = useState(false);
  const [darkMode, toggleDarkMode] = useDarkMode();
  const router = useRouter();

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleCheckboxChange = (day) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  const formatDuration = (hours, minutes, seconds) => {
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const activityDuration = formatDuration(hours, minutes, seconds);

    const res = await fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ activityName, activityDuration, weeks, daysOfWeek, priority }),
    });

    if (res.ok) {
      toast.success('🎉 Activity created successfully!', {
        duration: 4000,
        icon: '✅',
      });
      setActivityName('');
      setHours('');
      setMinutes('');
      setSeconds('');
      setWeeks('');
      setDaysOfWeek([]);
      setPriority('medium');
      setTimeout(() => {
        router.push('/');
      }, 2500);
    } else {
      const data = await res.json();
      toast.error(data.error);
    }
  };

  if (!hydrated) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen flex flex-col items-center transition duration-500`}
    >
      <Toaster position="top-right" toastOptions={{ className: 'animate-bounce' }} />
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-full max-w-4xl p-10 mt-10 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 transition duration-500"
      >
        <div className="flex justify-end mb-4">
          <motion.button
            whileHover={{ rotate: 360 }}
            onClick={toggleDarkMode}
            className="text-2xl"
          >
            {darkMode ? <BsFillSunFill className="text-yellow-400" /> : <BsMoonStarsFill className="text-blue-500" />}
          </motion.button>
        </div>
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className={`text-4xl font-extrabold text-center mb-8 ${darkMode ? 'text-gray-100' : 'text-gray-800'} transition duration-500`}
        >
          Create a New Activity
        </motion.h1>

          <form onSubmit={handleSubmit} className={`space-y-10 ${darkMode ? "bg-gray-900" : "bg-gray-50"}  p-8 rounded-lg shadow-xl max-w-3xl mx-auto transition-all duration-500`}>
            {/* Activity Name */}
            <div className="flex justify-center">
              <motion.div
                className={`relative w-full max-w-md p-6 rounded-lg shadow-lg transform transition duration-500 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } border border-blue-500`}
                whileHover={{ scale: 1.03 }}
              >
                <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 text-3xl text-blue-500">📝</span>
                <label className={`block text-md font-semibold text-center mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Activity Name
                </label>
                <input
                  type="text"
                  className={`w-full text-center font-semibold p-3 rounded-lg outline-none border ${
                    darkMode ? 'bg-gray-900 text-gray-200 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-300'
                  } focus:border-blue-500 focus:ring focus:ring-blue-300 transition-all`}
                  value={activityName}
                  onChange={(e) => setActivityName(e.target.value)}
                  placeholder="Enter activity name"
                  required
                />
              </motion.div>
            </div>

            {/* Activity Duration */}
            <div>
              <label className={`block text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 text-center`}>
                Activity Duration
              </label>
              <div className="flex space-x-6 justify-center">
                {[
                  { label: 'Hours', value: hours, setValue: setHours, placeholder: '00', max: '24', icon: '🕒' },
                  { label: 'Minutes', value: minutes, setValue: setMinutes, placeholder: '00', max: '59', icon: '⏱️' },
                  { label: 'Seconds', value: seconds, setValue: setSeconds, placeholder: '00', max: '59', icon: '⏰' },
                ].map((timeUnit) => (
                  <motion.div
                    key={timeUnit.label}
                    className={`relative p-6 rounded-lg shadow-lg transform transition duration-500 ${
                      darkMode ? 'bg-gray-800' : 'bg-white'
                    } border border-blue-500 w-28 flex flex-col items-center`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 text-2xl">{timeUnit.icon}</span>
                    <label className={`block text-md font-semibold text-center mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {timeUnit.label}
                    </label>
                    <input
                      type="number"
                      className={`w-full text-center font-semibold p-3 rounded-lg outline-none border ${
                        darkMode ? 'bg-gray-900 text-gray-200 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-300'
                      } focus:border-blue-500 focus:ring focus:ring-blue-300 transition`}
                      value={timeUnit.value}
                      onChange={(e) => timeUnit.setValue(e.target.value)}
                      placeholder={timeUnit.placeholder}
                      min="0"
                      max={timeUnit.max}
                      required
                    />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Number of Weeks */}
            <div className="flex justify-center">
              <motion.div
                className={`relative w-full max-w-xs p-6 rounded-lg shadow-lg transform transition duration-500 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } border border-blue-500 flex flex-col items-center`}
                whileHover={{ scale: 1.03 }}
              >
                <span className="text-3xl mb-2 text-blue-500 animate-bounce">📅</span>
                <label className={`block text-md font-semibold text-center mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Number of Weeks
                </label>
                <input
                  type="number"
                  className={`w-full text-center font-semibold p-3 rounded-lg outline-none border ${
                    darkMode ? 'bg-gray-900 text-gray-200 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-300'
                  } focus:border-blue-500 focus:ring focus:ring-blue-300 transition`}
                  value={weeks}
                  onChange={(e) => setWeeks(e.target.value)}
                  placeholder="Enter number of weeks"
                  min="1"
                  required
                />
              </motion.div>
            </div>

            {/* Days of the Week */}
            <div className="flex flex-col items-center">
              <label className={`block text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Days of the Week
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <AnimatePresence key={day}>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1, boxShadow: '0px 0px 10px rgba(0, 123, 255, 0.4)' }}
                      whileTap={{ scale: 0.9, backgroundColor: daysOfWeek.includes(day) ? '#3b82f6' : '#e5e7eb' }}
                      onClick={() => handleCheckboxChange(day)}
                      className={`relative px-4 py-3 rounded-lg transform transition-colors duration-500 overflow-hidden focus:outline-none ${
                        daysOfWeek.includes(day)
                          ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                          : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`
                      }`}
                    >
                      <span className="relative z-10">{day}</span>
                      {daysOfWeek.includes(day) && (
                        <motion.div
                          layoutId="ripple"
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 0.2, scale: 2 }}
                          exit={{ opacity: 0, scale: 1 }}
                          transition={{ duration: 0.6 }}
                          className="absolute inset-0 bg-blue-500 rounded-lg"
                        />
                      )}
                    </motion.button>
                  </AnimatePresence>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div className="flex justify-center">
              <motion.div
                className={`relative w-full max-w-xs p-6 rounded-lg shadow-lg transform transition duration-500 ${
                  darkMode ? 'bg-gray-800' : 'bg-white'
                } border border-blue-500 flex flex-col items-center`}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-4xl mb-2 animate-bounce transition-colors duration-300">
                  {priority === 'high' && <FaExclamationCircle className="text-red-500" />}
                  {priority === 'medium' && <FaExclamationTriangle className="text-yellow-500" />}
                  {priority === 'low' && <FaFlag className="text-green-500" />}
                </div>
                <label className={`block text-md font-semibold text-center mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={`w-full text-center font-semibold p-3 rounded-lg outline-none border ${
                    darkMode ? 'bg-gray-900 text-gray-200 border-gray-700' : 'bg-gray-100 text-gray-800 border-gray-300'
                  } focus:border-blue-500 focus:ring focus:ring-blue-300 transition duration-500`}
                  required
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </motion.div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-8">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.1, boxShadow: '0px 0px 15px rgba(59, 130, 246, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className="relative w-full max-w-md bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-5 py-3 rounded-full shadow-lg overflow-hidden focus:outline-none"
              >
                <span className="relative z-10">Create Activity</span>
                <motion.div
                  className="absolute inset-0 bg-blue-500 opacity-25 rounded-full pointer-events-none"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.2, scale: 2 }}
                  transition={{ duration: 0.8 }}
                />
              </motion.button>
            </div>
          </form>
      </motion.div>
    </motion.div>
  );
}
