// src/app/settings/page.jsx

'use client';
import { useState, useEffect } from 'react';
import { useDarkMode } from '../components/DarkModeProvider';
import { Switch } from '@headlessui/react';
import { FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    darkMode: darkMode,
    autoStartTasks: false,
    privacy: 'friends',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user settings (replace with your API endpoint)
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        setSettings(data.settings);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
    if (key === 'darkMode') {
      toggleDarkMode();
    }
  };

  const handleSelectChange = (e) => {
    setSettings({ ...settings, privacy: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Submit updated settings to the backend
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        // Optionally show a success message
        console.log('Settings updated successfully');
      } else {
        // Handle errors
        console.error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  return loading ? (
    <div className="flex justify-center items-center min-h-screen">
      <motion.div
        className="loader rounded-full border-t-4 border-blue-500 h-16 w-16"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1 }}
      ></motion.div>
    </div>
  ) : (
    <div
      className={`${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'
      } min-h-screen p-6`}
    >
      <div className="container mx-auto max-w-screen-md">
        <h1 className="text-4xl font-bold mb-6">Settings</h1>
        <motion.form
          onSubmit={handleSubmit}
          className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } p-8 rounded-2xl shadow-lg space-y-6`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Notification Settings */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
            <div className="flex items-center justify-between mb-4">
              <p>Email Notifications</p>
              <Switch
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                className={`${
                  settings.emailNotifications ? 'bg-green-500' : 'bg-gray-300'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>
            <div className="flex items-center justify-between">
              <p>Push Notifications</p>
              <Switch
                checked={settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
                className={`${
                  settings.pushNotifications ? 'bg-green-500' : 'bg-gray-300'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>
          </div>

          {/* Preferences */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Preferences</h2>
            <div className="flex items-center justify-between mb-4">
              <p>Dark Mode</p>
              <Switch
                checked={settings.darkMode}
                onChange={() => handleToggle('darkMode')}
                className={`${
                  settings.darkMode ? 'bg-green-500' : 'bg-gray-300'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>
            <div className="flex items-center justify-between">
              <p>Auto-Start Tasks</p>
              <Switch
                checked={settings.autoStartTasks}
                onChange={() => handleToggle('autoStartTasks')}
                className={`${
                  settings.autoStartTasks ? 'bg-green-500' : 'bg-gray-300'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span
                  className={`${
                    settings.autoStartTasks ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>
          </div>

          {/* Privacy Settings */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Privacy</h2>
            <div>
              <label className="block mb-2">Profile Visibility</label>
              <select
                value={settings.privacy}
                onChange={handleSelectChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="friends">Friends Only</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition"
            >
              <FaSave className="inline mr-2" />
              Save Settings
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
