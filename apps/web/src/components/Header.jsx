import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Sun, Moon, User, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext.jsx';
import { useAuth } from '@/contexts/AuthContext.jsx';

const Header = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1a3a52] to-[#ff6b35] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">SO</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-[#1a3a52] dark:text-white">SMART OSH</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Risk Analysis System</p>
            </div>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-yellow-500" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-[#ff6b35] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
                {currentUser?.name || currentUser?.email || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {currentUser?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;