import React from 'react'
import { ThemeProvider } from './components/theme-provider'
import { ThemeToggle } from './components/ui/theme-toggle'
import { ManagementPage } from './pages/ManagementPage'

export const App: React.FC = () => {
  return (
    <ThemeProvider defaultTheme="light" storageKey="management-ui-theme">
      <div className="min-h-screen">
        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>
        <main>
          <ManagementPage />
        </main>
      </div>
    </ThemeProvider>
  );
};
