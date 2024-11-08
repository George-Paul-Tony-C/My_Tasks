"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDarkMode } from "./DarkModeProvider";
import {
  BsFillSunFill,
  BsMoonStarsFill,
  BsBellFill,
  BsFillPersonFill,
  BsSearch,
} from "react-icons/bs";
import { FaTasks } from "react-icons/fa"; // Ensure FaTasks is imported
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Navbar() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    // Fetch notifications (Mock data for example)
    const fetchNotifications = async () => {
      // Mock notifications
      const data = {
        notifications: [
          {
            id: 1,
            message: "You have a meeting at 3 PM",
            date: new Date(),
            link: "/calendar",
          },
          {
            id: 2,
            message: "Task 'Design Review' is due tomorrow",
            date: new Date(),
            link: "/tasks",
          },
        ],
      };
      setNotifications(data.notifications);
    };
    fetchNotifications();
  }, []);

  const toggleProfileDropdown = () => setIsProfileOpen(!isProfileOpen);
  const toggleNotificationsDropdown = () =>
    setIsNotificationsOpen(!isNotificationsOpen);

  if (!hasMounted) return null;

  return (
    <nav
      className={`${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
      } shadow-2xl py-4 px-8 transition-colors fixed top-0 left-0 right-0 z-20`}
    >
      <div className="flex justify-between items-center">
        {/* Left Side - Logo and Search Bar */}
        <div className="flex items-center space-x-4">
          <Link href={"/"}>
            <div className="flex items-center space-x-2 cursor-pointer ml-10">
              <h1 className="text-2xl font-bold">My Assistant</h1>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-200 dark:bg-gray-800 rounded-full px-4 py-1.5 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <BsSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
          </div>
        </div>

        {/* Right Side - Icons for Dark Mode, Notifications, and Profile */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full focus:outline-none transition hover:scale-110 transform"
          >
            {darkMode ? (
              <BsFillSunFill className="text-yellow-400" size={24} />
            ) : (
              <BsMoonStarsFill className="text-blue-500" size={24} />
            )}
          </button>

          {/* Notifications Icon */}
          <div className="relative">
            <button
              onClick={toggleNotificationsDropdown}
              className="relative p-2 rounded-full focus:outline-none hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <BsBellFill size={22} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 mt-2 w-80 ${
                    darkMode ? "bg-gray-900" : "bg-white"
                  } shadow-lg rounded-lg z-20 py-2`}
                >
                  {notifications.length > 0 ? (
                    <ul>
                      {notifications.map((notification) => (
                        <li
                          key={notification.id}
                          className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => {
                            router.push(notification.link);
                            setIsNotificationsOpen(false);
                          }}
                        >
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notification.date).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-4 py-2 text-sm text-gray-500">
                      No new notifications.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile Icon */}
          <div className="relative">
            <button
              onClick={toggleProfileDropdown}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <BsFillPersonFill size={28} />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`absolute right-0 mt-2 w-48 ${
                    darkMode ? "bg-gray-900" : "bg-white"
                  } shadow-lg rounded-lg z-20 py-2`}
                >
                  <button
                    onClick={() => {
                      router.push("/profile");
                      setIsProfileOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      router.push("/settings");
                      setIsProfileOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      router.push("/logout");
                      setIsProfileOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
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
