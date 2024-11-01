// components/LoadingSpinner.jsx
export default function LoadingSpinner() {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="w-8 h-8 border-4 border-blue-500 border-solid border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  