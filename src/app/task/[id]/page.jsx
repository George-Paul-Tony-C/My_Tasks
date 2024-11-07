'use client';
import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FaPlay, FaPause, FaStop, FaArrowLeft } from 'react-icons/fa';
import { useDarkMode } from '@/app/components/DarkModeProvider';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { motion } from 'framer-motion';

export default function TaskDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDayIndex, setCurrentDayIndex] = useState(-1);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);

  const getDayIndex = (task, currentDate) => {
    const createdAt = new Date(task.createdAt);
    const dayDifference = Math.floor(
      (currentDate - createdAt) / (24 * 60 * 60 * 1000)
    );
    const weekIndex = Math.floor(dayDifference / 7);
    const weekdayIndex = task.daysOfWeek.indexOf(
      currentDate.toLocaleDateString('en-US', { weekday: 'long' })
    );
    return weekdayIndex === -1 || weekIndex >= task.weeks
      ? -1
      : weekIndex * task.daysOfWeek.length + weekdayIndex;
  };

  useEffect(() => {
    const fetchTask = async () => {
      const res = await fetch(`/api/tasks/${id}`);
      const data = await res.json();
      setTask(data.task);
      setLoading(false);

      const dayIndex = getDayIndex(data.task, new Date());
      setCurrentDayIndex(dayIndex);

      if (dayIndex !== -1 && data.task.totalTimeSpent[dayIndex]) {
        const timeSpentInSeconds = data.task.totalTimeSpent[dayIndex]
          .split(':')
          .reduce((acc, time) => 60 * acc + +time, 0);
        setTimeSpent(timeSpentInSeconds);
      }
    };
    fetchTask();
  }, [id]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setTimeSpent((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning]);

  const handleStart = () => {
    setTimerRunning(true);
    // TODO: Add code to update task status to running in the backend
  };

  const handlePause = () => {
    setTimerRunning(false);
    // TODO: Add code to update task status to paused in the backend
  };

  const handleStop = () => {
    setTimerRunning(false);
    // TODO: Add code to mark task as completed in the backend
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const secs = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const totalDurationInSeconds = task
    ? task.activityDuration
        .split(':')
        .reduce((acc, time) => 60 * acc + +time, 0)
    : 0;

  const progressPercentage =
    totalDurationInSeconds > 0
      ? Math.min((timeSpent / totalDurationInSeconds) * 100, 100)
      : 0;

  return loading ? (
    <LoadingSpinner />
  ) : (
    <div
      className={`${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'
      } min-h-screen p-6`}
    >
      <div className="container mx-auto max-w-screen-md">
        <button
          onClick={() => router.back()}
          className="flex items-center mb-4 text-blue-500 hover:text-blue-400"
        >
          <FaArrowLeft className="mr-2" /> Back
        </button>

        <motion.div
          className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } p-6 rounded-2xl shadow-lg`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold mb-4">{task.activityName}</h1>
          <p className="text-lg mb-2">
            <span className="font-semibold">Description:</span>{' '}
            {task.description || 'No description provided.'}
          </p>
          <p className="text-lg mb-2">
            <span className="font-semibold">Duration:</span>{' '}
            {task.activityDuration}
          </p>
          <p className="text-lg mb-2">
            <span className="font-semibold">Days of Week:</span>{' '}
            {task.daysOfWeek.join(', ')}
          </p>
          <p className="text-lg mb-4">
            <span className="font-semibold">Weeks:</span> {task.weeks}
          </p>

          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-lg">
                <span className="font-semibold">Time Spent Today:</span>{' '}
                {formatTime(timeSpent)}
              </p>
            </div>
            <div className="flex space-x-2">
              {!timerRunning ? (
                <button
                  onClick={handleStart}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-400 transition"
                >
                  <FaPlay className="inline mr-2" /> Start
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-400 transition"
                >
                  <FaPause className="inline mr-2" /> Pause
                </button>
              )}
              <button
                onClick={handleStop}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-400 transition"
              >
                <FaStop className="inline mr-2" /> Stop
              </button>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Progress Overview</h2>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-right mt-2">
              {progressPercentage.toFixed(2)}% completed
            </p>
          </div>

          {/* Additional Task Details */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Additional Details</h2>
            {/* You can add more task-specific details here */}
            <p className="text-lg">
              <span className="font-semibold">Created At:</span>{' '}
              {new Date(task.createdAt).toLocaleString()}
            </p>
            {/* Add more fields as necessary */}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
