import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function BarChart({
  completedTasksCount = 0,
  totalTasksCount = 0,
  ongoingTasksCount = 0,
  darkMode,
}) {
  if (!totalTasksCount && !completedTasksCount && !ongoingTasksCount) {
    return <p className="text-center">No data available to display.</p>;
  }

  const barChartData = {
    labels: ['Total', 'Completed', 'Ongoing'],
    datasets: [
      {
        label: 'Tasks',
        data: [totalTasksCount, completedTasksCount, ongoingTasksCount],
        backgroundColor: [
          'rgba(59, 130, 246, 0.5)', // Blue
          'rgba(34, 197, 94, 0.5)',  // Green
          'rgba(245, 158, 11, 0.5)', // Yellow
        ],
        hoverBackgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(34, 197, 94, 0.7)',
          'rgba(245, 158, 11, 0.7)',
        ],
        borderRadius: 12,
        borderSkipped: false,
        barThickness: 40,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      tooltip: {
        enabled: true,
        backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        titleColor: darkMode ? '#f9fafb' : '#1f2937',
        bodyColor: darkMode ? '#f9fafb' : '#1f2937',
        borderWidth: 1,
        borderColor: darkMode ? 'rgba(75, 85, 99, 0.5)' : 'rgba(209, 213, 219, 0.5)',
        cornerRadius: 8,
        padding: 10,
        caretSize: 6,
        displayColors: false,
      },
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
        ticks: {
          color: darkMode ? '#f9fafb' : '#1f2937',
          font: {
            size: 14,
          },
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: darkMode ? '#f9fafb' : '#1f2937',
          font: {
            size: 14,
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeOutElastic',
    },
  };

  return (
    <div className="relative h-64">
      <Bar data={barChartData} options={chartOptions} />
    </div>
  );
}
