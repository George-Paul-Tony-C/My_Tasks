"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from './DarkModeProvider';
import { FaHome, FaTasks, FaCalendarAlt, FaPlusCircle, FaBars, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const { darkMode } = useDarkMode();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Toggle Button (Fixed Position on Top) */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-4 left-4 p-2 z-20 rounded-full transition-colors duration-300 ${darkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-200 text-gray-800'}`}
      >
        <FaBars size={24} />
      </button>

      {/* Sidebar with Slide Animation */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleSidebar} // Close sidebar when clicking on overlay
            />

            {/* Sidebar */}
            <motion.aside
              initial={{ x: -250 }}
              animate={{ x: 0 }}
              exit={{ x: -250 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`fixed top-0 left-0 h-full w-64 p-4 z-20 ${darkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-50 text-gray-800'} shadow-lg`}
            >
              {/* Close Button Inside Sidebar */}
              <button
                onClick={toggleSidebar}
                className="absolute top-4 right-4 p-2 rounded-full"
              >
                <FaTimes size={20} />
              </button>

              {/* Navigation Menu */}
              <nav className="mt-16 space-y-6">
                <SidebarButton
                  icon={<FaHome size={20} />}
                  label="Home"
                  onClick={() => {
                    router.push('/');
                    toggleSidebar();
                  }}
                />
                <SidebarButton
                  icon={<FaTasks size={20} />}
                  label="Tasks"
                  onClick={() => {
                    router.push('/tasks');
                    toggleSidebar();
                  }}
                />
                <SidebarButton
                  icon={<FaCalendarAlt size={20} />}
                  label="Calendar"
                  onClick={() => {
                    router.push('/calendar');
                    toggleSidebar();
                  }}
                />
                <SidebarButton
                  icon={<FaPlusCircle size={20} />}
                  label="Add Task"
                  onClick={() => {
                    router.push('/form');
                    toggleSidebar();
                  }}
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
function SidebarButton({ icon, label, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      className="flex items-center p-3 rounded-lg transition transform hover:scale-105 justify-start"
    >
      <span className="mr-4">{icon}</span>
      <span className="text-lg font-semibold">{label}</span>
    </motion.button>
  );
}
