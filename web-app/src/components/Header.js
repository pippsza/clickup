import React, { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const Header = ({ onSettingsOpen }) => {
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <header className="fade-in sticky top-0 z-50 backdrop-blur-md border-b" 
            style={{ 
              backgroundColor: 'var(--bg-primary)', 
              borderColor: 'var(--border-color)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              ClickUp Analytics
            </h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onSettingsOpen}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}
              title="Настройки"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: darkMode ? '#fbbf24' : '#4f46e5',
                color: 'white'
              }}
              title={darkMode ? 'Светлая тема' : 'Темная тема'}
            >
              {darkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
