/**
 * App - Main application entry point
 */

import { useState } from 'react';
import { ThemeProvider } from './packages/theme';
import { AuthProvider } from './packages/auth';
import { ToastContainer } from './packages/ui';
import { MainLayout } from './app/layouts/MainLayout';
import { HomePage } from './app/pages/HomePage';
import { ProfilePage } from './app/pages/ProfilePage';
import { config } from './app/config';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <ThemeProvider defaultMode="system">
      <AuthProvider apiBaseUrl={config.api.baseUrl}>
        <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
          {renderPage()}
        </MainLayout>
        <ToastContainer />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
