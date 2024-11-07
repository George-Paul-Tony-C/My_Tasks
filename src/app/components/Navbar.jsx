'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from "./DarkModeProvider";
import { BsFillSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { FaBell, FaUserCircle, FaSearch } from 'react-icons/fa';

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true); // Indicate that the component is fully mounted on the client
  }, []);

  const toggleProfileDropdown = () => setIsProfileOpen(!isProfileOpen);

  if (!hasMounted) return null; // Avoid rendering until after mount

  return (
    <nav className={`${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'} shadow-md py-4 px-8 pl-16 transition-colors`}>
      <div className="flex justify-between items-center">
        
        {/* Left Side - Logo and Search Bar */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold ml-8">My Dashboard</h1>
          
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-200 dark:bg-gray-700 rounded-full px-4 py-1.5 pl-10 focus:outline-none transition-all"
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        {/* Right Side - Icons for Dark Mode, Notifications, and Profile */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button onClick={toggleDarkMode} className="p-2 rounded-full focus:outline-none transition hover:scale-110 transform">
            {darkMode ? (
              <BsFillSunFill className="text-yellow-400" size={24} />
            ) : (
              <BsMoonStarsFill className="text-blue-500" size={24} />
            )}
          </button>

          {/* Notifications Icon */}
          <button className="relative p-2 rounded-full focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700 transition">
            <FaBell size={20} />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile Icon */}
          <div className="relative">
            <button onClick={toggleProfileDropdown} className="flex items-center space-x-2 focus:outline-none">
              <FaUserCircle size={28} />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-20 py-2"
                >
                  <button className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Profile
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Settings
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </nav>
  );
}
