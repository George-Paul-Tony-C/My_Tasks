'use client';
import { useEffect, useState } from 'react';
import { BsFillSunFill, BsMoonStarsFill } from 'react-icons/bs';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import LoadingSpinner from '../components/LoadingSpinner';
import TaskModal from '../components/TaskModal';
import { useDarkMode } from '../components/darkmode';

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export default function CalendarPage() {
    const [darkMode, toggleDarkMode] = useDarkMode();
  const [loading, setLoading] = useState(true);
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('all'); // Priority filter
  const [startDateFilter, setStartDateFilter] = useState(null);
  const [endDateFilter, setEndDateFilter] = useState(null);
  const today = new Date();

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (!loading && tasks.length >= 0) {
      generateCalendar(currentMonth, currentYear);
    }
  }, [currentMonth, currentYear, tasks, loading]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data.tasks || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setLoading(false);
    }
  };

  const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1));
    setCurrentYear((prev) => (currentMonth === 0 ? prev - 1 : prev));
  };

  const nextMonth = () => {
    setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1));
    setCurrentYear((prev) => (currentMonth === 11 ? prev + 1 : prev));
  };

  const generateCalendar = (month, year) => {
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = daysInMonth(month, year);
    const weeksArray = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      weeksArray.push(null);
    }

    for (let i = 1; i <= daysInCurrentMonth; i++) {
      weeksArray.push(new Date(year, month, i));
    }

    setCalendarDays(weeksArray);
  };

  const filterTasks = (tasks) => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.createdAt);
      const withinPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const withinStart = startDateFilter ? taskDate >= new Date(startDateFilter) : true;
      const withinEnd = endDateFilter ? taskDate <= new Date(endDateFilter) : true;
      return withinPriority && withinStart && withinEnd;
    });
  };

  const getTaskForDay = (day) => {
    const filteredTasks = filterTasks(tasks);
    return filteredTasks.filter((task) => {
      const allocatedDays = task.daysOfWeek || [];
      if (!day || allocatedDays.length === 0) return false;

      const dayOfWeekName = day.toLocaleString('en-US', { weekday: 'long' });
      const isTaskDay = allocatedDays.includes(dayOfWeekName);

      const startDate = new Date(task.createdAt);
      const weekDifference = Math.floor((day - startDate) / (7 * 24 * 60 * 60 * 1000));

      const withinWeeksLimit = weekDifference >= 0 && weekDifference < parseInt(task.weeks, 10);
      const notBeforeStartDate = day >= startDate;

      return isTaskDay && withinWeeksLimit && notBeforeStartDate;
    });
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (day) => {
    return (
      day &&
      day.getDate() === today.getDate() &&
      day.getMonth() === today.getMonth() &&
      day.getFullYear() === today.getFullYear()
    );
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task._id === updatedTask._id ? updatedTask : task))
    );
    setSelectedTask(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div
      className={`${
        darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'
      } min-h-screen transition duration-500`}
    >
      <div className="container mx-auto p-4 sm:p-8 min-h-screen">
        <div className="flex justify-end mb-4 sm:mb-6">
          <button
            className="p-2 rounded-full focus:outline-none transition hover:scale-110 transform"
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <BsFillSunFill className="text-yellow-400" size={24} />
            ) : (
              <BsMoonStarsFill className="text-blue-500" size={24} />
            )}
          </button>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-center mb-6 sm:mb-12">
          Real-Time Calendar
        </h1>

        {/* Filters */}
        <div className="flex justify-between mb-6 items-center">
          {/* Priority Filter */}
          <div>
            <label className="mr-2">Priority:</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border p-1 rounded text-gray-700"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="flex space-x-2 items-center">
            <div>
              <label className="mr-1">From:</label>
              <input
                type="date"
                value={startDateFilter || ''}
                onChange={(e) => setStartDateFilter(e.target.value)}
                className="border p-1 rounded text-gray-700"
              />
            </div>
            <div>
              <label className="mr-1">To:</label>
              <input
                type="date"
                value={endDateFilter || ''}
                onChange={(e) => setEndDateFilter(e.target.value)}
                className="border p-1 rounded text-gray-700"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <button
            onClick={prevMonth}
            className="text-lg p-2 bg-gray-300 hover:bg-gray-400 rounded-full transition-all hover:scale-110 shadow-lg hover:shadow-xl"
          >
            <FaChevronLeft size={24} />
          </button>
          <h2 className="text-xl sm:text-3xl font-semibold transition duration-300">
            {new Date(currentYear, currentMonth).toLocaleString('default', {
              month: 'long',
            })}{' '}
            {currentYear}
          </h2>
          <button
            onClick={nextMonth}
            className="text-lg p-2 bg-gray-300 hover:bg-gray-400 rounded-full transition-all hover:scale-110 shadow-lg hover:shadow-xl"
          >
            <FaChevronRight size={24} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {calendarDays.length === 0 ? (
            <p className="text-center col-span-7 text-gray-500">
              No tasks for this month. Create new tasks to get started!
            </p>
          ) : (
            calendarDays.map((day, index) => {
              const tasksForDay = getTaskForDay(day);
              const isCurrentMonthDay = day && day.getMonth() === currentMonth;

              return (
                <div
                  key={index}
                  className={`relative p-2 sm:p-4 rounded-lg shadow-md transition-transform transform hover:scale-105 duration-300 hover:shadow-xl ${
                    isToday(day)
                      ? 'bg-blue-500 text-white'
                      : darkMode
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-white border-gray-300'
                  } border ${!isCurrentMonthDay ? 'opacity-50' : ''}`}
                >
                  <h2 className="text-md sm:text-lg font-bold mb-1 sm:mb-2 transition duration-300">
                    {day ? day.getDate() : ''}
                  </h2>
                  <div className="space-y-1 sm:space-y-2">
                    {isCurrentMonthDay ? (
                      tasksForDay.length > 0 ? (
                        tasksForDay.map((task) => (
                          <div
                            key={task._id}
                            className={`text-xs sm:text-sm px-2 py-1 rounded-full text-white cursor-pointer ${priorityColors[task.priority]}`}
                            onClick={() => setSelectedTask(task)} // Set selected task to open modal
                          >
                            {task.activityName}
                            <Tooltip id={`task-tooltip-${task._id}`} place="top" effect="solid">
                              <div>
                                <p><strong>Task:</strong> {task.activityName}</p>
                                <p><strong>Duration:</strong> {task.activityDuration}</p>
                                <p><strong>Priority:</strong> {task.priority}</p>
                              </div>
                            </Tooltip>
                          </div>
                        ))
                      ) : (
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No tasks</p>
                      )
                    ) : null}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Render TaskModal when a task is selected */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
}

