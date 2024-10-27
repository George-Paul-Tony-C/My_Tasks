'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import { BsFillSunFill, BsMoonStarsFill } from 'react-icons/bs';

export default function CreateActivity() {
  const [activityName, setActivityName] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [weeks, setWeeks] = useState('');
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [priority, setPriority] = useState('medium'); // Priority state
  const [hydrated, setHydrated] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
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
      body: JSON.stringify({ activityName, activityDuration, weeks, daysOfWeek, priority }), // Include priority in request
    });

    if (res.ok) {
      toast.success('Activity created successfully!');
      setActivityName('');
      setHours('');
      setMinutes('');
      setSeconds('');
      setWeeks('');
      setDaysOfWeek([]);
      setPriority('medium'); // Reset priority
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } else {
      const data = await res.json();
      toast.error(data.error);
    }
  };

  if (!hydrated) return null;

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen flex flex-col items-center transition duration-500`}>
      <Toaster />
      <div className="w-full max-w-3xl p-10 mt-10 rounded-lg shadow-xl border border-gray-200 dark:border-gray-800 transition duration-500">
        <div className="flex justify-end mb-4">
          <button onClick={() => setDarkMode(!darkMode)} className="text-2xl">
            {darkMode ? <BsFillSunFill className="text-yellow-400" /> : <BsMoonStarsFill className="text-blue-500" />}
          </button>
        </div>
        <h1 className={`text-4xl font-extrabold text-center mb-8 ${darkMode ? 'text-gray-100' : 'text-gray-800'} transition duration-500`}>
          Create a New Activity
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Activity Name */}
          <div>
            <label className={`block text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Activity Name</label>
            <input
              type="text"
              className={`border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-300'} rounded-lg w-full p-3 focus:outline-none focus:ring focus:ring-blue-500 transition`}
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="Enter activity name"
              required
            />
          </div>

          {/* Activity Duration */}
          <div>
            <label className={`block text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Activity Duration</label>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Hours', value: hours, setValue: setHours, placeholder: '00', max: '24' },
                { label: 'Minutes', value: minutes, setValue: setMinutes, placeholder: '00', max: '59' },
                { label: 'Seconds', value: seconds, setValue: setSeconds, placeholder: '00', max: '59' },
              ].map((timeUnit) => (
                <div key={timeUnit.label}>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{timeUnit.label}</label>
                  <input
                    type="number"
                    className={`border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-300'} rounded-lg w-full p-3 focus:outline-none focus:ring focus:ring-blue-500 transition`}
                    value={timeUnit.value}
                    onChange={(e) => timeUnit.setValue(e.target.value)}
                    placeholder={timeUnit.placeholder}
                    min="0"
                    max={timeUnit.max}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Number of Weeks */}
          <div>
            <label className={`block text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>Number of Weeks</label>
            <input
              type="number"
              className={`border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-300'} rounded-lg w-full p-3 focus:outline-none focus:ring focus:ring-blue-500 transition`}
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
              placeholder="Enter number of weeks"
              min="1"
              required
            />
          </div>

          {/* Days of the Week */}
          <div>
            <label className={`block text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Days of the Week</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                <button
                  key={day}
                  type="button"
                  className={`px-3 py-2 rounded-lg transition focus:outline-none focus:ring-2 ${daysOfWeek.includes(day) ? 'bg-blue-600 text-white' : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}`}
                  onClick={() => handleCheckboxChange(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Field */}
          <div>
            <label className={`block text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className={`border ${darkMode ? 'border-gray-700 bg-gray-800 text-gray-200' : 'border-gray-300'} rounded-lg w-full p-3 focus:outline-none focus:ring focus:ring-blue-500 transition`}
              required
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-4 py-3 rounded-lg shadow-md transition transform hover:-translate-y-1 focus:ring-2 focus:ring-blue-500"
            >
              Create Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
