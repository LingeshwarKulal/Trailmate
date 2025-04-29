import React from 'react';

const SimpleLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default SimpleLayout; 