// src/app/profile/page.jsx

'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserEdit, FaUpload } from 'react-icons/fa';
import { useDarkMode } from '../components/DarkModeProvider';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import Image from 'next/image';
import PassportImage from '../images/Passport.JPG'; // Adjust the path as necessary

export default function ProfilePage() {
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const router = useRouter();

  useEffect(() => {
    // Fetch user data (replace with your API endpoint)
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user');
        const data = await res.json();
        setUser(data.user);
        setFormData(data.user);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEditToggle = () => {
    setEditing(!editing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    // Handle file upload logic here
    console.log('Selected file:', file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit updated user data to the backend
    try {
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser.user);
        setEditing(false);
        // Optionally show a success message
      } else {
        // Handle errors
        console.error('Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div
        className={`${
          darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'
        } min-h-screen p-6 flex items-center justify-center`}
      >
        <p>User data could not be loaded.</p>
      </div>
    );
  }

  return (
    <div
      className={`${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'
      } min-h-screen p-6`}
    >
      <div className="container mx-auto max-w-screen-md">
        <h1 className="text-4xl font-bold mb-6">My Profile</h1>
        <motion.div
          className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } p-8 rounded-2xl shadow-lg`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Profile Picture */}
          <div className="flex items-center mb-6">
            <div className="relative">
              <Image
                src={PassportImage}
                alt="Profile Picture"
                width={96} // 24 * 4 (Tailwind's 'w-24' class)
                height={96} // 24 * 4
                className="rounded-full object-cover"
              />
              {editing && (
                <label
                  htmlFor="profilePicture"
                  className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer"
                >
                  <FaUpload />
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                </label>
              )}
            </div>
            <div className="ml-6">
              <h2 className="text-3xl font-semibold">{user.name}</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
            <button
              onClick={handleEditToggle}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
            >
              <FaUserEdit className="inline mr-2" />
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Profile Form */}
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-lg font-medium mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter new password"
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-xl font-semibold">Name</h3>
                <p>{user.name}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold">Email</h3>
                <p>{user.email}</p>
              </div>
              {/* Additional user info can be displayed here */}
            </div>
          )}

          {/* User Statistics */}
          <div className="mt-10">
            <h2 className="text-2xl font-semibold mb-4">My Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className={`${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                } p-6 rounded-lg text-center`}
              >
                <h3 className="text-xl font-semibold">Total Tasks</h3>
                <p className="text-3xl font-bold mt-2">{user.totalTasks}</p>
              </div>
              <div
                className={`${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                } p-6 rounded-lg text-center`}
              >
                <h3 className="text-xl font-semibold">Tasks Completed</h3>
                <p className="text-3xl font-bold mt-2">{user.tasksCompleted}</p>
              </div>
              <div
                className={`${
                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                } p-6 rounded-lg text-center`}
              >
                <h3 className="text-xl font-semibold">Ongoing Tasks</h3>
                <p className="text-3xl font-bold mt-2">{user.tasksOngoing}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
