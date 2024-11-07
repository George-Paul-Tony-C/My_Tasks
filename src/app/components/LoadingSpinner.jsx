// components/LoadingSpinner.jsx
export default function LoadingSpinner() {
    return (
      <div className="flex justify-center items-center h-full">
        {/* Three Dot Pulsing Spinner */}
        <div className="flex space-x-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-300"></div>
        </div>
      </div>
    );
}
