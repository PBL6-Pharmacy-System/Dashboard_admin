import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-12 w-full max-w-md text-center">
        <div className="mb-8">
          <div className="relative inline-block">
            {/* Browser window mockup */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-8 shadow-lg">
              {/* Browser tabs */}
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              
              {/* 404 Display */}
              <div className="text-center">
                <h1 className="text-8xl font-bold text-orange-400 mb-4">404</h1>
                <div className="flex justify-center items-center gap-4 text-white">
                  <div className="flex gap-1">
                    <div className="w-8 h-1 bg-white rounded"></div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Looks like you've got lost....
        </h2>

        <button
          onClick={handleBackToDashboard}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default NotFound;
