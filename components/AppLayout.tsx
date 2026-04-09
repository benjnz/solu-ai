import React from 'react';
import { useUser } from '../contexts/UserContext';
import LoadingAnimation from './LoadingAnimation';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isInitialized, loading, user } = useUser();

  // Wait until Firebase has initialized to render anything
  if (!isInitialized) {
    return <LoadingAnimation />;
  }

  // If it's still loading user data (e.g. after login), show loading
  if (loading) {
    return <LoadingAnimation />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg leading-6 font-semibold text-gray-900">
            SoluAI Blueprint
          </h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
