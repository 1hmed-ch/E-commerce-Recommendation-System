// src/pages/LandingPage/components/StatusBanner.jsx
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

const StatusBanner = ({ status, networkError, onRetry }) => {
  if (status === "connected") return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-4xl px-4">
      <div className={`p-4 rounded-xl shadow-lg ${
        status === "disconnected"
          ? "bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200"
          : "bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${
              status === "disconnected" ? "bg-yellow-100" : "bg-blue-100"
            }`}>
              {status === "disconnected" ? (
                <FiAlertCircle className="text-yellow-600 text-xl" />
              ) : (
                <FiRefreshCw className="text-blue-600 text-xl animate-spin" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {status === "disconnected" ? "Backend Not Available" : "Connecting..."}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {status === "disconnected"
                  ? `Error: ${networkError}`
                  : "Establishing connection to server..."
                }
              </p>
            </div>
          </div>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusBanner;