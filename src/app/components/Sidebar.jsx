"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDarkMode } from "./DarkModeProvider";
import {
  FaHome,
  FaTasks,
  FaCalendarAlt,
  FaPlusCircle,
  FaBars,
  FaTimes,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar() {
  const { darkMode } = useDarkMode();
  const router = useRouter();
  const pathname = usePathname(); // Hook to get current pathname
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Animation variants for framer-motion
  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: -300,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <>
      {/* Toggle Button (Fixed Position on Top) */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 p-2 z-30 rounded-full transition-colors duration-300 ${
          darkMode
            ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
        }`}
      >
        <FaBars size={24} />
      </button>

      {/* Sidebar with Slide Animation */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar} // Close sidebar when clicking on overlay
            />

            {/* Sidebar */}
            <motion.aside
              initial="closed"
              animate="open"
              exit="closed"
              variants={sidebarVariants}
              className={`fixed top-0 left-0 h-full w-72 p-6 z-30 ${
                darkMode
                  ? "bg-gray-900 text-gray-100"
                  : "bg-white text-gray-800"
              } shadow-lg`}
            >
              {/* Close Button Inside Sidebar */}
              <button
                onClick={toggleSidebar}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <FaTimes size={20} />
              </button>

              {/* Logo */}
              <div className="flex items-center space-x-2 mb-8">
                <h2 className="text-2xl font-bold">My Assistant</h2>
              </div>

              {/* Navigation Menu */}
              <nav className="space-y-4">
                <SidebarButton
                  icon={<FaHome size={20} />}
                  label="Home"
                  href="/"
                />
                <SidebarButton
                  icon={<FaTasks size={20} />}
                  label="Tasks"
                  href="/tasks"
                />
                <SidebarButton
                  icon={<FaCalendarAlt size={20} />}
                  label="Calendar"
                  href="/calendar"
                />
                <SidebarButton
                  icon={<FaPlusCircle size={20} />}
                  label="Add Task"
                  href="/form"
                />
                <SidebarButton
                  icon={<FaCog size={20} />}
                  label="Settings"
                  href="/settings"
                />
                <SidebarButton
                  icon={<FaSignOutAlt size={20} />}
                  label="Logout"
                  href="/logout"
                />
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// SidebarButton component for individual items
function SidebarButton({ icon, label, href }) {
  const { darkMode } = useDarkMode();
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`flex items-center p-3 rounded-lg transition-colors ${
          darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
        }`}
      >
        <span className="mr-4">{icon}</span>
        <span className="text-lg font-semibold">{label}</span>
      </motion.div>
    </Link>
  );
}
