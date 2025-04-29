import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Quiz from './components/Quiz/Quiz';
import GearRecommendations from './components/GearRecommendations/GearRecommendations';
import Auth from './components/Auth/Auth';
import { useApp } from './context/AppContext';
import Background3D from './components/Background3D';

const AppContent: React.FC = () => {
  const { recommendedGear, user } = useApp();
  const [showAuth, setShowAuth] = useState(false);

  return (
    <div className="min-h-screen relative">
      <Background3D />
      <div className="relative z-10">
        <header className="bg-white/80 backdrop-blur-sm shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">TrailMate</h1>
            <div>
              {user ? (
                <div className="flex items-center">
                  {user.photoURL && (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full mr-2"
                    />
                  )}
                  <span className="mr-4">{user.displayName || user.email}</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {showAuth ? (
            <Auth />
          ) : recommendedGear.length > 0 ? (
            <GearRecommendations items={recommendedGear} />
          ) : (
            <Quiz />
          )}
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App; 