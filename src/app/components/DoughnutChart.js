import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

export default function DoughnutChart({ completionRate, darkMode }) {
  const chartData = {
    labels: ['Completed', 'Remaining'],
    datasets: [
      {
        data: [completionRate, 100 - completionRate],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // Green
          'rgba(200, 200, 200, 0.8)', // Transparent White
        ],
        hoverBackgroundColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(255, 255, 255, 0.3)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    cutout: '80%',
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
    animation: {
      duration: 2000,
      easing: 'easeInOutQuad',
    },
  };

  return (
    <div className="relative flex items-center justify-center">
      <div className="w-56 h-56">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
      <div className="absolute flex flex-col items-center">
        <span
          className={`text-4xl font-extrabold mt-16 ${
            darkMode ? 'text-green-400' : 'text-green-500'
          }`}
        >
          {completionRate}%
        </span>
        <span className={`text-lg mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Completion
        </span>
      </div>
    </div>
  );
}
